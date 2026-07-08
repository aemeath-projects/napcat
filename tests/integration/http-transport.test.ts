import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { ConnectionError } from '../../src/core'
import { HttpTransport } from '../../src/transport'
import { httpClient } from '../../src/transport/http-client.js'

import { MockNapCatHttpServer } from './helpers/mock-http-server.js'

describe('HttpTransport HTTP 传输', () => {
  let napcat: MockNapCatHttpServer // 模拟 NapCat HTTP API 端点
  let transport: HttpTransport

  beforeEach(async () => {
    napcat = new MockNapCatHttpServer()
    await napcat.listen()
  })

  afterEach(async () => {
    await transport?.disconnect().catch(() => {})
    await napcat.close()
  })

  it('connect() 执行健康检查并成功连接', async () => {
    napcat.onAction('get_login_info', () => ({
      status: 'ok',
      retcode: 0,
      data: { user_id: 1, nickname: 'Bot' },
    }))
    transport = new HttpTransport({
      apiBaseUrl: napcat.baseUrl,
      eventServer: { host: '127.0.0.1', port: 0, path: '/onebot/event' },
    })
    await transport.connect()
    expect(transport.state).toBe('connected')
  })

  it('connect() 健康检查失败时抛出 ConnectionError', async () => {
    napcat.onAction('get_login_info', () => ({
      status: 'failed',
      retcode: 1400,
      data: null,
    }))
    transport = new HttpTransport({
      apiBaseUrl: napcat.baseUrl,
      eventServer: { host: '127.0.0.1', port: 0, path: '/onebot/event' },
    })
    await expect(transport.connect()).rejects.toBeInstanceOf(ConnectionError)
  })

  it('call() 发送 POST 请求到 apiBaseUrl/action', async () => {
    napcat.onAction('get_login_info', () => ({
      status: 'ok',
      retcode: 0,
      data: { user_id: 42 },
    }))
    napcat.onAction('send_group_msg', (body) => ({
      status: 'ok',
      retcode: 0,
      data: { message_id: Number(body.group_id ?? 0) * 100 },
    }))
    transport = new HttpTransport({
      apiBaseUrl: napcat.baseUrl,
      eventServer: { host: '127.0.0.1', port: 0, path: '/onebot/event' },
    })
    await transport.connect()
    const resp = await transport.call('send_group_msg', { group_id: 123 })
    expect(resp.status).toBe('ok')
    expect((resp.data as Record<string, unknown>).message_id).toBe(12300)
  })

  it('通过 NapCat 事件 POST 接收事件', async () => {
    napcat.onAction('get_login_info', () => ({
      status: 'ok',
      retcode: 0,
      data: {},
    }))
    transport = new HttpTransport({
      apiBaseUrl: napcat.baseUrl,
      eventServer: { host: '127.0.0.1', port: 0, path: '/onebot/event' },
    })
    await transport.connect()

    const eventPromise = new Promise<unknown>((resolve) => transport.once('event', resolve))

    // 向 SDK 的 event server 发送事件
    const eventServerUrl = `http://127.0.0.1:${transport.eventServerPort}/onebot/event`
    await httpClient.post(eventServerUrl, {
      post_type: 'meta_event',
      meta_event_type: 'heartbeat',
      time: Date.now(),
      self_id: 0,
    })

    const event = await eventPromise
    expect((event as Record<string, unknown>).postType).toBe('meta_event')
  })

  it('disconnect() 停止事件服务器', async () => {
    napcat.onAction('get_login_info', () => ({
      status: 'ok',
      retcode: 0,
      data: {},
    }))
    transport = new HttpTransport({
      apiBaseUrl: napcat.baseUrl,
      eventServer: { host: '127.0.0.1', port: 0, path: '/onebot/event' },
    })
    await transport.connect()
    await transport.disconnect()
    expect(transport.state).toBe('disconnected')
  })

  it('事件请求发送到错误路径时返回 404', async () => {
    napcat.onAction('get_login_info', () => ({
      status: 'ok',
      retcode: 0,
      data: {},
    }))
    transport = new HttpTransport({
      apiBaseUrl: napcat.baseUrl,
      eventServer: { host: '127.0.0.1', port: 0, path: '/onebot/event' },
    })
    await transport.connect()

    const eventServerUrl = `http://127.0.0.1:${transport.eventServerPort}/wrong-path`
    const resp = await httpClient.post(eventServerUrl)
    expect(resp.status).toBe(404)
  })

  it('Token 鉴权失败时事件请求返回 401', async () => {
    napcat.onAction('get_login_info', () => ({
      status: 'ok',
      retcode: 0,
      data: {},
    }))
    transport = new HttpTransport({
      apiBaseUrl: napcat.baseUrl,
      token: 'secret',
      eventServer: { host: '127.0.0.1', port: 0, path: '/onebot/event' },
    })
    await transport.connect()

    const eventServerUrl = `http://127.0.0.1:${transport.eventServerPort}/onebot/event`
    const resp = await httpClient.post(eventServerUrl)
    expect(resp.status).toBe(401)
  })

  it('通过 Bearer header 传递 token 的事件请求鉴权成功', async () => {
    napcat.onAction('get_login_info', () => ({
      status: 'ok',
      retcode: 0,
      data: {},
    }))
    transport = new HttpTransport({
      apiBaseUrl: napcat.baseUrl,
      token: 'secret',
      eventServer: { host: '127.0.0.1', port: 0, path: '/onebot/event' },
    })
    await transport.connect()

    // 通过 Bearer header 鉴权
    const eventServerUrl = `http://127.0.0.1:${transport.eventServerPort}/onebot/event`
    const eventPromise = new Promise<unknown>((resolve) => transport.once('event', resolve))
    await httpClient.post(
      eventServerUrl,
      {
        post_type: 'meta_event',
        meta_event_type: 'heartbeat',
        time: Date.now(),
        self_id: 0,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer secret',
        },
      },
    )

    const event = await eventPromise
    expect((event as Record<string, unknown>).postType).toBe('meta_event')
  })

  it('connect() 健康检查遇到网络异常时抛出 ConnectionError', async () => {
    napcat.onAction('get_login_info', () => ({
      status: 'ok',
      retcode: 0,
      data: {},
    }))
    // 关闭 napcat mock server，使后续 HTTP 调用失败
    await napcat.close()
    transport = new HttpTransport({
      apiBaseUrl: napcat.baseUrl,
      eventServer: { host: '127.0.0.1', port: 0, path: '/onebot/event' },
    })
    await expect(transport.connect()).rejects.toBeInstanceOf(ConnectionError)
    // 异常后 event server 应已停止，再断一次也是安全的
    await transport.disconnect().catch(() => {})
    // 为 afterEach 重建 napcat
    napcat = new MockNapCatHttpServer()
    await napcat.listen()
  })

  it('通过 query string access_token 传递 token 的事件请求鉴权成功', async () => {
    napcat.onAction('get_login_info', () => ({
      status: 'ok',
      retcode: 0,
      data: {},
    }))
    transport = new HttpTransport({
      apiBaseUrl: napcat.baseUrl,
      token: 'secret',
      eventServer: { host: '127.0.0.1', port: 0, path: '/onebot/event' },
    })
    await transport.connect()

    // 通过 query string 鉴权
    const eventServerUrl = `http://127.0.0.1:${transport.eventServerPort}/onebot/event?access_token=secret`
    const eventPromise = new Promise<unknown>((resolve) => transport.once('event', resolve))
    await httpClient.post(eventServerUrl, {
      post_type: 'meta_event',
      meta_event_type: 'heartbeat',
      time: Date.now(),
      self_id: 0,
    })

    const event = await eventPromise
    expect((event as Record<string, unknown>).postType).toBe('meta_event')
  })
})
