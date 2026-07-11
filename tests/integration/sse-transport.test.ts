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

  it('stableAfterMs=0 时连接立即清零：多次断连恢复不会累积耗尽重试预算', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      reconnect: { initialDelay: 20, maxDelay: 50, jitter: 0, maxRetries: 2, stableAfterMs: 0 },
    })
    transport.on('error', () => {})
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))
    await new Promise((resolve) => setTimeout(resolve, 20))

    for (let i = 0; i < 5; i++) {
      const outcome = new Promise<'connect' | 'giveUp'>((resolve) => {
        transport.once('connect', () => resolve('connect'))
        transport.once('giveUp', () => resolve('giveUp'))
      })
      server.closeAllSseConnections()
      expect(await outcome).toBe('connect')
      await new Promise((resolve) => setTimeout(resolve, 20))
    }
  })

  it('connect 网络不可达时触发重连', async () => {
    transport = new SseTransport({
      baseUrl: 'http://127.0.0.1:19999',
      reconnect: { initialDelay: 50, maxDelay: 200, jitter: 0, maxRetries: 2 },
    })
    transport.on('error', () => {})

    const reconnectingPromise = new Promise<[number, number]>((resolve) =>
      transport.once('reconnecting', (a, d) => resolve([a, d])),
    )

    await expect(transport.connect()).rejects.toThrow('SSE 连接失败')

    const [attempt, delay] = await reconnectingPromise
    expect(attempt).toBe(1)
    expect(delay).toBe(50)
  })

  it('connect 返回 503 时触发重连并最终恢复', async () => {
    server.setRejectSse(true)
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      reconnect: { initialDelay: 30, maxDelay: 100, jitter: 0, maxRetries: 5 },
    })
    transport.on('error', () => {})

    const reconnectingPromise = new Promise<[number, number]>((resolve) =>
      transport.once('reconnecting', (a, d) => resolve([a, d])),
    )

    await expect(transport.connect()).rejects.toThrow('SSE 连接失败：HTTP 503')

    const [attempt, delay] = await reconnectingPromise
    expect(attempt).toBe(1)
    expect(delay).toBe(30)

    server.setRejectSse(false)
    await new Promise<void>((resolve) => transport.once('connect', resolve))
    expect(transport.state).toBe('connected')
  })

  it('主动 disconnect 取消稳定期定时器，不影响再次连接与自动重连', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      reconnect: { initialDelay: 30, maxDelay: 60, jitter: 0, maxRetries: 3, stableAfterMs: 500 },
    })
    transport.on('error', () => {})
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    await transport.disconnect()

    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    const outcome = new Promise<'connect' | 'giveUp'>((resolve) => {
      transport.once('connect', () => resolve('connect'))
      transport.once('giveUp', () => resolve('giveUp'))
    })
    server.closeAllSseConnections()
    expect(await outcome).toBe('connect')
  })

  it('connect 失败但未配置 reconnect 时不触发重连', async () => {
    transport = new SseTransport({ baseUrl: 'http://127.0.0.1:19999' })

    let reconnectingFired = false
    transport.on('reconnecting', () => {
      reconnectingFired = true
    })

    await expect(transport.connect()).rejects.toThrow('SSE 连接失败')
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(reconnectingFired).toBe(false)
  })

  it('giveUp 后可通过显式 connect() 恢复连接', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      reconnect: { initialDelay: 10, maxDelay: 20, jitter: 0, maxRetries: 2, stableAfterMs: 300 },
    })
    transport.on('error', () => {})
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    // 快速闪断 2 轮（不等待稳定期），耗尽 maxRetries=2 的预算
    for (let i = 0; i < 2; i++) {
      const cp = new Promise<void>((resolve) => transport.once('connect', resolve))
      server.closeAllSseConnections()
      await cp
    }
    // 第 3 次断开：预算已耗尽，触发 giveUp
    const giveUpPromise = new Promise<void>((resolve) => transport.once('giveUp', resolve))
    server.closeAllSseConnections()
    await giveUpPromise

    // giveUp 后无需重建 transport，直接 connect() 即可恢复
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))
    expect(transport.state).toBe('connected')
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

  it('退避等待期间 state 为 reconnecting，而不是 disconnected', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      reconnect: { initialDelay: 100, maxDelay: 200, jitter: 0 },
    })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    const reconnectingPromise = new Promise<void>((resolve) =>
      transport.once('reconnecting', () => resolve()),
    )
    server.closeAllSseConnections()
    await reconnectingPromise

    expect(transport.state).toBe('reconnecting')

    await new Promise<void>((resolve) => transport.once('connect', resolve))
    expect(transport.state).toBe('connected')
  })

  it('空闲超过 idleTimeoutMs 未收到任何数据时判定僵尸连接，主动断开触发重连', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      idleTimeoutMs: 30,
      reconnect: { initialDelay: 20, maxDelay: 50, jitter: 0 },
    })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    // 不推送任何事件，mock server 默认不会主动发送保活数据，等待空闲超时
    const reconnectingPromise = new Promise<void>((resolve) =>
      transport.once('reconnecting', () => resolve()),
    )
    await reconnectingPromise

    expect(transport.state).toBe('reconnecting')
  })

  it('持续收到事件时不会被误判为空闲僵尸连接', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      idleTimeoutMs: 50,
    })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    const interval = setInterval(() => {
      server.pushEvent({
        post_type: 'meta_event',
        meta_event_type: 'heartbeat',
        time: Date.now(),
        self_id: 0,
      })
    }, 20)

    await new Promise((resolve) => setTimeout(resolve, 120))
    clearInterval(interval)
    expect(transport.state).toBe('connected')
  })

  /** 覆盖率缺口 **/

  it('reconnecting 事件携带正确的 attempt 和 delay 参数', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      reconnect: { initialDelay: 150, maxDelay: 2000, jitter: 0 },
    })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    const payloadPromise = new Promise<[number, number]>((resolve) =>
      transport.once('reconnecting', (a, d) => resolve([a, d])),
    )
    server.closeAllSseConnections()

    const [attempt, delay] = await payloadPromise
    expect(attempt).toBe(1)
    expect(delay).toBe(150)
  })

  it('退避等待期间显式 connect() 取消挂起的重连（connectionId 校验）', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      reconnect: { initialDelay: 200, maxDelay: 500, jitter: 0 },
    })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    const reconnectingPromise = new Promise<void>((resolve) =>
      transport.once('reconnecting', () => resolve()),
    )
    server.closeAllSseConnections()
    await reconnectingPromise
    expect(transport.state).toBe('reconnecting')

    // 显式 connect() 会递增 _connectionId，使得旧重连定时的 snapshotId 不匹配
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))
    expect(transport.state).toBe('connected')

    // 等待原重连定时器应当触发的时间点之后，验证不会创建第二条 SSE 连接
    let secondConnect = false
    transport.once('connect', () => {
      secondConnect = true
    })
    await new Promise((resolve) => setTimeout(resolve, 250))
    expect(secondConnect).toBe(false)
    expect(transport.state).toBe('connected')
  })

  it('reconnecting 状态下 disconnect() 直接转换状态并 emit close', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      reconnect: { initialDelay: 200, maxDelay: 500, jitter: 0 },
    })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    const reconnectingPromise = new Promise<void>((resolve) =>
      transport.once('reconnecting', () => resolve()),
    )
    server.closeAllSseConnections()
    await reconnectingPromise
    expect(transport.state).toBe('reconnecting')

    let closeEmitted = false
    transport.on('close', () => {
      closeEmitted = true
    })

    const start = Date.now()
    await transport.disconnect()
    const elapsed = Date.now() - start

    expect(transport.state).toBe('disconnected')
    expect(elapsed).toBeLessThan(200)
    expect(closeEmitted).toBe(true)
  })

  it('disconnect 正确清理空闲超时定时器，断开后状态一致', async () => {
    transport = new SseTransport({
      baseUrl: server.baseUrl,
      idleTimeoutMs: 30,
      reconnect: { initialDelay: 50, maxDelay: 200, jitter: 0 },
    })
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))

    // 等待一段时间但不推送事件（空闲计时器在运行）
    await new Promise((resolve) => setTimeout(resolve, 10))

    // disconnect 应清理空闲计时器，不依赖其超时触发 abort
    await transport.disconnect()
    expect(transport.state).toBe('disconnected')

    // 等待原空闲超时应过期的时间后，确认未触发意外的重连
    await new Promise((resolve) => setTimeout(resolve, 40))
    expect(transport.state).toBe('disconnected')

    // 可以立即重新连接
    await transport.connect()
    await new Promise<void>((resolve) => transport.once('connect', resolve))
    expect(transport.state).toBe('connected')
  })

  it('connect() 进行中被 disconnect() 中断（AbortError）时应静默返回不抛异常', async () => {
    transport = new SseTransport({ baseUrl: server.baseUrl })
    const connectPromise = transport.connect()
    // disconnect 立刻 abort fetch，connect 应因 AbortError 静默返回
    await transport.disconnect()
    await expect(connectPromise).resolves.toBeUndefined()
    expect(transport.state).toBe('disconnected')
  })

  it('从未建立连接时 disconnect() 安全调用空 abort', async () => {
    transport = new SseTransport({ baseUrl: server.baseUrl })
    const start = Date.now()
    await transport.disconnect()
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(100)
    expect(transport.state).toBe('disconnected')
  })

  /** 高并发鲁棒性 **/

  it('快速交替 connect/disconnect 50 次，状态一致无异常', async () => {
    transport = new SseTransport({ baseUrl: server.baseUrl })

    for (let i = 0; i < 50; i++) {
      await transport.connect()
      await new Promise<void>((resolve) => transport.once('connect', resolve))
      expect(transport.state).toBe('connected')

      await transport.disconnect()
      expect(transport.state).toBe('disconnected')
    }
  })

  it('并发 connect() ×3 不抛异常，最终状态为 connected', async () => {
    transport = new SseTransport({ baseUrl: server.baseUrl })
    await Promise.all([transport.connect(), transport.connect(), transport.connect()])
    await new Promise<void>((resolve) => transport.once('connect', resolve))
    expect(transport.state).toBe('connected')
  })

  it('call() 在不建立 SSE 连接时仍可通过 HTTP POST 正常工作', async () => {
    server.onAction('send_private_msg', (body) => ({
      message_id: Number(body.user_id ?? 0),
    }))
    transport = new SseTransport({ baseUrl: server.baseUrl })
    // 不调用 connect()，直接通过 HTTP POST 调用 API
    const resp = await transport.call('send_private_msg', { user_id: 999 })
    expect(resp.status).toBe('ok')
    expect((resp.data as Record<string, unknown>).message_id).toBe(999)
    expect(transport.state).toBe('disconnected')
  })
})
