/** 正向 WebSocket 连接 Transport 实现。 */
import { randomUUID } from 'node:crypto'

import { WebSocket } from 'ws'

import { TypedEventEmitter } from '../core/emitter.js'
import { TransportError, TimeoutError } from '../core/errors.js'
import type { ApiResponse, OneBotEvent } from '../types/common.js'
import type { TransportEventMap } from '../types/events.js'

import type { ITransport, TransportState } from './interface.js'
import { ReconnectPolicy } from './reconnect.js'
import type { ReconnectOptions } from './reconnect.js'

/** WebSocketTransport 扩展事件映射，增加 reconnecting 事件。 */
export interface WsTransportEventMap extends TransportEventMap {
  reconnecting: (attempt: number, delay: number) => void
}

/** 等待中的 API 调用。 */
interface PendingCall {
  resolve: (resp: ApiResponse) => void
  reject: (err: Error) => void
  timer: ReturnType<typeof setTimeout>
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
}

/** 正向 WebSocket Transport：客户端主动连接 NapCat。 */
export class WebSocketTransport
  extends TypedEventEmitter<WsTransportEventMap>
  implements ITransport
{
  private readonly _url: string
  private readonly _token: string | undefined
  private readonly _timeout: number
  private readonly _reconnectOpts: ReconnectOptions | undefined

  private _ws: WebSocket | null = null
  private _state: TransportState = 'disconnected'
  private _intentionalClose = false
  private _reconnectPolicy: ReconnectPolicy | null = null
  private readonly _pending = new Map<string, PendingCall>()

  constructor(opts: WebSocketTransportOptions) {
    super()
    this._url = opts.url
    this._token = opts.token
    this._timeout = opts.timeout ?? 10000
    this._reconnectOpts = opts.reconnect
    if (opts.reconnect) {
      this._reconnectPolicy = new ReconnectPolicy(opts.reconnect)
    }
  }

  get state(): TransportState {
    return this._state
  }

  /** 建立 WebSocket 连接。 */
  async connect(): Promise<void> {
    this._state = 'connecting'
    this._intentionalClose = false

    const url = this._buildUrl()
    const ws = new WebSocket(url)
    this._ws = ws

    return new Promise<void>((resolve, reject) => {
      const onOpen = () => {
        this._state = 'connected'
        this._reconnectPolicy?.reset()
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
      ws.on('error', onError)

      ws.on('message', (raw) => {
        const text = Buffer.isBuffer(raw)
          ? raw.toString('utf8')
          : Array.isArray(raw)
            ? Buffer.concat(raw).toString('utf8')
            : Buffer.from(raw).toString('utf8')
        this._handleMessage(text)
      })

      ws.on('close', () => {
        this._state = 'disconnected'
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
        this.emit('error', new TransportError(err.message))
      })
    })
  }

  /** 断开连接。 */
  async disconnect(): Promise<void> {
    this._intentionalClose = true
    if (!this._ws || this._state === 'disconnected') {
      return
    }

    return new Promise<void>((resolve) => {
      const onClose = () => {
        resolve()
      }
      this._ws?.once('close', onClose)
      this._ws?.close()
    })
  }

  /** 调用 NapCat API，通过 echo 关联响应。 */
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

  /** 构建带 token 的 URL。 */
  private _buildUrl(): string {
    if (!this._token) return this._url
    const separator = this._url.includes('?') ? '&' : '?'
    return `${this._url}${separator}access_token=${encodeURIComponent(this._token)}`
  }

  /** 处理收到的消息，区分 API 响应和事件推送。 */
  private _handleMessage(raw: string): void {
    let data: Record<string, unknown>
    try {
      data = JSON.parse(raw) as Record<string, unknown>
    } catch {
      return
    }

    // 含 echo 且无 post_type → API 响应
    if (typeof data.echo === 'string' && data.post_type === undefined) {
      const pending = this._pending.get(data.echo)
      if (pending) {
        clearTimeout(pending.timer)
        this._pending.delete(data.echo)
        pending.resolve(data as unknown as ApiResponse)
      }
      return
    }

    // 有 post_type → OneBot 事件推送
    if (typeof data.post_type === 'string') {
      // JSON.parse 返回 any，此处已验证 post_type 字段存在，强制转换类型

      const event = data as unknown as OneBotEvent

      this.emit('event', event)
    }
  }

  /** 安排重连。 */
  private _scheduleReconnect(): void {
    if (!this._reconnectPolicy?.canRetry()) {
      return
    }

    const attempt = this._reconnectPolicy.attempts + 1 // 第几次重试（1-based）
    const delay = this._reconnectPolicy.nextDelay()

    this.emit('reconnecting', attempt, delay)

    setTimeout(() => {
      // 如果已经主动关闭，或已经在连接中，不再重连
      if (this._intentionalClose || this._state !== 'disconnected') return
      this.connect().catch((err: unknown) => {
        this.emit(
          'error',
          new TransportError(`重连失败: ${err instanceof Error ? err.message : String(err)}`),
        )
      })
    }, delay)
  }
}
