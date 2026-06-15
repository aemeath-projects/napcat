/** SSE Transport 实现：事件接收走 GET /_events SSE 连接，API 调用走 HTTP POST。 */
import { TypedEventEmitter, TransportError } from '../core'
import type { ApiResponse, OneBotEvent, TransportEventMap } from '../types'

import { apiCall } from './http-client.js'
import type { ITransport, TransportState } from './interface.js'
import { ReconnectPolicy, type ReconnectOptions } from './reconnect.js'

/** SseTransport 扩展事件映射，增加 reconnecting 事件。 */
export interface SseTransportEventMap extends TransportEventMap {
  reconnecting: (attempt: number, delay: number) => void
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
export class SseTransport extends TypedEventEmitter<SseTransportEventMap> implements ITransport {
  private _state: TransportState = 'disconnected'
  private _abortController: AbortController | null = null
  private _intentionalClose = false
  private _reconnectPolicy: ReconnectPolicy | null = null
  private _connectionId = 0

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
      throw new TransportError(`SSE 连接失败：${err instanceof Error ? err.message : String(err)}`)
    }

    if (!resp.ok) {
      this._state = 'disconnected'
      throw new TransportError(`SSE 连接失败：HTTP ${resp.status.toString()}`)
    }

    this._state = 'connected'
    this._reconnectPolicy?.reset()

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
              const event = JSON.parse(raw) as OneBotEvent
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
      if (!this._intentionalClose) {
        this.emit('close')
        this._scheduleReconnect()
      }
    }
  }

  /** 按 ReconnectPolicy 安排下次重连。 */
  private _scheduleReconnect(): void {
    if (!this._reconnectPolicy?.canRetry()) return
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
    this._abortController?.abort()
    this._abortController = null
    this._state = 'disconnected'
    this.emit('close')
  }

  async call(action: string, params: Record<string, unknown>): Promise<ApiResponse> {
    return apiCall(this._baseUrl, action, params, this._token)
  }
}
