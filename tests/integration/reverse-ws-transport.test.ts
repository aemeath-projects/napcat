import { describe, it, expect, afterEach } from 'vitest'

import { TimeoutError } from '../../src/core'
import { ReverseWebSocketTransport } from '../../src/transport'

import { MockNapCatWsClient } from './helpers/mock-ws-client.js'

describe('ReverseWebSocketTransport 反向 WebSocket 传输', () => {
  let transport: ReverseWebSocketTransport
  let client: MockNapCatWsClient

  afterEach(async () => {
    await client?.disconnect().catch(() => {})
    await transport?.disconnect().catch(() => {})
  })

  it('connect() 启动服务器并接受传入连接', async () => {
    transport = new ReverseWebSocketTransport({ host: '127.0.0.1', port: 0, path: '/ws' })
    const connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    await transport.connect()

    client = new MockNapCatWsClient()
    await client.connect(transport.url)
    await connectPromise

    expect(transport.state).toBe('connected')
  })

  it('拒绝 token 无效的连接（关闭码 4001）', async () => {
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

  it('接受 token 正确的连接', async () => {
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

  it('接受通过 Bearer header 传递 token 的连接', async () => {
    transport = new ReverseWebSocketTransport({
      host: '127.0.0.1',
      port: 0,
      path: '/ws',
      token: 'bearer-token',
    })
    await transport.connect()

    // 使用原生 WebSocket 发送 Bearer header 进行鉴权
    const { WebSocket: RawWs } = await import('ws')
    const connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    const ws = new RawWs(transport.url, {
      headers: { Authorization: 'Bearer bearer-token' },
    })

    await new Promise<void>((resolve, reject) => {
      ws.on('open', resolve)
      ws.on('error', reject)
      const timeout = setTimeout(() => reject(new Error('连接超时')), 2000)
      ws.on('open', () => clearTimeout(timeout))
    })

    await connectPromise
    expect(transport.state).toBe('connected')
    ws.close()
  })

  it('maxConnections=1 时拒绝第二个连接（关闭码 4002）', async () => {
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

  it('客户端断开后服务器继续运行', async () => {
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

  it('未收到响应时 call() 超时', async () => {
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

  it('call() 发送请求并接收 echo 响应', async () => {
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

  it('通过 "event" 发射器接收推送事件', async () => {
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
    expect((event as Record<string, unknown>).postType).toBe('meta_event')
  })

  it('disconnect() 关闭服务器', async () => {
    transport = new ReverseWebSocketTransport({ host: '127.0.0.1', port: 0, path: '/ws' })
    await transport.connect()
    await transport.disconnect()
    expect(transport.state).toBe('disconnected')
  })

  it('客户端断时有挂起的 call() 应全部 reject', async () => {
    transport = new ReverseWebSocketTransport({
      host: '127.0.0.1',
      port: 0,
      path: '/ws',
      timeout: 5000,
    })
    await transport.connect()

    client = new MockNapCatWsClient()
    const connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    await client.connect(transport.url)
    await connectPromise

    const callPromise = expect(transport.call('pending_action', {})).rejects.toThrow(
      'WebSocket 连接已断开',
    )

    await new Promise((r) => setTimeout(r, 50))
    await client.disconnect()
    await callPromise
  })

  it('无 token 的请求在配置 token 时被拒绝（触发 _getTokenFromRequest 返回 undefined）', async () => {
    transport = new ReverseWebSocketTransport({
      host: '127.0.0.1',
      port: 0,
      path: '/ws',
      token: 'valid-token',
    })
    await transport.connect()

    // WebSocket 握手先成功完成，然后服务端立刻下发 close(4001)
    const { WebSocket: RawWs } = await import('ws')
    const ws = new RawWs(transport.url)
    await new Promise<void>((resolve) => {
      ws.on('close', (code) => {
        expect(code).toBe(4001)
        resolve()
      })
    })
  })
})
