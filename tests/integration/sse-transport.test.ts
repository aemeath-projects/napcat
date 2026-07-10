import { createServer } from 'node:http'

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { TransportError } from '../../src/core'
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
    await server.close().catch(() => {})
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

  it('重连耗尽后触发 giveUp 事件（同一次故障期间连续失败）', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      reconnect: { initialDelay: 30, maxDelay: 60, jitter: 0, maxRetries: 2 },
    })
    // 每次失败的重连尝试都会 emit 一个 'error' 事件；EventEmitter 在零监听器时
    // emit('error', ...) 会同步抛出，此处必须兜底监听。
    transport.on('error', () => {})
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    const giveUpPromise = new Promise<void>((resolve) => transport.once('giveUp', resolve))

    server.closeAllSseConnections()
    await server.close()

    await giveUpPromise
  })

  it('连接维持满 stableAfterMs 后重置计数器：多轮断连恢复不会累积耗尽重试预算', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      reconnect: { initialDelay: 20, maxDelay: 50, jitter: 0, maxRetries: 2, stableAfterMs: 50 },
    })
    transport.on('error', () => {})
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    for (let i = 0; i < 3; i++) {
      const outcome = new Promise<'connect' | 'giveUp'>((resolve) => {
        transport.once('connect', () => resolve('connect'))
        transport.once('giveUp', () => resolve('giveUp'))
      })
      server.closeAllSseConnections()
      expect(await outcome).toBe('connect')
      // 等待连接维持满 stableAfterMs，让计数器真正清零，否则下一轮断连会累积耗尽
      await new Promise((resolve) => setTimeout(resolve, 80))
    }
  })

  it('连接未维持满 stableAfterMs 就再次断开时，重连计数器不清零，反复闪断最终仍会 giveUp', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      reconnect: { initialDelay: 10, maxDelay: 20, jitter: 0, maxRetries: 2, stableAfterMs: 300 },
    })
    transport.on('error', () => {})
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    // 第 1 轮：断开后立刻重连成功，远早于 stableAfterMs=300ms，计数器不会被清零
    let connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    server.closeAllSseConnections()
    await connectPromise

    // 第 2 轮：同样立刻再断开、立刻重连成功，用完第 2 次重试预算（maxRetries=2）
    connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    server.closeAllSseConnections()
    await connectPromise

    // 第 3 次断开：两轮都没等到稳定期清零，预算已耗尽，应直接 giveUp
    const giveUpPromise = new Promise<void>((resolve) => transport.once('giveUp', resolve))
    server.closeAllSseConnections()
    await giveUpPromise
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

  it('SSE 返回非 200 状态时抛出 TransportError', async () => {
    // 创建一个返回 503 的 HTTP server 来模拟 SSE 服务不可用
    const badServer = createServer((_req, res) => {
      res.writeHead(503)
      res.end()
    })
    await new Promise<void>((resolve) => badServer.listen(0, '127.0.0.1', () => resolve()))
    const addr = badServer.address()
    const port = typeof addr === 'object' && addr ? addr.port : 0
    const badBaseUrl = `http://127.0.0.1:${port}`

    transport = new SseTransport({ baseUrl: badBaseUrl })
    await expect(transport.connect()).rejects.toBeInstanceOf(TransportError)
    await expect(transport.connect()).rejects.toThrow('SSE 连接失败：HTTP 503')

    await new Promise<void>((resolve) => badServer.close(() => resolve()))
  })
})
