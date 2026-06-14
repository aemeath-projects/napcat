import { WebSocket } from 'ws'

/** 模拟 NapCat 作为客户端主动连接 SDK 反向 WS server 的行为。 */
export class MockNapCatWsClient {
  private ws: WebSocket | null = null
  private closeCode = 1000

  async connect(url: string, token?: string): Promise<void> {
    const urlWithToken = token ? `${url}?access_token=${encodeURIComponent(token)}` : url
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(urlWithToken)

      const onOpen = () => {
        cleanup()
        // open 触发后，服务端仍可能立即关闭（拒绝连接）
        // 等下一个宏任务，让可能的 close 事件先处理
        const onCloseAfterOpen = (code: number) => {
          this.closeCode = code
          if (code >= 4000) {
            reject(new Error(`Connection rejected with close code ${code}`))
          }
          // code 1000 表示正常关闭，connect 已 resolve，不额外处理
        }
        this.ws!.once('close', onCloseAfterOpen)
        // 给 close 事件 10ms 的机会先到达
        setTimeout(() => {
          // 如果 10ms 内没有被 close，认为连接稳定
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.off('close', onCloseAfterOpen)
            // 注册持久 close 监听，记录 close code
            this.ws.on('close', (code) => {
              this.closeCode = code
            })
            resolve()
          }
          // 如果已经 closed/closing，onCloseAfterOpen 会处理
        }, 10)
      }

      const onError = (err: Error) => {
        cleanup()
        reject(err)
      }

      const onClose = (code: number) => {
        cleanup()
        this.closeCode = code
        // 连接在 open 之前就被关闭（握手被拒绝）
        reject(new Error(`Connection closed before open, code ${code}`))
      }

      const cleanup = () => {
        this.ws!.off('open', onOpen)
        this.ws!.off('error', onError)
        this.ws!.off('close', onClose)
      }

      this.ws.once('open', onOpen)
      this.ws.once('error', onError)
      this.ws.once('close', onClose)
    })
  }

  send(data: Record<string, unknown>): void {
    this.ws?.send(JSON.stringify(data))
  }

  pushEvent(event: Record<string, unknown>): void {
    this.ws?.send(JSON.stringify(event))
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        resolve()
        return
      }
      this.ws.once('close', () => {
        resolve()
      })
      this.ws.close()
    })
  }

  getLastCloseCode(): number {
    return this.closeCode
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
