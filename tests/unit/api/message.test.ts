import { describe, it, expect, vi } from 'vitest'

import { MessageApi } from '../../../src/api'
import type { NapCatClient } from '../../../src/core'

function mockClient(retcode = 0, data: unknown = null): NapCatClient {
  return {
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode, data }),
  } as unknown as NapCatClient
}

describe('消息 API', () => {
  it('sendGroupMsg 使用正确参数调用 send_group_msg', async () => {
    const client = mockClient(0, { message_id: 100 })
    const api = new MessageApi(client)
    const result = await api.sendGroupMsg(1001, [{ type: 'text', data: { text: 'hello' } }])
    expect(result.ok).toBe(true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_group_msg', {
      group_id: 1001,
      message: [{ type: 'text', data: { text: 'hello' } }],
    })
  })

  it('sendPrivateMsg 调用 send_private_msg', async () => {
    const client = mockClient(0, { message_id: 200 })
    const api = new MessageApi(client)
    const result = await api.sendPrivateMsg(9999, [])
    expect(result.ok).toBe(true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_private_msg', {
      user_id: 9999,
      message: [],
    })
  })

  it('deleteMsg 调用 delete_msg', async () => {
    const client = mockClient()
    const api = new MessageApi(client)
    await api.deleteMsg(12345)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('delete_msg', {
      message_id: 12345,
    })
  })

  it('retcode 非零时返回 ok:false', async () => {
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

  it('getMsg 调用 get_msg', async () => {
    const client = mockClient(0, { message_id: 1, raw_message: 'test' })
    const api = new MessageApi(client)
    await api.getMsg(1)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_msg', {
      message_id: 1,
    })
  })

  it('markMsgAsRead 调用 mark_msg_as_read', async () => {
    const client = mockClient()
    const api = new MessageApi(client)
    await api.markMsgAsRead(1)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('mark_msg_as_read', {
      message_id: 1,
    })
  })
  it('sendMsg 调用 send_msg', async () => {
    const client = mockClient(0, { message_id: 300 })
    const api = new MessageApi(client)
    await api.sendMsg({ message_type: 'group', group_id: 1001, message: [] })
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_msg', {
      message_type: 'group',
      group_id: 1001,
      message: [],
    })
  })
  it('getForwardMsg 调用 get_forward_msg', async () => {
    const client = mockClient(0, { messages: [] })
    const api = new MessageApi(client)
    await api.getForwardMsg('fwd_id_abc')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_forward_msg', {
      id: 'fwd_id_abc',
    })
  })
  it('sendGroupForwardMsg 调用 send_group_forward_msg', async () => {
    const client = mockClient(0, { message_id: 400 })
    const api = new MessageApi(client)
    await api.sendGroupForwardMsg(1001, [])
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_group_forward_msg', {
      group_id: 1001,
      messages: [],
    })
  })
  it('sendPrivateForwardMsg 调用 send_private_forward_msg', async () => {
    const client = mockClient(0, { message_id: 500 })
    const api = new MessageApi(client)
    await api.sendPrivateForwardMsg(9999, [])
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'send_private_forward_msg',
      { user_id: 9999, messages: [] },
    )
  })
  it('getGroupMsgHistory 调用 get_group_msg_history', async () => {
    const client = mockClient(0, [])
    const api = new MessageApi(client)
    await api.getGroupMsgHistory(1001, 100, 20)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_msg_history', {
      group_id: 1001,
      message_seq: 100,
      count: 20,
      reverse_order: undefined,
      disable_get_url: undefined,
      parse_mult_msg: undefined,
      quick_reply: undefined,
    })
  })
  it('getFriendMsgHistory 调用 get_friend_msg_history', async () => {
    const client = mockClient(0, [])
    const api = new MessageApi(client)
    await api.getFriendMsgHistory(9999, 50, 10)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_friend_msg_history', {
      user_id: 9999,
      message_seq: 50,
      count: 10,
      reverse_order: undefined,
      disable_get_url: undefined,
      parse_mult_msg: undefined,
      quick_reply: undefined,
    })
  })
  it('sendForwardMsg 调用 send_forward_msg', async () => {
    const client = mockClient(0, { message_id: 600 })
    const api = new MessageApi(client)
    await api.sendForwardMsg([])
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_forward_msg', {
      messages: [],
    })
  })

  it('markAllAsRead 全部标记已读', async () => {
    const client = mockClient()
    const api = new MessageApi(client)
    await api.markAllAsRead()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('_mark_all_as_read', {})
  })
  it('带 groupId 的 sendPoke 调用 send_poke', async () => {
    const client = mockClient()
    const api = new MessageApi(client)
    await api.sendPoke(9999, 1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_poke', {
      user_id: 9999,
      group_id: 1001,
      target_id: undefined,
    })
  })
  it('不带 groupId 的 sendPoke 调用 send_poke', async () => {
    const client = mockClient()
    const api = new MessageApi(client)
    await api.sendPoke(9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_poke', {
      user_id: 9999,
      group_id: undefined,
      target_id: undefined,
    })
  })
  it('getRecentContact 调用 get_recent_contact', async () => {
    const client = mockClient(0, [])
    const api = new MessageApi(client)
    await api.getRecentContact(10)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_recent_contact', {
      count: 10,
    })
  })
  it('clickInlineKeyboardButton 点击行内键盘按钮', async () => {
    const client = mockClient()
    const api = new MessageApi(client)
    await api.clickInlineKeyboardButton({
      group_id: 1001,
      bot_appid: 'app123',
      button_id: 'btn001',
      callback_data: 'data',
      msg_seq: '1',
    })
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'click_inline_keyboard_button',
      {
        group_id: 1001,
        bot_appid: 'app123',
        button_id: 'btn001',
        callback_data: 'data',
        msg_seq: '1',
      },
    )
  })
  it('getRecentContact 不传 count', async () => {
    const client = mockClient(0, [])
    const api = new MessageApi(client)
    await api.getRecentContact()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_recent_contact', {
      count: undefined,
    })
  })
  it('getGroupMsgHistory 传入全部可选参数', async () => {
    const client = mockClient(0, [])
    const api = new MessageApi(client)
    await api.getGroupMsgHistory(1001, 100, 20, true, true, true, true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_msg_history', {
      group_id: 1001,
      message_seq: 100,
      count: 20,
      reverse_order: true,
      disable_get_url: true,
      parse_mult_msg: true,
      quick_reply: true,
    })
  })
  it('getFriendMsgHistory 传入全部可选参数', async () => {
    const client = mockClient(0, [])
    const api = new MessageApi(client)
    await api.getFriendMsgHistory(9999, 50, 10, true, true, true, true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_friend_msg_history', {
      user_id: 9999,
      message_seq: 50,
      count: 10,
      reverse_order: true,
      disable_get_url: true,
      parse_mult_msg: true,
      quick_reply: true,
    })
  })
})
