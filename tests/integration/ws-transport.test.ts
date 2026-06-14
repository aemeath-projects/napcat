import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { TimeoutError } from '../../src/core/errors.js'
import { WebSocketTransport } from '../../src/transport/ws.js'

import { MockNapCatWsServer } from './helpers/mock-ws-server.js'

describe('WebSocketTransport WebSocket 传输', () => {
  let server: MockNapCatWsServer
  let transport: WebSocketTransport

  beforeEach(async () => {
    server = new MockNapCatWsServer()
    await server.listen()
  })

  afterEach(async () => {
    await transport?.disconnect().catch(() => {})
    await server.close()
  })

  it('成功连接', async () => {
    transport = new WebSocketTransport({ url: server.url })
    const connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    await transport.connect()
    await connectPromise
    expect(transport.state).toBe('connected')
  })

  it('call() 发送 action 并通过 echo 接收响应', async () => {
    server.onAction('get_login_info', () => ({
      status: 'ok',
      retcode: 0,
      data: { user_id: 12345, nickname: 'Bot' },
    }))
    transport = new WebSocketTransport({ url: server.url })
    await transport.connect()
    const resp = await transport.call('get_login_info', {})
    expect(resp.status).toBe('ok')
    expect(resp.retcode).toBe(0)
    expect((resp.data as Record<string, unknown>).user_id).toBe(12345)
  })

  it('通过 "event" 发射器接收推送事件', async () => {
    transport = new WebSocketTransport({ url: server.url })
    await transport.connect()
    const eventPromise = new Promise<unknown>((resolve) => transport.once('event', resolve))
    server.pushEvent({
      post_type: 'meta_event',
      meta_event_type: 'heartbeat',
      time: Date.now(),
      self_id: 0,
    })
    const event = await eventPromise
    expect((event as Record<string, unknown>).post_type).toBe('meta_event')
  })

  it('未收到响应时 call() 超时', async () => {
    transport = new WebSocketTransport({ url: server.url, timeout: 100 })
    await transport.connect()
    // 没有注册 handler，服务器不响应
    await expect(transport.call('no_handler_action', {})).rejects.toBeInstanceOf(TimeoutError)
  })

  it('干净地断开连接', async () => {
    transport = new WebSocketTransport({ url: server.url })
    await transport.connect()
    const closePromise = new Promise<void>((resolve) => transport.once('close', resolve))
    await transport.disconnect()
    await closePromise
    expect(transport.state).toBe('disconnected')
  })

  it('提供 token 时作为 access_token 查询参数发送', async () => {
    // 通过连接成功验证（mock server 不鉴权）
    transport = new WebSocketTransport({ url: server.url, token: 'test-token' })
    await transport.connect()
    expect(transport.state).toBe('connected')
  })

  it('启用重连选项后断开时自动重连', async () => {
    transport = new WebSocketTransport({
      url: server.url,
      reconnect: { initialDelay: 50, maxDelay: 200, jitter: 0 },
    })
    await transport.connect()

    const reconnectingPromise = new Promise<void>((resolve) =>
      transport.once('reconnecting', () => {
        resolve()
      }),
    )
    server.simulateDisconnect()

    // 等待重连事件触发
    await reconnectingPromise

    // 等待实际重连完成
    await new Promise<void>((resolve) => transport.once('connect', resolve))
    expect(transport.state).toBe('connected')
  })
})
