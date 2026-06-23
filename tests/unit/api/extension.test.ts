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
      battery_status: undefined,
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
      chat_type: undefined,
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
    await api.setInputStatus(9999, 1)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_input_status', {
      user_id: 9999,
      event_type: 1,
    })
  })
  it('getGroupIgnoreAddRequest 获取忽略的群加人请求', async () => {
    const client = mockClient([])
    const api = new ExtensionApi(client)
    await api.getGroupIgnoreAddRequest()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_group_ignore_add_request',
      {},
    )
  })
  it('arkSharePeer Ark 分享好友', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.arkSharePeer('13800138000', 9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('ArkSharePeer', {
      phone_number: '13800138000',
      user_id: 9999,
      group_id: undefined,
    })
  })
  it('arkShareGroup Ark 分享群', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.arkShareGroup(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('ArkShareGroup', {
      group_id: 1001,
    })
  })
  it('createCollection 创建收藏', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.createCollection('raw_data', '收藏简要')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('create_collection', {
      raw_data: 'raw_data',
      brief: '收藏简要',
    })
  })
  it('getCollectionList 获取收藏列表', async () => {
    const client = mockClient([])
    const api = new ExtensionApi(client)
    await api.getCollectionList()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_collection_list', {
      category: undefined,
      count: undefined,
    })
  })
  it('fetchCustomFace 获取自定义表情', async () => {
    const client = mockClient({})
    const api = new ExtensionApi(client)
    await api.fetchCustomFace(10)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('fetch_custom_face', {
      count: 10,
    })
  })
  it('fetchCustomFace 无参数', async () => {
    const client = mockClient({})
    const api = new ExtensionApi(client)
    await api.fetchCustomFace()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('fetch_custom_face', {
      count: undefined,
    })
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

  // ── 4.18.6+ 扩展端点测试 ──

  it('addCustomFace 添加自定义表情', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.addCustomFace('/path/img.png', { emojiId: '123', packageId: 'pkg_001' })
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('add_custom_face', {
      file: '/path/img.png',
      emoji_id: '123',
      package_id: 'pkg_001',
    })
  })

  it('deleteCustomFace 删除自定义表情', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.deleteCustomFace({ resId: 'res_001', md5: 'md5_hash' })
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('delete_custom_face', {
      res_id: 'res_001',
      md5: 'md5_hash',
    })
  })

  it('deleteCustomFace 无参数时使用空对象', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.deleteCustomFace()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('delete_custom_face', {})
  })

  it('fetchCustomFaceDetail 获取自定义表情详情', async () => {
    const client = mockClient([])
    const api = new ExtensionApi(client)
    await api.fetchCustomFaceDetail(20)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'fetch_custom_face_detail',
      {
        count: 20,
      },
    )
  })

  it('setCustomFaceDesc 修改自定义表情描述', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.setCustomFaceDesc('emoji_001', 'res_001', 'md5_hash', '新描述')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_custom_face_desc', {
      emoji_id: 'emoji_001',
      res_id: 'res_001',
      md5: 'md5_hash',
      desc: '新描述',
    })
  })

  it('sendFlashMsg 发送闪传消息', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.sendFlashMsg('fs_flash_001', 9999, 1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_flash_msg', {
      fileset_id: 'fs_flash_001',
      user_id: 9999,
      group_id: 1001,
    })
  })

  it('getEmojiLikes 获取消息表情点赞列表', async () => {
    const client = mockClient([])
    const api = new ExtensionApi(client)
    await api.getEmojiLikes(1001, 'msg_001', '128514', 20, 1)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_emoji_likes', {
      group_id: 1001,
      message_id: 'msg_001',
      emoji_id: '128514',
      count: 20,
      emoji_type: 1,
    })
  })

  it('fetchPttText 获取语音转文字结果', async () => {
    const client = mockClient({ text: '你好' })
    const api = new ExtensionApi(client)
    const result = await api.fetchPttText('msg_001')
    expect(result.ok).toBe(true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('fetch_ptt_text', {
      message_id: 'msg_001',
    })
  })

  it('getGuildList 获取频道列表', async () => {
    const client = mockClient([])
    const api = new ExtensionApi(client)
    await api.getGuildList()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_guild_list', {})
  })

  it('getGuildServiceProfile 获取频道个人信息', async () => {
    const client = mockClient({})
    const api = new ExtensionApi(client)
    await api.getGuildServiceProfile()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_guild_service_profile',
      {},
    )
  })

  it('getRkeyV2 获取扩展 RKey', async () => {
    const client = mockClient([])
    const api = new ExtensionApi(client)
    await api.getRkeyV2()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_rkey', {})
  })

  it('getRkeyServer 获取 RKey 服务器', async () => {
    const client = mockClient({})
    const api = new ExtensionApi(client)
    await api.getRkeyServer()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_rkey_server', {})
  })

  it('sendPacket 发送原始数据包', async () => {
    const client = mockClient({})
    const api = new ExtensionApi(client)
    await api.sendPacket('Heartbeat.Alive', '{}', '{}')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_packet', {
      cmd: 'Heartbeat.Alive',
      data: '{}',
      rsp: '{}',
    })
  })

  it('sendArkShare 分享用户（新 Ark 接口）', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.sendArkShare('13800138000', 9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_ark_share', {
      phone_number: '13800138000',
      user_id: 9999,
      group_id: undefined,
    })
  })

  it('sendGroupArkShare 分享群（新 Ark 接口）', async () => {
    const client = mockClient()
    const api = new ExtensionApi(client)
    await api.sendGroupArkShare(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_group_ark_share', {
      group_id: 1001,
    })
  })
})
