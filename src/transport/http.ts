/** HTTP Transport 实现：API 调用走 HTTP POST，事件接收走内置 HTTP server。 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'

import { TypedEventEmitter, ConnectionError, TransportError } from '../core'
import type { ApiResponse, OneBotEvent, TransportEventMap } from '../types'

import type { ITransport, TransportState } from './interface.js'

/** Event server 监听配置。 */
export interface HttpEventServerOptions {
  /** 监听主机，默认 '127.0.0.1' */
  host?: string
  /** 监听端口，0 表示由 OS 分配随机可用端口 */
  port: number
  /** 事件上报路径，默认 '/onebot/event' */
  path?: string
}

/** HttpTransport 构造参数。 */
export interface HttpTransportOptions {
  /** NapCat HTTP API 基础地址，如 http://127.0.0.1:3000 */
  apiBaseUrl: string
  /** NapCat access token，非空时附加到请求头 */
  token?: string
  /** SDK 侧 event server 配置 */
  eventServer: HttpEventServerOptions
}

/** HTTP Transport：API 调用用 HTTP POST，事件接收用内置 HTTP server。 */
export class HttpTransport extends TypedEventEmitter<TransportEventMap> implements ITransport {
  private readonly _apiBaseUrl: string
  private readonly _token: string | undefined
  private readonly _eventHost: string
  private readonly _eventPort: number
  private readonly _eventPath: string

  private _state: TransportState = 'disconnected'
  private _httpServer: ReturnType<typeof createServer> | null = null
  private _actualPort = 0

  constructor(opts: HttpTransportOptions) {
    super()
    this._apiBaseUrl = opts.apiBaseUrl.replace(/\/$/, '') // 去除末尾斜杠
    this._token = opts.token
    this._eventHost = opts.eventServer.host ?? '127.0.0.1'
    this._eventPort = opts.eventServer.port
    const rawPath = opts.eventServer.path ?? '/onebot/event'
    this._eventPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  }

  get state(): TransportState {
    return this._state
  }

  /** 已绑定的 event server 实际端口（port=0 时由 OS 分配）。 */
  get eventServerPort(): number {
    return this._actualPort
  }

  /**
   * 启动 event server，然后调用 get_login_info 做健康检查。
   * 健康检查失败则停止 server 并抛 ConnectionError。
   */
  async connect(): Promise<void> {
    this._state = 'connecting'

    // 启动 event server
    await this._startEventServer()

    // 健康检查
    let resp: ApiResponse
    try {
      resp = await this.call('get_login_info', {})
    } catch (err) {
      await this._stopEventServer()
      this._state = 'disconnected'
      throw new ConnectionError(`健康检查失败：${err instanceof Error ? err.message : String(err)}`)
    }

    if (resp.status !== 'ok' || resp.retcode !== 0) {
      await this._stopEventServer()
      this._state = 'disconnected'
      throw new ConnectionError(
        `健康检查失败：status=${resp.status} retcode=${resp.retcode.toString()}`,
      )
    }

    this._state = 'connected'
    this.emit('connect')
  }

  /** 关闭 event server，state 设为 disconnected。 */
  async disconnect(): Promise<void> {
    await this._stopEventServer()
    this._state = 'disconnected'
    this.emit('close')
  }

  /**
   * 向 apiBaseUrl/<action> 发 POST 请求，直接返回 ApiResponse。
   * 网络错误抛 TransportError。
   */
  async call(action: string, params: Record<string, unknown>): Promise<ApiResponse> {
    const url = `${this._apiBaseUrl}/${action}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this._token) {
      headers.Authorization = `Bearer ${this._token}`
    }

    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      })
    } catch (err) {
      throw new TransportError(
        `HTTP 请求失败 [${action}]：${err instanceof Error ? err.message : String(err)}`,
      )
    }

    let data: ApiResponse
    try {
      data = (await response.json()) as ApiResponse
    } catch {
      throw new TransportError(`响应 JSON 解析失败 [${action}]：HTTP ${response.status.toString()}`)
    }

    return data
  }

  /** 启动内置 HTTP event server，监听 NapCat 的事件上报。 */
  private async _startEventServer(): Promise<void> {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      this._handleEventRequest(req, res)
    })
    this._httpServer = server

    return new Promise((resolve, reject) => {
      server.once('error', (err) => {
        reject(err)
      })
      server.listen(this._eventPort, this._eventHost, () => {
        const addr = server.address()
        this._actualPort = typeof addr === 'object' && addr ? addr.port : this._eventPort
        resolve()
      })
    })
  }

  /** 停止 event server。 */
  private async _stopEventServer(): Promise<void> {
    const server = this._httpServer
    if (!server) return
    this._httpServer = null
    return new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  /** 处理来自 NapCat 的事件上报请求。 */
  private _handleEventRequest(req: IncomingMessage, res: ServerResponse): void {
    // 仅处理配置路径（去除 query string 后比较）
    const urlWithoutQuery = req.url?.split('?')[0] ?? ''
    if (urlWithoutQuery !== this._eventPath) {
      res.writeHead(404)
      res.end()
      return
    }

    // 校验 token（如有配置）
    if (this._token) {
      const provided = this._extractToken(req)
      if (provided !== this._token) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'failed', message: '未授权' }))
        return
      }
    }

    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        const event = JSON.parse(body) as OneBotEvent
        this.emit('event', event)
      } catch {
        // JSON 解析失败，忽略该事件
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok' }))
    })
  }

  /**
   * 从请求中提取 token。HTTP 事件上报模式下 NapCat 通过
   * `Authorization: Bearer` header 传递 token，故优先从 header 提取；
   * 其次才从 URL query string 的 `access_token` 提取作为兜底。
   */
  private _extractToken(req: IncomingMessage): string | undefined {
    // 优先从 Authorization: Bearer <token>
    const authHeader = req.headers.authorization
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7)
    }

    // 其次从 URL query string access_token
    const url = req.url ?? ''
    const queryStart = url.indexOf('?')
    if (queryStart !== -1) {
      const qs = new URLSearchParams(url.slice(queryStart + 1))
      const fromQuery = qs.get('access_token')
      if (fromQuery) return fromQuery
    }

    return undefined
  }
}
