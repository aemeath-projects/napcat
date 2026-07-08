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
    expect((event as Record<string, unknown>).postType).toBe('meta_event')
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

  it('防止重复断开连接', async () => {
    transport = new WebSocketTransport({ url: server.url })
    await transport.connect()
    await transport.disconnect()
    // 二次断开应安全无异常
    await expect(transport.disconnect()).resolves.toBeUndefined()
  })

  it('断开时有挂起的 call() 应全部 reject', async () => {
    transport = new WebSocketTransport({ url: server.url, timeout: 5000 })
    await transport.connect()

    // 发起一个 call()，不等待 server 响应
    const callPromise = expect(transport.call('pending_action', {})).rejects.toThrow(
      'WebSocket 连接已断开',
    )

    // 立即断开 — 此时 pending 应该被 reject
    await new Promise((r) => setTimeout(r, 50))
    server.simulateDisconnect()
    await callPromise
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

    // 第二次断开 — canRetry() 已为 false，不应再重连
    const closePromise = new Promise<void>((resolve) => transport.once('close', resolve))
    server.simulateDisconnect()

    // 等待 close，验证最终停止
    await closePromise
    expect(transport.state).toBe('disconnected')
  })

  it('达到最大重试次数后触发 giveUp 事件', async () => {
    transport = new WebSocketTransport({
      url: server.url,
      reconnect: { initialDelay: 50, maxDelay: 100, jitter: 0, maxRetries: 1 },
    })
    await transport.connect()

    const giveUpPromise = new Promise<void>((resolve) => transport.once('giveUp', resolve))

    // 第一次断开 → 触发第 1 次重连（用完 maxRetries=1），重连应成功
    server.simulateDisconnect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    // 第二次断开 → canRetry() 已为 false，应直接触发 giveUp 而不再重连
    server.simulateDisconnect()
    await giveUpPromise
  })
})
