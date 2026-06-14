/** 反向 WebSocket Transport：SDK 作为 server，等待 NapCat 主动连接。 */
import { randomUUID } from 'node:crypto'
import { createServer, type IncomingMessage } from 'node:http'

import { WebSocketServer, WebSocket, type RawData } from 'ws'

import { TypedEventEmitter } from '../core/emitter.js'
import { TransportError, TimeoutError } from '../core/errors.js'
import type { ApiResponse } from '../types/common.js'
import type { TransportEventMap } from '../types/events.js'

import type { ITransport, TransportState } from './interface.js'
import { handleIncomingMessage, type PendingCall } from './message.js'

/** ReverseWebSocketTransport 构造参数。 */
export interface ReverseWebSocketTransportOptions {
  /** 监听主机，默认 '127.0.0.1' */
  host?: string
  /** 监听端口，0 表示随机可用端口 */
  port: number
  /** WebSocket 路径，默认 '/' */
  path?: string
  /** NapCat access token，非空时校验连接方提供的 token */
  token?: string
  /** 最大并发连接数，默认 1 */
  maxConnections?: number
  /** API 调用超时（ms），默认 10000 */
  timeout?: number
}

/** 反向 WebSocket Transport：SDK 启动 WS server，NapCat 主动连接进来。 */
export class ReverseWebSocketTransport
  extends TypedEventEmitter<TransportEventMap>
  implements ITransport
{
  private _state: TransportState = 'disconnected'
  private _httpServer: ReturnType<typeof createServer> | null = null
  private _wss: WebSocketServer | null = null
  private _currentWs: WebSocket | null = null
  private readonly _pending = new Map<string, PendingCall>()

  private readonly _host: string
  private readonly _port: number
  private readonly _path: string
  private readonly _token: string | undefined
  private readonly _maxConnections: number
  private readonly _timeout: number
  private _intentionalClose = false
  private _actualPort = 0

  constructor(opts: ReverseWebSocketTransportOptions) {
    super()
    this._host = opts.host ?? '127.0.0.1'
    this._port = opts.port
    this._path = opts.path != null ? (opts.path.startsWith('/') ? opts.path : `/${opts.path}`) : '/'
    this._token = opts.token
    this._maxConnections = opts.maxConnections ?? 1
    this._timeout = opts.timeout ?? 10000
  }

  get state(): TransportState {
    return this._state
  }

  /** 已绑定的实际端口（port=0 时由 OS 分配）。 */
  get port(): number {
    return this._actualPort
  }

  /** 外部可连接的 WS URL（含 path）。 */
  get url(): string {
    return `ws://${this._host}:${this._actualPort.toString()}${this._path}`
  }

  /**
   * 启动 WS server 并开始监听。注意：本方法仅启动 server，`connect` 事件
   * 会在 NapCat 客户端实际连接进来时才触发（见 `_handleIncomingConnection`），
   * 这与 WebSocketTransport.connect() 的行为不同。
   */
  async connect(): Promise<void> {
    this._intentionalClose = false

    const httpServer = createServer()
    this._httpServer = httpServer

    const wss = new WebSocketServer({ server: httpServer, path: this._path })
    this._wss = wss

    wss.on('connection', (ws, req) => {
      this._handleIncomingConnection(ws, req)
    })

    return new Promise<void>((resolve, reject) => {
      httpServer.once('error', (err) => {
        reject(err)
      })
      httpServer.listen(this._port, this._host, () => {
        const addr = httpServer.address()
        this._actualPort = typeof addr === 'object' && addr ? addr.port : this._port
        resolve()
      })
    })
  }

  /** 关闭所有连接并停止 server。 */
  async disconnect(): Promise<void> {
    this._intentionalClose = true

    // 拒绝所有 pending 调用
    for (const [echo, pending] of this._pending) {
      clearTimeout(pending.timer)
      pending.reject(new TransportError('Transport 已断开'))
      this._pending.delete(echo)
    }

    // 关闭当前 WS 连接
    const ws = this._currentWs
    if (ws?.readyState === WebSocket.OPEN) {
      await new Promise<void>((resolve) => {
        ws.once('close', () => {
          resolve()
        })
        ws.close()
      })
    }
    this._currentWs = null

    // 关闭 WSS 和 HTTP server
    await new Promise<void>((resolve, reject) => {
      if (!this._wss) {
        resolve()
        return
      }
      this._wss.close((err) => {
        if (err) {
          reject(err)
          return
        }
        this._httpServer?.close((err2) => {
          if (err2) {
            reject(err2)
          } else {
            resolve()
          }
        })
      })
    })

    this._wss = null
    this._httpServer = null
    this._state = 'disconnected'
  }

  /** 调用 NapCat API，通过 echo 关联响应。 */
  async call(action: string, params: Record<string, unknown>): Promise<ApiResponse> {
    if (this._state !== 'connected' || !this._currentWs) {
      throw new TransportError(`无法调用 "${action}"：当前状态为 ${this._state}`)
    }

    const echo = randomUUID()

    return new Promise<ApiResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        this._pending.delete(echo)
        reject(new TimeoutError(action, this._timeout))
      }, this._timeout)

      this._pending.set(echo, { resolve, reject, timer })

      this._currentWs?.send(JSON.stringify({ action, params, echo }))
    })
  }

  /** 处理新进入的 WebSocket 连接。 */
  private _handleIncomingConnection(ws: WebSocket, req: IncomingMessage): void {
    // 鉴权校验
    if (this._token) {
      const provided = this._getTokenFromRequest(req)
      if (provided !== this._token) {
        ws.close(4001, 'Unauthorized')
        return
      }
    }

    // 超出最大连接数限制（默认 maxConnections=1）
    const connectionCount = this._currentWs?.readyState === WebSocket.OPEN ? 1 : 0
    if (connectionCount >= this._maxConnections) {
      ws.close(4002, 'Too many connections')
      return
    }

    this._currentWs = ws
    this._state = 'connected'
    this.emit('connect')

    ws.on('message', (raw: RawData) => {
      const text = Buffer.isBuffer(raw)
        ? raw.toString('utf8')
        : Array.isArray(raw)
          ? Buffer.concat(raw).toString('utf8')
          : Buffer.from(raw).toString('utf8')
      handleIncomingMessage(text, this._pending, (event, data) => this.emit(event, data))
    })

    ws.on('close', () => {
      // 仅当关闭的是当前活跃连接时才处理
      if (this._currentWs !== ws) return

      this._currentWs = null

      // 拒绝所有 pending 调用
      for (const [echo, pending] of this._pending) {
        clearTimeout(pending.timer)
        pending.reject(new TransportError('WebSocket 连接已断开'))
        this._pending.delete(echo)
      }

      this._state = 'disconnected'
      if (!this._intentionalClose) {
        this.emit('close')
      }
    })

    ws.on('error', (err) => {
      this.emit('error', new TransportError(err.message))
    })
  }

  /**
   * 从 HTTP 请求解析 token。WS 客户端模式下 NapCat 通过 URL query
   * `access_token` 传递 token，故优先从 query string 提取；
   * 其次才从 `Authorization: Bearer` header 提取作为兜底。
   */
  private _getTokenFromRequest(req: IncomingMessage): string | undefined {
    // 优先从 URL query string 取 access_token
    const url = req.url ?? ''
    const queryStart = url.indexOf('?')
    if (queryStart !== -1) {
      const qs = new URLSearchParams(url.slice(queryStart + 1))
      const fromQuery = qs.get('access_token')
      if (fromQuery) return fromQuery
    }

    // 其次从 Authorization: Bearer <token> header 取
    const authHeader = req.headers.authorization
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7)
    }

    return undefined
  }
}
