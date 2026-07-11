import { createServer, type ServerResponse } from 'node:http'

export class MockNapCatSseServer {
  private readonly httpServer: ReturnType<typeof createServer>
  private readonly sseClients = new Set<ServerResponse>()
  private readonly apiHandlers = new Map<string, (body: Record<string, unknown>) => unknown>()
  private _port = 0
  private _rejectSse = false

  constructor() {
    this.httpServer = createServer((req, res) => {
      if (req.url === '/_events' && req.method === 'GET') {
        if (this._rejectSse) {
          res.writeHead(503)
          res.end()
          return
        }
        // SSE 连接
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        })
        res.write('\n') // 初始心跳
        this.sseClients.add(res)
        req.on('close', () => {
          this.sseClients.delete(res)
        })
        return
      }

      // API 调用
      const action = req.url?.slice(1) ?? ''
      let body = ''
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString()
      })
      req.on('end', () => {
        try {
          const params = body ? (JSON.parse(body) as Record<string, unknown>) : {}
          const handler = this.apiHandlers.get(action)
          const data = handler ? handler(params) : null
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ status: 'ok', retcode: 0, data }))
        } catch {
          res.writeHead(400)
          res.end()
        }
      })
    })
  }

  get port(): number {
    return this._port
  }

  get baseUrl(): string {
    return `http://127.0.0.1:${this._port}`
  }

  async listen(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.listen(0, '127.0.0.1', () => {
        const addr = this.httpServer.address()
        this._port = typeof addr === 'object' && addr ? addr.port : 0
        resolve()
      })
    })
  }

  /** 向所有 SSE 客户端推送事件。 */
  pushEvent(event: Record<string, unknown>): void {
    const data = `data: ${JSON.stringify(event)}\n\n`
    for (const client of this.sseClients) {
      client.write(data)
    }
  }

  /** 强制关闭所有 SSE 连接（模拟断线）。 */
  closeAllSseConnections(): void {
    for (const client of this.sseClients) {
      client.destroy()
    }
    this.sseClients.clear()
  }

  /** 设置 SSE 端点是否拒绝连接（返回 503），用于模拟服务临时不可用但可恢复的场景。 */
  setRejectSse(reject: boolean): void {
    this._rejectSse = reject
  }

  onAction(action: string, handler: (body: Record<string, unknown>) => unknown): this {
    this.apiHandlers.set(action, handler)
    return this
  }

  async close(): Promise<void> {
    this.closeAllSseConnections()
    return new Promise((resolve, reject) => {
      this.httpServer.close((err) => {
        err ? reject(err) : resolve()
      })
    })
  }
}
