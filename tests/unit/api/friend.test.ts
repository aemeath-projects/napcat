import { describe, it, expect, vi } from 'vitest'

import { FriendApi } from '../../../src/api/friend.js'
import type { NapCatClient } from '../../../src/core/client.js'

function mockClient(data: unknown = null) {
  return {
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode: 0, data }),
  } as unknown as NapCatClient
}

describe('FriendApi', () => {
  it('getFriendList', async () => {
    const client = mockClient([])
    const api = new FriendApi(client)
    await api.getFriendList()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_friend_list', {})
  })
  it('sendLike', async () => {
    const client = mockClient()
    const api = new FriendApi(client)
    await api.sendLike(9999, 10)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_like', {
      user_id: 9999,
      times: 10,
    })
  })
  it('setFriendAddRequest', async () => {
    const client = mockClient()
    const api = new FriendApi(client)
    await api.setFriendAddRequest('flag123', true, 'remark')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_friend_add_request', {
      flag: 'flag123',
      approve: true,
      remark: 'remark',
    })
  })
  it('setGroupAddRequest', async () => {
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
})
