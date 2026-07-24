/** 正向 WebSocket 连接 Transport 实现。 */
import { randomUUID } from 'node:crypto'

import { WebSocket } from 'ws'

import { TypedEventEmitter, TransportError, TimeoutError } from '../core'
import type { ApiResponse, TransportEventMap } from '../types'

import { ConnectionLifecycleManager } from './connection-lifecycle.js'
import type { Transport, TransportState } from './interface.js'
import { handleIncomingMessage, type PendingCall } from './message.js'
import { ReconnectPolicy, type ReconnectOptions } from './reconnect.js'

/** WebSocketTransport 扩展事件映射，增加 reconnecting/giveUp 事件。 */
export interface WsTransportEventMap extends TransportEventMap {
  reconnecting: (attempt: number, delay: number) => void
  giveUp: () => void
}

/** WebSocketTransport 构造参数。 */
export interface WebSocketTransportOptions {
  /** WebSocket 服务器地址，如 ws://127.0.0.1:3001 */
  url: string
  /** NapCat access token，非空时附加到 URL 查询参数 */
  token?: string
  /** API 调用超时（ms），默认 10000 */
  timeout?: number
  /** 重连策略配置，不传则不自动重连 */
  reconnect?: ReconnectOptions
  /** 心跳 ping 间隔（ms），用于检测假死连接。默认 25000。 */
  pingIntervalMs?: number
  /** 发送 ping 后等待 pong 的超时时间（ms），超时判定连接假死并主动断开。默认 10000。 */
  pongTimeoutMs?: number
}

/** 正向 WebSocket Transport：客户端主动连接 NapCat。 */
export class WebSocketTransport
  extends TypedEventEmitter<WsTransportEventMap>
  implements Transport
{
  private readonly _url: string
  private readonly _token: string | undefined
  private readonly _timeout: number
  private readonly _reconnectOpts: ReconnectOptions | undefined

  private _ws: WebSocket | null = null
  private _state: TransportState = 'disconnected'
  private _intentionalClose = false
  private readonly _reconnectPolicy: ReconnectPolicy | null = null
  private readonly _lifecycle: ConnectionLifecycleManager
  private readonly _pending = new Map<string, PendingCall>()
  private readonly _pingIntervalMs: number
  private readonly _pongTimeoutMs: number
  private _pingTimer: ReturnType<typeof setInterval> | null = null
  private _pongTimeoutTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 创建 WebSocketTransport 实例。
   * @param opts 构造参数
   */
  constructor(opts: WebSocketTransportOptions) {
    super()
    this._url = opts.url
    this._token = opts.token
    this._timeout = opts.timeout ?? 10000
    this._reconnectOpts = opts.reconnect
    this._pingIntervalMs = opts.pingIntervalMs ?? 25000
    this._pongTimeoutMs = opts.pongTimeoutMs ?? 10000
    if (opts.reconnect) {
      this._reconnectPolicy = new ReconnectPolicy(opts.reconnect)
    }
    this._lifecycle = new ConnectionLifecycleManager(this._reconnectPolicy)
  }

  /**
   * 当前连接状态。
   * @returns 当前 TransportState
   */
  get state(): TransportState {
    return this._state
  }

  /**
   * 建立 WebSocket 连接。
   * @returns 连接建立后 resolve
   */
  async connect(): Promise<void> {
    this._state = 'connecting'
    this._intentionalClose = false
    const connectionId = this._lifecycle.nextConnectionId()

    const url = this._buildUrl()
    const ws = new WebSocket(url)
    this._ws = ws

    return new Promise<void>((resolve, reject) => {
      const onOpen = () => {
        // 本次连接已被后续的 connect() 调用替换（如外部触发器与自身重连并发），
        // 这是一个过期实例的 open 事件，不应再影响当前状态。
        if (this._lifecycle.connectionId !== connectionId) return
        this._state = 'connected'
        this._lifecycle.armStableResetTimer()
        this._startPingLoop(ws, connectionId)
        this.emit('connect')
        cleanup()
        resolve()
      }

      const onError = (err: Error) => {
        cleanup()
        reject(err)
      }

      const cleanup = () => {
        ws.off('open', onOpen)
        ws.off('error', onError)
      }

      ws.on('open', onOpen)
      ws.once('error', onError)

      ws.on('message', (raw) => {
        if (this._lifecycle.connectionId !== connectionId) return // 过期连接的消息不再处理
        const text = Buffer.isBuffer(raw)
          ? raw.toString('utf8')
          : Array.isArray(raw)
            ? Buffer.concat(raw).toString('utf8')
            : Buffer.from(raw).toString('utf8')
        handleIncomingMessage(text, this._pending, (event, data) => this.emit(event, data))
      })

      ws.on('pong', () => {
        if (this._lifecycle.connectionId !== connectionId) return
        this._clearPongTimeout()
      })

      ws.on('close', () => {
        // 过期连接（已被替换）的 close 事件不再驱动状态迁移或安排重连，
        // 否则会用旧连接的断开覆盖当前新连接的真实状态。
        if (this._lifecycle.connectionId !== connectionId) return
        this._state = 'disconnected'
        this._lifecycle.clearStableResetTimer()
        this._clearPingLoop()
        // 拒绝所有 pending 调用
        for (const [echo, pending] of this._pending) {
          clearTimeout(pending.timer)
          pending.reject(new TransportError('WebSocket 连接已断开'))
          this._pending.delete(echo)
        }
        this.emit('close')
        if (!this._intentionalClose && this._reconnectPolicy) {
          this._scheduleReconnect()
        }
      })

      ws.on('error', (err) => {
        if (this._lifecycle.connectionId !== connectionId) return
        this.emit('error', new TransportError(err.message))
      })
    })
  }

  /**
   * 断开连接。
   * @returns 断开完成后 resolve
   */
  async disconnect(): Promise<void> {
    this._intentionalClose = true
    this._lifecycle.clearStableResetTimer()
    this._clearPingLoop()
    if (this._state === 'reconnecting') {
      // 退避等待期间没有存活的 socket 可关闭：this._ws 仍指向上一次已关闭的旧连接，
      // 若不特殊处理会走到下面的慢速分支，对着一个早已关闭的 ws 再调用一次 close()（无效操作，
      // 不会重新触发 close 事件），导致白白等待 5 秒兜底超时才 resolve，且 state 永远卡在
      // reconnecting 不会变回 disconnected。待定的重连定时器会在触发时因 _intentionalClose
      // 为 true 而自行跳过，不需要在这里额外取消。
      this._state = 'disconnected'
      this.emit('close')
      return
    }
    if (!this._ws || this._state === 'disconnected') {
      return
    }

    return new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timer)
        resolve()
      }
      const timer = setTimeout(done, 5000) // 5s 超时保护
      this._ws?.once('close', done)
      this._ws?.close()
    })
  }

  /**
   * 调用 NapCat API，通过 echo 关联响应。
   * @param action API 动作名称
   * @param params 请求参数
   * @returns API 响应
   */
  async call(action: string, params: Record<string, unknown>): Promise<ApiResponse> {
    if (this._state !== 'connected' || !this._ws) {
      throw new TransportError(`无法调用 "${action}"：当前状态为 ${this._state}`)
    }

    const echo = randomUUID()

    return new Promise<ApiResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        this._pending.delete(echo)
        reject(new TimeoutError(action, this._timeout))
      }, this._timeout)

      this._pending.set(echo, { resolve, reject, timer })

      this._ws?.send(JSON.stringify({ action, params, echo }))
    })
  }

  /**
   * 构建带 token 的 URL。
   * @returns 带 token 的完整 URL 字符串
   */
  private _buildUrl(): string {
    if (!this._token) return this._url
    const separator = this._url.includes('?') ? '&' : '?'
    return `${this._url}${separator}access_token=${encodeURIComponent(this._token)}`
  }

  /**
   * 启动 ping/pong 心跳循环，检测"看似开着但实际已死"的假死连接。
   * @param ws WebSocket 实例
   * @param connectionId 当前连接 ID，用于判断连接是否过期
   */
  private _startPingLoop(ws: WebSocket, connectionId: number): void {
    this._clearPingLoop()
    this._pingTimer = setInterval(() => {
      if (this._lifecycle.connectionId !== connectionId) {
        this._clearPingLoop()
        return
      }
      ws.ping()
      this._clearPongTimeout()
      this._pongTimeoutTimer = setTimeout(() => {
        // 发出 ping 后在超时时间内未收到 pong：判定连接假死，主动终止连接，
        // 触发既有的 close → _scheduleReconnect 链路，与真实断线走同一套恢复路径。
        if (this._lifecycle.connectionId !== connectionId) return
        ws.terminate()
      }, this._pongTimeoutMs)
    }, this._pingIntervalMs)
  }

  /**
   * 停止 ping 定时器（同时清理挂起的 pong 超时定时器）。
   * @returns void
   */
  private _clearPingLoop(): void {
    if (this._pingTimer) {
      clearInterval(this._pingTimer)
      this._pingTimer = null
    }
    this._clearPongTimeout()
  }

  /**
   * 取消挂起的 pong 超时定时器（若有）。
   * @returns void
   */
  private _clearPongTimeout(): void {
    if (this._pongTimeoutTimer) {
      clearTimeout(this._pongTimeoutTimer)
      this._pongTimeoutTimer = null
    }
  }

  /**
   * 安排重连。
   * @returns void
   */
  private _scheduleReconnect(): void {
    this._lifecycle.scheduleReconnect({
      // 如果已经主动关闭，或状态已经不是 reconnecting（比如外部显式调用了 connect()），不再重连
      isExpired: () => this._intentionalClose || this._state !== 'reconnecting',
      doConnect: () => this.connect(),
      onReconnecting: (attempt, delay) => {
        // 进入退避等待窗口：state 从这一刻起是 reconnecting，而不是停留在 disconnected——
        // 业务层/前端需要能区分"正在自动重试"和"已经彻底放弃"。
        this._state = 'reconnecting'
        this.emit('reconnecting', attempt, delay)
      },
      onGiveUp: () => this.emit('giveUp'),
      onError: (err) => {
        this.emit(
          'error',
          new TransportError(`重连失败: ${err instanceof Error ? err.message : String(err)}`),
        )
      },
    })
  }
}
