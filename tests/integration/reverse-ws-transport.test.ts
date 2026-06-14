import { describe, it, expect, afterEach } from 'vitest'

import { TimeoutError } from '../../src/core/errors.js'
import { ReverseWebSocketTransport } from '../../src/transport/reverse-ws.js'

import { MockNapCatWsClient } from './helpers/mock-ws-client.js'

describe('ReverseWebSocketTransport', () => {
  let transport: ReverseWebSocketTransport
  let client: MockNapCatWsClient

  afterEach(async () => {
    await client?.disconnect().catch(() => {})
    await transport?.disconnect().catch(() => {})
  })

  it('connect() starts server and accepts incoming connection', async () => {
    transport = new ReverseWebSocketTransport({ host: '127.0.0.1', port: 0, path: '/ws' })
    const connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    await transport.connect()

    client = new MockNapCatWsClient()
    await client.connect(transport.url)
    await connectPromise

    expect(transport.state).toBe('connected')
  })

  it('rejects connection with invalid token (close code 4001)', async () => {
    transport = new ReverseWebSocketTransport({
      host: '127.0.0.1',
      port: 0,
      path: '/ws',
      token: 'valid-token',
    })
    await transport.connect()

    client = new MockNapCatWsClient()
    await expect(client.connect(transport.url, 'wrong-token')).rejects.toThrow()
  })

  it('accepts connection with correct token', async () => {
    transport = new ReverseWebSocketTransport({
      host: '127.0.0.1',
      port: 0,
      path: '/ws',
      token: 'valid-token',
    })
    const connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    await transport.connect()

    client = new MockNapCatWsClient()
    await client.connect(transport.url, 'valid-token')
    await connectPromise

    expect(transport.state).toBe('connected')
  })

  it('rejects second connection when maxConnections=1 (close code 4002)', async () => {
    transport = new ReverseWebSocketTransport({
      host: '127.0.0.1',
      port: 0,
      path: '/ws',
      maxConnections: 1,
    })
    const connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    await transport.connect()

    client = new MockNapCatWsClient()
    await client.connect(transport.url)
    await connectPromise

    // 第二个客户端连接应该被拒绝
    const client2 = new MockNapCatWsClient()
    await expect(client2.connect(transport.url)).rejects.toThrow()
  })

  it('server keeps running after client disconnects', async () => {
    transport = new ReverseWebSocketTransport({ host: '127.0.0.1', port: 0, path: '/ws' })
    const firstConnect = new Promise<void>((resolve) => transport.once('connect', resolve))
    await transport.connect()

    client = new MockNapCatWsClient()
    await client.connect(transport.url)
    await firstConnect

    const closePromise = new Promise<void>((resolve) => transport.once('close', resolve))
    await client.disconnect()
    await closePromise

    expect(transport.state).toBe('disconnected')

    // server 仍在运行，可以接受新连接
    const secondConnect = new Promise<void>((resolve) => transport.once('connect', resolve))
    const client2 = new MockNapCatWsClient()
    await client2.connect(transport.url)
    await secondConnect
    expect(transport.state).toBe('connected')
    await client2.disconnect()
  })

  it('call() times out when no response received', async () => {
    transport = new ReverseWebSocketTransport({
      host: '127.0.0.1',
      port: 0,
      path: '/ws',
      timeout: 100,
    })
    await transport.connect()

    client = new MockNapCatWsClient()
    const connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    await client.connect(transport.url)
    await connectPromise

    // client 不响应，验证 timeout 行为
    await expect(transport.call('test_action', {})).rejects.toBeInstanceOf(TimeoutError)
  })

  it('call() sends request and receives echo response', async () => {
    transport = new ReverseWebSocketTransport({
      host: '127.0.0.1',
      port: 0,
      path: '/ws',
      timeout: 1000,
    })
    await transport.connect()

    client = new MockNapCatWsClient()
    const connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    await client.connect(transport.url)
    await connectPromise

    // mock client 监听并回复 API 调用（模拟 NapCat 响应）
    const { WebSocket: _WsClass } = await import('ws')
    // 直接用底层 ws 连接监听消息并回复
    const ws2 = (client as unknown as { ws: InstanceType<typeof _WsClass> }).ws
    ws2?.on('message', (raw: unknown) => {
      try {
        const msg = JSON.parse(raw!.toString()) as { action: string; echo?: string }
        if (msg.echo) {
          ws2.send(
            JSON.stringify({
              status: 'ok',
              retcode: 0,
              data: { result: 42 },
              echo: msg.echo,
            }),
          )
        }
      } catch {
        /* ignore */
      }
    })

    const resp = await transport.call('test_action', {})
    expect(resp.status).toBe('ok')
    expect(resp.retcode).toBe(0)
  })

  it('receives pushed events via "event" emitter', async () => {
    transport = new ReverseWebSocketTransport({ host: '127.0.0.1', port: 0, path: '/ws' })
    await transport.connect()

    client = new MockNapCatWsClient()
    const connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    await client.connect(transport.url)
    await connectPromise

    const eventPromise = new Promise<unknown>((resolve) => transport.once('event', resolve))
    client.pushEvent({
      post_type: 'meta_event',
      meta_event_type: 'heartbeat',
      time: Date.now(),
      self_id: 0,
    })
    const event = await eventPromise
    expect((event as Record<string, unknown>).post_type).toBe('meta_event')
  })

  it('disconnect() closes server', async () => {
    transport = new ReverseWebSocketTransport({ host: '127.0.0.1', port: 0, path: '/ws' })
    await transport.connect()
    await transport.disconnect()
    expect(transport.state).toBe('disconnected')
  })
})
