import { describe, it, expect, vi } from 'vitest'

import { ExtensionApi } from '../../../src/api'
import type { NapCatClient } from '../../../src/core'

function mockClient(data: unknown = null) {
  return {
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode: 0, data }),
  } as unknown as NapCatClient
}

describe('拓展 API', () => {
  it('groupPoke 群戳一戳', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.groupPoke(1001, 9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('group_poke', {
      group_id: 1001,
      user_id: 9999,
    })
  })
  it('friendPoke 好友戳一戳', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.friendPoke(9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('friend_poke', {
      user_id: 9999,
    })
  })
  it('translateEn2Zh 英译中', async () => {
    const client = mockClient(['你好'])
    const api = new ExtensionApi(client)
    const result = await api.translateEn2Zh(['hello'])
    expect(result.ok).toBe(true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('translate_en2zh', {
      words: ['hello'],
    })
  })
  it('setMsgEmojiLike 设置消息表情点赞', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.setMsgEmojiLike(12345, '128514')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_msg_emoji_like', {
      message_id: 12345,
      emoji_id: '128514',
    })
  })
  it('setOnlineStatus 设置在线状态', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.setOnlineStatus(10, 0)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_online_status', {
      status: 10,
      ext_status: 0,
    })
  })
  it('getRkey 获取 Rkey', async () => {
    const client = mockClient([])
    const api = new ExtensionApi(client)
    await api.getRkey()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('nc_get_rkey', {})
  })
  it('getAiCharacters 获取 AI 角色', async () => {
    const client = mockClient([])
    const api = new ExtensionApi(client)
    await api.getAiCharacters(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_ai_characters', {
      group_id: 1001,
    })
  })
  it('getAiRecord 获取 AI 语音', async () => {
    const client = mockClient({ url: 'https://ai.record' })
    const api = new ExtensionApi(client)
    await api.getAiRecord('char1', '你好', 1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_ai_record', {
      character: 'char1',
      text: '你好',
      group_id: 1001,
    })
  })
  it('sendGroupAiRecord 发送群 AI 语音', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.sendGroupAiRecord(1001, 'char1', '你好')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_group_ai_record', {
      group_id: 1001,
      character: 'char1',
      text: '你好',
    })
  })
  it('setInputStatus 设置输入状态', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.setInputStatus(1, 9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_input_status', {
      event_type: 1,
      user_id: 9999,
    })
  })
  it('getGroupIgnoreAddRequest 获取忽略的群加人请求', async () => {
    const client = mockClient([])
    const api = new ExtensionApi(client)
    await api.getGroupIgnoreAddRequest(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_group_ignore_add_request',
      { group_id: 1001 },
    )
  })
  it('arkSharePeer Ark 分享好友', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.arkSharePeer({ peer_id: 9999 })
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('ArkSharePeer', {
      peer_id: 9999,
    })
  })
  it('arkShareGroup Ark 分享群', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.arkShareGroup({ group_id: 1001 })
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('ArkShareGroup', {
      group_id: 1001,
    })
  })
  it('createCollection 创建收藏', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.createCollection({ type: 1, content: '收藏内容' })
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('create_collection', {
      type: 1,
      content: '收藏内容',
    })
  })
  it('getCollectionList 获取收藏列表', async () => {
    const client = mockClient([])
    const api = new ExtensionApi(client)
    await api.getCollectionList()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_collection_list', {})
  })
  it('fetchCustomFace 获取自定义表情', async () => {
    const client = mockClient({})
    const api = new ExtensionApi(client)
    await api.fetchCustomFace({ count: 10 })
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('fetch_custom_face', {
      count: 10,
    })
  })
  it('fetchCustomFace 无参数时使用空对象', async () => {
    const client = mockClient({})
    const api = new ExtensionApi(client)
    await api.fetchCustomFace()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('fetch_custom_face', {})
  })
  it('markAllAsRead 全部标记已读', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.markAllAsRead()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('_mark_all_as_read', {})
  })
  it('forwardGroupSingleMsg 转发群单条消息', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.forwardGroupSingleMsg(1001, 'msg_001')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'forward_group_single_msg',
      {
        group_id: 1001,
        message_id: 'msg_001',
      },
    )
  })
  it('getMiniAppArk 获取小程序 Ark 签名', async () => {
    const client = mockClient({ data: 'ark_signature' })
    const api = new ExtensionApi(client)
    const result = await api.getMiniAppArk({ app_id: 'mini_001' })
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_mini_app_ark', {
      app_id: 'mini_001',
    })
    expect(result.ok).toBe(true)
  })
})
