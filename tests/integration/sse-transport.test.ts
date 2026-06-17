import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { SseTransport } from '../../src/transport'

import { MockNapCatSseServer } from './helpers/mock-sse-server.js'

describe('SseTransport SSE 传输', () => {
  let server: MockNapCatSseServer
  let transport: SseTransport

  beforeEach(async () => {
    server = new MockNapCatSseServer()
    await server.listen()
  })

  afterEach(async () => {
    await transport?.disconnect().catch(() => {})
    await server.close()
  })

  it('connect() 建立 SSE 连接', async () => {
    transport = new SseTransport({ baseUrl: server.baseUrl })
    const connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    await transport.connect()
    await connectPromise
    expect(transport.state).toBe('connected')
  })

  it('接收 SSE 事件', async () => {
    transport = new SseTransport({ baseUrl: server.baseUrl })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

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

  it('call() 发送 POST 请求', async () => {
    server.onAction('send_msg', (body) => ({ message_id: Number(body.user_id ?? 0) }))
    transport = new SseTransport({ baseUrl: server.baseUrl })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    const resp = await transport.call('send_msg', { user_id: 100 })
    expect(resp.status).toBe('ok')
    expect((resp.data as Record<string, unknown>).message_id).toBe(100)
  })

  it('disconnect() 关闭连接', async () => {
    transport = new SseTransport({ baseUrl: server.baseUrl })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))
    await transport.disconnect()
    expect(transport.state).toBe('disconnected')
  })

  it('SSE 连接断开后自动重连', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      reconnect: { initialDelay: 100, maxDelay: 200, jitter: 0 },
    })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    // 触发重连
    const reconnectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    server.closeAllSseConnections()

    // 等待重连成功
    await reconnectPromise
    expect(transport.state).toBe('connected')
  })

  it('call() 配置 token 时附加 Authorization header', async () => {
    server.onAction('send_msg', (body) => ({ message_id: Number(body.user_id ?? 0) }))
    transport = new SseTransport({ baseUrl: server.baseUrl, token: 'sse-token' })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    const resp = await transport.call('send_msg', { user_id: 100 })
    expect(resp.status).toBe('ok')
  })

  it('call() 请求不存在的服务器时抛出 TransportError', async () => {
    transport = new SseTransport({ baseUrl: 'http://127.0.0.1:19999' })
    // 在不建立 SSE 连接的情况下直接 call
    await expect(transport.call('any_action', {})).rejects.toThrow('HTTP 请求失败')
  })
})
