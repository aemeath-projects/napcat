/** SSE Transport 实现：事件接收走 GET /_events SSE 连接，API 调用走 HTTP POST。 */
import { TypedEventEmitter, TransportError } from '../core'
import type { ApiResponse, OneBotEvent, TransportEventMap } from '../types'
import { snakeToCamel } from '../utils'

import { ConnectionLifecycleManager } from './connection-lifecycle.js'
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
  /** 距离上次收到任意数据的空闲超时（ms），超过判定连接假死并主动断开。默认 60000。 */
  idleTimeoutMs?: number
}

/** SSE Transport：事件接收走 GET /_events，API 调用走 HTTP POST。 */
export class SseTransport extends TypedEventEmitter<SseTransportEventMap> implements Transport {
  private _state: TransportState = 'disconnected'
  private _abortController: AbortController | null = null
  private _intentionalClose = false
  private _reconnectPolicy: ReconnectPolicy | null = null
  private readonly _lifecycle: ConnectionLifecycleManager
  private _idleTimer: ReturnType<typeof setTimeout> | null = null

  private readonly _baseUrl: string
  private readonly _token: string | undefined
  private readonly _reconnectOpts: ReconnectOptions | undefined
  private readonly _idleTimeoutMs: number

  constructor(opts: SseTransportOptions) {
    super()
    this._baseUrl = opts.baseUrl.replace(/\/$/, '')
    this._token = opts.token
    this._reconnectOpts = opts.reconnect
    this._idleTimeoutMs = opts.idleTimeoutMs ?? 60000
    if (opts.reconnect) {
      this._reconnectPolicy = new ReconnectPolicy(opts.reconnect)
    }
    this._lifecycle = new ConnectionLifecycleManager(this._reconnectPolicy)
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
    const connectionId = this._lifecycle.nextConnectionId()

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
    this._lifecycle.armStableResetTimer()

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

    this._armIdleTimer(connectionId)

    try {
      for (;;) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { done, value } = await reader.read()
        if (done) break
        this._armIdleTimer(connectionId) // 收到任意数据，重置空闲计时

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
      // 只有当前连接 ID 匹配时才清理空闲计时器 / 处理断开逻辑，避免旧流的 finally
      // 覆盖新连接的状态——_idleTimer 是单个共享字段，若不做这个保护，一个过期
      // 连接的收尾清理会把刚建立的新连接的空闲计时器清掉，导致新连接的僵尸检测
      // 永久失效（没有任何后续数据读取会重新安排这个定时器）。
      //
      // 未覆盖自动化测试的说明：这个竞态要求"旧连接的 finally 在新连接已经安排好
      // 定时器之后才执行"。本仓库内部的重连调度（_scheduleReconnect）总是先
      // setTimeout 延迟再调用 connect()，旧流的 finally 必然先于延迟后的 connect()
      // 完成，天然不会与之重叠；只有外部代码在旧流还没结束时又手动调用一次
      // connect() 才会暴露这个竞态——当前代码库没有任何调用点会这样做。用确定性
      // 方式构造这个已经很窄的竞态需要控制内部字段或注入可控制的 ReadableStream，
      // 会偏离本文件"真实 mock server + 真实定时器"的黑盒集成测试风格，权衡后选择
      // 只保留这段防御性代码本身，不强行补一个测不到点上的测试。
      if (this._lifecycle.connectionId === connectionId) {
        this._clearIdleTimer()
      } else {
        shouldHandleClose = false
      }
    }

    if (shouldHandleClose) {
      if (this._state === 'connected') {
        this._state = 'disconnected'
      }
      this._lifecycle.clearStableResetTimer()
      if (!this._intentionalClose) {
        this.emit('close')
        this._scheduleReconnect()
      }
    }
  }

  /**
   * 重新安排空闲超时定时器（每次收到任意数据都调用一次以重置计时）。
   * 超时未收到任何数据视为连接假死，主动中断当前流触发既有 close → 重连链路。
   */
  private _armIdleTimer(connectionId: number): void {
    this._clearIdleTimer()
    this._idleTimer = setTimeout(() => {
      if (this._lifecycle.connectionId !== connectionId) return
      this._abortController?.abort()
    }, this._idleTimeoutMs)
  }

  /** 取消挂起的空闲超时定时器（若有）。 */
  private _clearIdleTimer(): void {
    if (this._idleTimer) {
      clearTimeout(this._idleTimer)
      this._idleTimer = null
    }
  }

  /** 按 ReconnectPolicy 安排下次重连。 */
  private _scheduleReconnect(): void {
    const snapshotId = this._lifecycle.connectionId
    this._lifecycle.scheduleReconnect({
      // 连接 ID 已变说明有新的主动连接，跳过此次重连
      isExpired: () => this._intentionalClose || this._lifecycle.connectionId !== snapshotId,
      doConnect: () => this.connect(),
      onReconnecting: (attempt, delay) => {
        // 进入退避等待窗口：state 从这一刻起是 reconnecting，而不是停留在 disconnected。
        this._state = 'reconnecting'
        this.emit('reconnecting', attempt, delay)
      },
      onGiveUp: () => this.emit('giveUp'),
      onError: (err) => {
        this.emit(
          'error',
          new TransportError(`SSE 重连失败：${err instanceof Error ? err.message : String(err)}`),
        )
      },
    })
  }

  /** 断开 SSE 连接，state → disconnected。 */
  async disconnect(): Promise<void> {
    this._intentionalClose = true
    this._lifecycle.clearStableResetTimer()
    this._clearIdleTimer()
    this._abortController?.abort()
    this._abortController = null
    this._state = 'disconnected'
    this.emit('close')
  }

  async call(action: string, params: Record<string, unknown>): Promise<ApiResponse> {
    return apiCall(this._baseUrl, action, params, this._token)
  }
}
