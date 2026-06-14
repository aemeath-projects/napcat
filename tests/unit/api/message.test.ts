import { describe, it, expect, vi } from 'vitest'

import { MessageApi } from '../../../src/api/message.js'
import type { NapCatClient } from '../../../src/core/client.js'

function mockClient(retcode = 0, data: unknown = null): NapCatClient {
  return {
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode, data }),
  } as unknown as NapCatClient
}

describe('MessageApi', () => {
  it('sendGroupMsg calls send_group_msg with correct params', async () => {
    const client = mockClient(0, { message_id: 100 })
    const api = new MessageApi(client)
    const result = await api.sendGroupMsg(1001, [{ type: 'text', data: { text: 'hello' } }])
    expect(result.ok).toBe(true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_group_msg', {
      group_id: 1001,
      message: [{ type: 'text', data: { text: 'hello' } }],
    })
  })

  it('sendPrivateMsg calls send_private_msg', async () => {
    const client = mockClient(0, { message_id: 200 })
    const api = new MessageApi(client)
    const result = await api.sendPrivateMsg(9999, [])
    expect(result.ok).toBe(true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_private_msg', {
      user_id: 9999,
      message: [],
    })
  })

  it('deleteMsg calls delete_msg', async () => {
    const client = mockClient()
    const api = new MessageApi(client)
    await api.deleteMsg(12345)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('delete_msg', {
      message_id: 12345,
    })
  })

  it('returns ok:false when retcode is non-zero', async () => {
    const client = {
      call: vi
        .fn()
        .mockResolvedValue({ status: 'failed', retcode: 100, data: null, message: 'error' }),
    } as unknown as NapCatClient
    const api = new MessageApi(client)
    const result = await api.sendGroupMsg(1, [])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(100)
      expect(result.error.message).toBe('error')
    }
  })

  it('getMsg calls get_msg', async () => {
    const client = mockClient(0, { message_id: 1, raw_message: 'test' })
    const api = new MessageApi(client)
    await api.getMsg(1)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_msg', {
      message_id: 1,
    })
  })

  it('markMsgAsRead calls mark_msg_as_read', async () => {
    const client = mockClient()
    const api = new MessageApi(client)
    await api.markMsgAsRead(1)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('mark_msg_as_read', {
      message_id: 1,
    })
  })
  it('sendMsg calls send_msg', async () => {
    const client = mockClient(0, { message_id: 300 })
    const api = new MessageApi(client)
    await api.sendMsg({ message_type: 'group', group_id: 1001, message: [] })
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_msg', {
      message_type: 'group',
      group_id: 1001,
      message: [],
    })
  })
  it('getForwardMsg calls get_forward_msg', async () => {
    const client = mockClient(0, { messages: [] })
    const api = new MessageApi(client)
    await api.getForwardMsg('fwd_id_abc')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_forward_msg', {
      id: 'fwd_id_abc',
    })
  })
  it('sendGroupForwardMsg calls send_group_forward_msg', async () => {
    const client = mockClient(0, { message_id: 400 })
    const api = new MessageApi(client)
    await api.sendGroupForwardMsg(1001, [])
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_group_forward_msg', {
      group_id: 1001,
      messages: [],
    })
  })
  it('sendPrivateForwardMsg calls send_private_forward_msg', async () => {
    const client = mockClient(0, { message_id: 500 })
    const api = new MessageApi(client)
    await api.sendPrivateForwardMsg(9999, [])
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'send_private_forward_msg',
      { user_id: 9999, messages: [] },
    )
  })
  it('getGroupMsgHistory calls get_group_msg_history', async () => {
    const client = mockClient(0, [])
    const api = new MessageApi(client)
    await api.getGroupMsgHistory(1001, 100, 20)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_msg_history', {
      group_id: 1001,
      message_seq: 100,
      count: 20,
    })
  })
  it('getFriendMsgHistory calls get_friend_msg_history', async () => {
    const client = mockClient(0, [])
    const api = new MessageApi(client)
    await api.getFriendMsgHistory(9999, 50, 10)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_friend_msg_history', {
      user_id: 9999,
      message_seq: 50,
      count: 10,
    })
  })
})
