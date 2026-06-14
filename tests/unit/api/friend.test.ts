import { describe, it, expect, vi } from 'vitest'

import { FriendApi } from '../../../src/api/friend.js'
import type { NapCatClient } from '../../../src/core/client.js'

function mockClient(data: unknown = null) {
  return {
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode: 0, data }),
  } as unknown as NapCatClient
}

describe('好友 API', () => {
  it('getFriendList 获取好友列表', async () => {
    const client = mockClient([])
    const api = new FriendApi(client)
    await api.getFriendList()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_friend_list', {})
  })
  it('sendLike 发送点赞', async () => {
    const client = mockClient()
    const api = new FriendApi(client)
    await api.sendLike(9999, 10)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_like', {
      user_id: 9999,
      times: 10,
    })
  })
  it('setFriendAddRequest 处理好友添加请求', async () => {
    const client = mockClient()
    const api = new FriendApi(client)
    await api.setFriendAddRequest('flag123', true, 'remark')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_friend_add_request', {
      flag: 'flag123',
      approve: true,
      remark: 'remark',
    })
  })
  it('setGroupAddRequest 处理群添加请求', async () => {
    const client = mockClient()
    const api = new FriendApi(client)
    await api.setGroupAddRequest('flag456', 'add', false, 'no')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_add_request', {
      flag: 'flag456',
      sub_type: 'add',
      approve: false,
      reason: 'no',
    })
  })
  it('getFriendsWithCategory 获取带分类的好友列表', async () => {
    const client = mockClient([])
    const api = new FriendApi(client)
    await api.getFriendsWithCategory()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_friends_with_category',
      {},
    )
  })
  it('getUnidirectionalFriendList 获取单向好友列表', async () => {
    const client = mockClient([])
    const api = new FriendApi(client)
    await api.getUnidirectionalFriendList()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_unidirectional_friend_list',
      {},
    )
  })
  it('markPrivateMsgAsRead 标记私聊消息已读', async () => {
    const client = mockClient()
    const api = new FriendApi(client)
    await api.markPrivateMsgAsRead(9999, 1234567890)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'mark_private_msg_as_read',
      {
        user_id: 9999,
        time: 1234567890,
      },
    )
  })
  it('forwardFriendSingleMsg 转发好友单条消息', async () => {
    const client = mockClient()
    const api = new FriendApi(client)
    await api.forwardFriendSingleMsg(9999, 'msg_001')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'forward_friend_single_msg',
      {
        user_id: 9999,
        message_id: 'msg_001',
      },
    )
  })
  it('setFriendRemark 设置好友备注', async () => {
    const client = mockClient()
    const api = new FriendApi(client)
    await api.setFriendRemark(9999, '备注')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_friend_remark', {
      user_id: 9999,
      remark: '备注',
    })
  })
  it('getProfileLike 获取资料点赞', async () => {
    const client = mockClient({ like_list: [] })
    const api = new FriendApi(client)
    await api.getProfileLike()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_profile_like', {})
  })
  it('fetchEmojiLike 获取表情点赞', async () => {
    const client = mockClient({ emoji_likes_list: [] })
    const api = new FriendApi(client)
    await api.fetchEmojiLike()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('fetch_emoji_like', {})
  })
  it('ncGetUserStatus 获取用户状态', async () => {
    const client = mockClient({ user_id: 9999, status: 10, ext_status: 0 })
    const api = new FriendApi(client)
    await api.ncGetUserStatus(9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('nc_get_user_status', {
      user_id: 9999,
    })
  })
  it('deleteFriend 删除好友', async () => {
    const client = mockClient()
    const api = new FriendApi(client)
    await api.deleteFriend(9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('delete_friend', {
      user_id: 9999,
    })
  })
})
