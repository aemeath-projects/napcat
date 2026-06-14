import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { SseTransport } from '../../src/transport/sse.js'

import { MockNapCatSseServer } from './helpers/mock-sse-server.js'

describe('SseTransport', () => {
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

  it('connect() establishes SSE connection', async () => {
    transport = new SseTransport({ baseUrl: server.baseUrl })
    const connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    await transport.connect()
    await connectPromise
    expect(transport.state).toBe('connected')
  })

  it('receives SSE events', async () => {
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
    expect((event as Record<string, unknown>).post_type).toBe('meta_event')
  })

  it('call() sends POST request', async () => {
    server.onAction('send_msg', (body) => ({ message_id: Number(body.user_id ?? 0) }))
    transport = new SseTransport({ baseUrl: server.baseUrl })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    const resp = await transport.call('send_msg', { user_id: 100 })
    expect(resp.status).toBe('ok')
    expect((resp.data as Record<string, unknown>).message_id).toBe(100)
  })

  it('disconnect() closes connection', async () => {
    transport = new SseTransport({ baseUrl: server.baseUrl })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))
    await transport.disconnect()
    expect(transport.state).toBe('disconnected')
  })

  it('reconnects after SSE connection drops', async () => {
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
})
