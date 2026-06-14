import { createServer } from 'node:http'

import { WebSocketServer, type RawData, type WebSocket } from 'ws'

interface MockResponse {
  status: string
  retcode: number
  data: unknown
  message?: string
}

export class MockNapCatWsServer {
  private readonly wss: WebSocketServer
  private readonly httpServer: ReturnType<typeof createServer>
  private readonly handlers = new Map<string, (params: Record<string, unknown>) => MockResponse>()
  private readonly connections = new Set<WebSocket>()
  private _port = 0

  constructor() {
    this.httpServer = createServer()
    this.wss = new WebSocketServer({ server: this.httpServer })
    this.wss.on('connection', (ws) => {
      this.connections.add(ws)
      ws.on('message', (raw: RawData) => {
        try {
          const msg = JSON.parse(raw.toString()) as {
            action: string
            params: Record<string, unknown>
            echo?: string
          }
          if (msg.echo) {
            const handler = this.handlers.get(msg.action)
            // 没有注册 handler 时不回复，模拟服务器无响应场景
            if (handler) {
              const result = handler(msg.params)
              ws.send(JSON.stringify({ ...result, echo: msg.echo }))
            }
          }
        } catch {
          /* ignore parse errors */
        }
      })
      ws.on('close', () => {
        this.connections.delete(ws)
      })
    })
  }

  get port(): number {
    return this._port
  }
  get url(): string {
    return `ws://127.0.0.1:${this._port}`
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

  onAction(action: string, handler: (params: Record<string, unknown>) => MockResponse): this {
    this.handlers.set(action, handler)
    return this
  }

  pushEvent(event: Record<string, unknown>): void {
    for (const ws of this.connections) {
      ws.send(JSON.stringify(event))
    }
  }

  simulateDisconnect(): void {
    for (const ws of this.connections) {
      ws.close()
    }
  }

  async close(): Promise<void> {
    for (const ws of this.connections) {
      ws.close()
    }
    return new Promise((resolve, reject) => {
      this.wss.close((err) => {
        if (err) {
          reject(err)
          return
        }
        this.httpServer.close((err2) => {
          err2 ? reject(err2) : resolve()
        })
      })
    })
  }
}
