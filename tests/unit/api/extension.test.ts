import { describe, it, expect, vi } from 'vitest'

import { ExtensionApi } from '../../../src/api/extension.js'
import type { NapCatClient } from '../../../src/core/client.js'

function mockClient(data: unknown = null) {
  return {
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode: 0, data }),
  } as unknown as NapCatClient
}

describe('ExtensionApi', () => {
  it('groupPoke', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.groupPoke(1001, 9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('group_poke', {
      group_id: 1001,
      user_id: 9999,
    })
  })
  it('sendLike via friendPoke', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.friendPoke(9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('friend_poke', {
      user_id: 9999,
    })
  })
  it('translateEn2Zh', async () => {
    const client = mockClient(['你好'])
    const api = new ExtensionApi(client)
    const result = await api.translateEn2Zh(['hello'])
    expect(result.ok).toBe(true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('translate_en2zh', {
      words: ['hello'],
    })
  })
  it('setMsgEmojiLike', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.setMsgEmojiLike(12345, '128514')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_msg_emoji_like', {
      message_id: 12345,
      emoji_id: '128514',
    })
  })
  it('setOnlineStatus', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.setOnlineStatus(10, 0)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_online_status', {
      status: 10,
      ext_status: 0,
    })
  })
  it('getRkey', async () => {
    const client = mockClient([])
    const api = new ExtensionApi(client)
    await api.getRkey()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_rkey', {})
  })
  it('getAiCharacters', async () => {
    const client = mockClient([])
    const api = new ExtensionApi(client)
    await api.getAiCharacters(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_ai_characters', {
      group_id: 1001,
    })
  })
  it('getAiRecord', async () => {
    const client = mockClient({ url: 'https://ai.record' })
    const api = new ExtensionApi(client)
    await api.getAiRecord('char1', '你好', 1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_ai_record', {
      character: 'char1',
      text: '你好',
      group_id: 1001,
    })
  })
  it('sendGroupAiRecord', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.sendGroupAiRecord(1001, 'char1', '你好')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_group_ai_record', {
      group_id: 1001,
      character: 'char1',
      text: '你好',
    })
  })
  it('setInputStatus', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.setInputStatus(1, 9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_input_status', {
      event_type: 1,
      user_id: 9999,
    })
  })
  it('getGroupIgnoreAddRequest', async () => {
    const client = mockClient([])
    const api = new ExtensionApi(client)
    await api.getGroupIgnoreAddRequest(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_group_ignore_add_request',
      { group_id: 1001 },
    )
  })
})
