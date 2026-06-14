import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { ConnectionError } from '../../src/core/errors.js'
import { HttpTransport } from '../../src/transport/http.js'

import { MockNapCatHttpServer } from './helpers/mock-http-server.js'

describe('HttpTransport', () => {
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

  it('connect() performs health check and succeeds', async () => {
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

  it('connect() throws ConnectionError if health check fails', async () => {
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

  it('call() sends POST to apiBaseUrl/action', async () => {
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

  it('receives events from NapCat event POST', async () => {
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
    await fetch(eventServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_type: 'meta_event',
        meta_event_type: 'heartbeat',
        time: Date.now(),
        self_id: 0,
      }),
    })

    const event = await eventPromise
    expect((event as Record<string, unknown>).post_type).toBe('meta_event')
  })

  it('disconnect() stops the event server', async () => {
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
})
