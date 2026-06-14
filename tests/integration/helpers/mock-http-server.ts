import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'

interface MockResponse {
  status: string
  retcode: number
  data: unknown
  message?: string
}

export class MockNapCatHttpServer {
  private readonly httpServer: ReturnType<typeof createServer>
  private readonly handlers = new Map<string, (body: Record<string, unknown>) => MockResponse>()
  private _port = 0

  constructor() {
    this.httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
      const action = req.url?.slice(1) ?? '' // 去掉开头的 /
      let body = ''
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString()
      })
      req.on('end', () => {
        const params = body ? (JSON.parse(body) as Record<string, unknown>) : {}
        const handler = this.handlers.get(action)
        const result: MockResponse = handler
          ? handler(params)
          : { status: 'ok', retcode: 0, data: null }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(result))
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

  onAction(action: string, handler: (body: Record<string, unknown>) => MockResponse): this {
    this.handlers.set(action, handler)
    return this
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.close((err) => {
        err ? reject(err) : resolve()
      })
    })
  }
}
