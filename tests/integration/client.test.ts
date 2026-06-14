import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { NapCatClient } from '../../src/core/client.js'
import { WebSocketTransport } from '../../src/transport/ws.js'

import { MockNapCatWsServer } from './helpers/mock-ws-server.js'

describe('NapCatClient', () => {
  let server: MockNapCatWsServer
  let transport: WebSocketTransport
  let client: NapCatClient

  beforeEach(async () => {
    server = new MockNapCatWsServer()
    await server.listen()
    transport = new WebSocketTransport({ url: server.url })
    client = new NapCatClient(transport)
  })

  afterEach(async () => {
    await client.disconnect().catch(() => {})
    await server.close()
  })

  it('connect/disconnect delegates to transport', async () => {
    await client.connect()
    expect(client.transport.state).toBe('connected')
    await client.disconnect()
    expect(client.transport.state).toBe('disconnected')
  })

  it('forwards connect and close events from transport', async () => {
    const connectSpy = vi.fn()
    const closeSpy = vi.fn()
    client.on('connect', connectSpy)
    client.on('close', closeSpy)
    await client.connect()
    expect(connectSpy).toHaveBeenCalledTimes(1)
    await client.disconnect()
    expect(closeSpy).toHaveBeenCalledTimes(1)
  })

  it('dispatches message.group event for group messages', async () => {
    await client.connect()
    const spy = vi.fn()
    client.on('message.group', spy)

    server.pushEvent({
      post_type: 'message',
      message_type: 'group',
      group_id: 1001,
      message_id: 1,
      user_id: 9999,
      time: Date.now(),
      self_id: 1000,
      raw_message: 'hello',
      message: [{ type: 'text', data: { text: 'hello' } }],
    })

    await new Promise((r) => setTimeout(r, 20))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0].message_type).toBe('group')
  })

  it('dispatches message event for all messages', async () => {
    await client.connect()
    const spy = vi.fn()
    client.on('message', spy)

    server.pushEvent({
      post_type: 'message',
      message_type: 'private',
      message_id: 2,
      user_id: 8888,
      time: Date.now(),
      self_id: 1000,
      raw_message: 'hi',
      message: [],
    })

    await new Promise((r) => setTimeout(r, 20))
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('dispatches message_sent event (no sub-key dispatch)', async () => {
    await client.connect()
    const messageSentSpy = vi.fn()
    const messageSpy = vi.fn()
    client.on('message_sent', messageSentSpy)
    client.on('message', messageSpy) // message_sent 不应触发 'message'

    server.pushEvent({
      post_type: 'message_sent',
      message_type: 'group',
      target_id: 1001,
      message_id: 3,
      user_id: 1000,
      time: Date.now(),
      self_id: 1000,
      raw_message: 'bot sent',
      message: [],
    })

    await new Promise((r) => setTimeout(r, 20))
    expect(messageSentSpy).toHaveBeenCalledTimes(1)
    expect(messageSpy).toHaveBeenCalledTimes(0) // message_sent ≠ message
  })

  it('dispatches notice.group_ban for group ban notices', async () => {
    await client.connect()
    const specificSpy = vi.fn()
    const generalSpy = vi.fn()
    client.on('notice.group_ban', specificSpy)
    client.on('notice', generalSpy)

    server.pushEvent({
      post_type: 'notice',
      notice_type: 'group_ban',
      sub_type: 'ban',
      group_id: 1001,
      user_id: 9999,
      operator_id: 1000,
      duration: 60,
      time: Date.now(),
      self_id: 1000,
    })

    await new Promise((r) => setTimeout(r, 20))
    expect(specificSpy).toHaveBeenCalledTimes(1)
    expect(generalSpy).toHaveBeenCalledTimes(1)
  })

  it('dispatches request events correctly', async () => {
    await client.connect()
    const specificSpy = vi.fn()
    const generalSpy = vi.fn()
    client.on('request.friend', specificSpy)
    client.on('request', generalSpy)

    server.pushEvent({
      post_type: 'request',
      request_type: 'friend',
      user_id: 7777,
      comment: 'add me',
      flag: 'test-flag',
      time: Date.now(),
      self_id: 1000,
    })

    await new Promise((r) => setTimeout(r, 20))
    expect(specificSpy).toHaveBeenCalledTimes(1)
    expect(generalSpy).toHaveBeenCalledTimes(1)
  })

  it('call() delegates to transport', async () => {
    server.onAction('get_login_info', () => ({ status: 'ok', retcode: 0, data: { user_id: 1234 } }))
    await client.connect()
    const resp = await client.call('get_login_info', {})
    expect(resp.status).toBe('ok')
    expect((resp.data as Record<string, unknown>).user_id).toBe(1234)
  })
})
