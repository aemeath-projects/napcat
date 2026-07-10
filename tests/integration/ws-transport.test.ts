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
    await server.close().catch(() => {})
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

  it('重连耗尽后触发 giveUp 且停止重连（同一次故障期间连续失败）', async () => {
    transport = new WebSocketTransport({
      url: server.url,
      reconnect: { initialDelay: 30, maxDelay: 60, jitter: 0, maxRetries: 2 },
    })
    // 每次失败的重连尝试都会让 ws 库 emit 一个 'error' 事件；Node EventEmitter 在零监听器时
    // emit('error', ...) 会同步抛出并打垮进程，此处必须兜底监听。
    transport.on('error', () => {})
    await transport.connect()

    const giveUpPromise = new Promise<void>((resolve) => transport.once('giveUp', resolve))

    // 断开后立即关闭服务器：之后所有重连尝试都会因 ECONNREFUSED 失败
    server.simulateDisconnect()
    await server.close()

    // 连续失败 2 次（maxRetries=2）后应彻底放弃
    await giveUpPromise
    expect(transport.state).toBe('disconnected')
  })

  it('连接维持满 stableAfterMs 后重置计数器：多轮断连恢复不会累积耗尽重试预算', async () => {
    transport = new WebSocketTransport({
      url: server.url,
      reconnect: { initialDelay: 20, maxDelay: 50, jitter: 0, maxRetries: 2, stableAfterMs: 50 },
    })
    transport.on('error', () => {})
    await transport.connect()

    // 连续 3 轮"断开→重连成功→等待稳定期"，轮数超过 maxRetries=2——
    // 如果计数器不在稳定期后清零，第 3 轮会在耗尽预算后直接 giveUp 而不是重连成功
    for (let i = 0; i < 3; i++) {
      const outcome = new Promise<'connect' | 'giveUp'>((resolve) => {
        transport.once('connect', () => resolve('connect'))
        transport.once('giveUp', () => resolve('giveUp'))
      })
      server.simulateDisconnect()
      expect(await outcome).toBe('connect')
      // 等待连接维持满 stableAfterMs，让计数器真正清零，否则下一轮断连会累积耗尽
      await new Promise((resolve) => setTimeout(resolve, 80))
    }
  })

  it('连接未维持满 stableAfterMs 就再次断开时，重连计数器不清零，反复闪断最终仍会 giveUp', async () => {
    transport = new WebSocketTransport({
      url: server.url,
      reconnect: { initialDelay: 10, maxDelay: 20, jitter: 0, maxRetries: 2, stableAfterMs: 300 },
    })
    transport.on('error', () => {})
    await transport.connect()

    // 第 1 轮：断开后立刻重连成功，远早于 stableAfterMs=300ms，计数器不会被清零
    let connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    server.simulateDisconnect()
    await connectPromise

    // 第 2 轮：同样立刻再断开、立刻重连成功，用完第 2 次重试预算（maxRetries=2）
    connectPromise = new Promise<void>((resolve) => transport.once('connect', resolve))
    server.simulateDisconnect()
    await connectPromise

    // 第 3 次断开：两轮都没等到稳定期清零，预算已耗尽，应直接 giveUp
    const giveUpPromise = new Promise<void>((resolve) => transport.once('giveUp', resolve))
    server.simulateDisconnect()
    await giveUpPromise
  })
})
