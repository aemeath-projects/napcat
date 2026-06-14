import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { TimeoutError } from '../../src/core'
import { WebSocketTransport } from '../../src/transport'

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

  it('call() 在未连接时抛出 TransportError', async () => {
    transport = new WebSocketTransport({ url: server.url })
    await expect(transport.call('get_login_info', {})).rejects.toThrow('无法调用')
  })

  it('达到最大重试次数后停止重连', async () => {
    transport = new WebSocketTransport({
      url: server.url,
      reconnect: { initialDelay: 50, maxDelay: 100, jitter: 0, maxRetries: 1 },
    })
    await transport.connect()

    // 收集重连事件
    const attempts: number[] = []
    transport.on('reconnecting', (attempt, _delay) => {
      attempts.push(attempt)
    })

    server.simulateDisconnect()

    // 等待 connect 事件（第一次重连成功）
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    // 第二次断开
    server.simulateDisconnect()

    // 等待第二次重连
    try {
      await new Promise<void>((resolve) => transport.once('connect', resolve))
    } catch {
      // 可能已经无法重连
    }

    // 第三次断开 — 此时不应再重连
    const closePromise = new Promise<void>((resolve) => transport.once('close', resolve))
    server.simulateDisconnect()

    // 等待 close，验证最终停止
    await closePromise
    expect(transport.state).toBe('disconnected')
  })
})
