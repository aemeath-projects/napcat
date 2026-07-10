/** SSE Transport 实现：事件接收走 GET /_events SSE 连接，API 调用走 HTTP POST。 */
import { TypedEventEmitter, TransportError } from '../core'
import type { ApiResponse, OneBotEvent, TransportEventMap } from '../types'
import { snakeToCamel } from '../utils'

import { apiCall } from './http-client.js'
import type { Transport, TransportState } from './interface.js'
import { ReconnectPolicy, type ReconnectOptions } from './reconnect.js'

/** SseTransport 扩展事件映射，增加 reconnecting/giveUp 事件。 */
export interface SseTransportEventMap extends TransportEventMap {
  reconnecting: (attempt: number, delay: number) => void
  giveUp: () => void
}

/** SseTransport 构造参数。 */
export interface SseTransportOptions {
  /** NapCat SSE 基础地址，如 http://127.0.0.1:3000 */
  baseUrl: string
  /** NapCat access token，非空时附加到 Authorization header */
  token?: string
  /** 断线重连配置，不传则不自动重连 */
  reconnect?: ReconnectOptions
}

/** SSE Transport：事件接收走 GET /_events，API 调用走 HTTP POST。 */
export class SseTransport extends TypedEventEmitter<SseTransportEventMap> implements Transport {
  private _state: TransportState = 'disconnected'
  private _abortController: AbortController | null = null
  private _intentionalClose = false
  private _reconnectPolicy: ReconnectPolicy | null = null
  private _connectionId = 0
  private _stableResetTimer: ReturnType<typeof setTimeout> | null = null

  private readonly _baseUrl: string
  private readonly _token: string | undefined
  private readonly _reconnectOpts: ReconnectOptions | undefined

  constructor(opts: SseTransportOptions) {
    super()
    this._baseUrl = opts.baseUrl.replace(/\/$/, '')
    this._token = opts.token
    this._reconnectOpts = opts.reconnect
    if (opts.reconnect) {
      this._reconnectPolicy = new ReconnectPolicy(opts.reconnect)
    }
  }

  get state(): TransportState {
    return this._state
  }

  /**
   * 建立 SSE 连接。
   * 连接成功（HTTP 200）后 emit('connect')，state → connected。
   * 异步读取 SSE 流，不阻塞调用方。
   */
  async connect(): Promise<void> {
    this._intentionalClose = false
    this._state = 'connecting'
    this._abortController = new AbortController()
    const connectionId = ++this._connectionId

    const url = `${this._baseUrl}/_events`
    const headers: Record<string, string> = { Accept: 'text/event-stream' }
    if (this._token) {
      headers.Authorization = `Bearer ${this._token}`
    }

    // 注意：此处保留 fetch 而非使用 axios，因为 SSE 需要流式读取 resp.body.getReader()，
    // axios 不支持流式响应体。
    let resp: Response
    try {
      resp = await fetch(url, {
        headers,
        signal: this._abortController.signal,
      })
    } catch (err) {
      this._state = 'disconnected'
      if ((err as Error).name === 'AbortError') return
      // 连接尝试本身失败（无论是首次 connect() 还是 _scheduleReconnect 安排的重试）
      // 都要继续安排下一次重连，否则一旦某次重试失败就会永久停在 disconnected，
      // 既不会继续退避重试也不会走到 giveUp——与 WebSocketTransport 的行为对齐
      // （其底层 ws 库在连接失败时同样会触发 close 事件进而重新安排重连）。disconnect()
      // 可能在上面的 await fetch() 期间被并发调用并把 _intentionalClose 置为 true，
      // 类型检查器看不到这种跨 await 的并发修改，误判为"恒为 false"。
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!this._intentionalClose && this._reconnectPolicy) {
        this._scheduleReconnect()
      }
      throw new TransportError(`SSE 连接失败：${err instanceof Error ? err.message : String(err)}`)
    }

    if (!resp.ok) {
      this._state = 'disconnected'
      // 同上：disconnect() 可能在 await fetch() 期间并发把 _intentionalClose 置为 true。
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!this._intentionalClose && this._reconnectPolicy) {
        this._scheduleReconnect()
      }
      throw new TransportError(`SSE 连接失败：HTTP ${resp.status.toString()}`)
    }

    this._state = 'connected'
    this._armStableResetTimer()

    // setTimeout(0) 推迟 emit 到下一个宏任务：
    // connect() 先 resolve → 调用方注册 once('connect', ...) → 宏任务触发 emit
    setTimeout(() => {
      this.emit('connect')
      void this._readSseStream(resp, connectionId)
    }, 0)
  }

  /** 读取并解析 SSE 流，断开后触发 close 及重连逻辑。 */
  private async _readSseStream(resp: Response, connectionId: number): Promise<void> {
    const reader = resp.body?.getReader()
    if (reader == null) return

    const decoder = new TextDecoder()
    let buffer = ''
    let shouldHandleClose = true

    try {
      for (;;) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value as Uint8Array, { stream: true })

        // 按行分割，保留未完成行到 buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.slice(6)
            try {
              const event = snakeToCamel(JSON.parse(raw)) as OneBotEvent
              this.emit('event', event)
            } catch {
              // 忽略 JSON 解析失败的行
            }
          }
        }
      }
    } catch (err: unknown) {
      const errName = err instanceof Error ? err.name : ''
      const errMsg = err instanceof Error ? err.message : ''
      // AbortError 是主动断开，terminated/socket hang up 是正常断线，均不 emit error
      const isNormalClose =
        errName === 'AbortError' ||
        errMsg === 'terminated' ||
        errMsg.includes('socket hang up') ||
        errMsg.includes('This operation was aborted')
      if (!isNormalClose) {
        this.emit(
          'error',
          new TransportError(`SSE 流读取错误：${err instanceof Error ? err.message : String(err)}`),
        )
      }
    } finally {
      reader.releaseLock()
      // 只有当前连接 ID 匹配时才处理断开逻辑，避免旧流 finally 覆盖新连接状态
      if (this._connectionId !== connectionId) {
        shouldHandleClose = false
      }
    }

    if (shouldHandleClose) {
      if (this._state === 'connected') {
        this._state = 'disconnected'
      }
      this._clearStableResetTimer()
      if (!this._intentionalClose) {
        this.emit('close')
        this._scheduleReconnect()
      }
    }
  }

  /**
   * 连接成功后，等待连接维持满 reconnectPolicy.stableAfterMs 才清零重连计数器；
   * 期间若再次断开（_readSseStream 会调用 _clearStableResetTimer）则取消，
   * 避免疯狂闪断、从未真正稳定过的连接因为短暂的重连成功而无限重试、永远不耗尽预算。
   */
  private _armStableResetTimer(): void {
    if (!this._reconnectPolicy) return
    this._clearStableResetTimer()
    this._stableResetTimer = setTimeout(() => {
      this._reconnectPolicy?.reset()
      this._stableResetTimer = null
    }, this._reconnectPolicy.stableAfterMs)
  }

  /** 取消待触发的稳定期清零定时器（若有）。 */
  private _clearStableResetTimer(): void {
    if (this._stableResetTimer) {
      clearTimeout(this._stableResetTimer)
      this._stableResetTimer = null
    }
  }

  /** 按 ReconnectPolicy 安排下次重连。 */
  private _scheduleReconnect(): void {
    if (!this._reconnectPolicy?.canRetry()) {
      if (this._reconnectPolicy) this.emit('giveUp')
      return
    }
    const attempt = this._reconnectPolicy.attempts + 1
    const delay = this._reconnectPolicy.nextDelay()
    const snapshotId = this._connectionId
    this.emit('reconnecting', attempt, delay)
    setTimeout(() => {
      // 连接 ID 已变说明有新的主动连接，跳过此次重连
      if (this._intentionalClose || this._connectionId !== snapshotId) return
      this.connect().catch((err: unknown) => {
        this.emit(
          'error',
          new TransportError(`SSE 重连失败：${err instanceof Error ? err.message : String(err)}`),
        )
      })
    }, delay)
  }

  /** 断开 SSE 连接，state → disconnected。 */
  async disconnect(): Promise<void> {
    this._intentionalClose = true
    this._clearStableResetTimer()
    this._abortController?.abort()
    this._abortController = null
    this._state = 'disconnected'
    this.emit('close')
  }

  async call(action: string, params: Record<string, unknown>): Promise<ApiResponse> {
    return apiCall(this._baseUrl, action, params, this._token)
  }
}
