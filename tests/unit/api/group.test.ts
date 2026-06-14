import { describe, it, expect, vi } from 'vitest'

import { GroupApi } from '../../../src/api/group.js'
import type { NapCatClient } from '../../../src/core/client.js'

function mockClient(data: unknown = null) {
  return {
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode: 0, data }),
  } as unknown as NapCatClient
}

describe('GroupApi', () => {
  it('getGroupList calls get_group_list', async () => {
    const client = mockClient([])
    const api = new GroupApi(client)
    await api.getGroupList()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_list', {})
  })
  it('setGroupKick', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupKick(1001, 9999, true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_kick', {
      group_id: 1001,
      user_id: 9999,
      reject_add_request: true,
    })
  })
  it('setGroupBan', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupBan(1001, 9999, 3600)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_ban', {
      group_id: 1001,
      user_id: 9999,
      duration: 3600,
    })
  })
  it('setEssenceMsg', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setEssenceMsg(12345)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_essence_msg', {
      message_id: 12345,
    })
  })
  it('returns ok:false on error', async () => {
    const client = {
      call: vi.fn().mockResolvedValue({ status: 'failed', retcode: 100, data: null }),
    } as unknown as NapCatClient
    const api = new GroupApi(client)
    const result = await api.getGroupList()
    expect(result.ok).toBe(false)
  })
  it('getGroupMemberList', async () => {
    const client = mockClient([])
    const api = new GroupApi(client)
    await api.getGroupMemberList(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_member_list', {
      group_id: 1001,
    })
  })
  it('setGroupWholeBan', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupWholeBan(1001, true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_whole_ban', {
      group_id: 1001,
      enable: true,
    })
  })
  it('setGroupAdmin', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupAdmin(1001, 9999, true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_admin', {
      group_id: 1001,
      user_id: 9999,
      enable: true,
    })
  })
  it('setGroupName', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupName(1001, '新群名')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_name', {
      group_id: 1001,
      group_name: '新群名',
    })
  })
  it('sendGroupSign', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.sendGroupSign(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_group_sign', {
      group_id: 1001,
    })
  })
  it('deleteEssenceMsg', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.deleteEssenceMsg(9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('delete_essence_msg', {
      message_id: 9999,
    })
  })
  it('sendGroupNotice', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.sendGroupNotice(1001, 'content')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('_send_group_notice', {
      group_id: 1001,
      content: 'content',
      image: undefined,
    })
  })
  it('getGroupInfo', async () => {
    const client = mockClient({ group_id: 1001, group_name: 'Test' })
    const api = new GroupApi(client)
    await api.getGroupInfo(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_info', {
      group_id: 1001,
    })
  })
  it('getGroupMemberInfo', async () => {
    const client = mockClient({ user_id: 9999, group_id: 1001 })
    const api = new GroupApi(client)
    await api.getGroupMemberInfo(1001, 9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_member_info', {
      group_id: 1001,
      user_id: 9999,
    })
  })
  it('setGroupCard', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupCard(1001, 9999, '新昵称')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_card', {
      group_id: 1001,
      user_id: 9999,
      card: '新昵称',
    })
  })
  it('setGroupLeave', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupLeave(1001, false)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_leave', {
      group_id: 1001,
      is_dismiss: false,
    })
  })
  it('setGroupSpecialTitle', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupSpecialTitle(1001, 9999, '称号')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'set_group_special_title',
      { group_id: 1001, user_id: 9999, special_title: '称号' },
    )
  })
  it('getGroupHonorInfo', async () => {
    const client = mockClient({ group_id: 1001, talkative_list: [] })
    const api = new GroupApi(client)
    await api.getGroupHonorInfo(1001, 'talkative')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_honor_info', {
      group_id: 1001,
      type: 'talkative',
    })
  })
  it('getEssenceMsgList', async () => {
    const client = mockClient([])
    const api = new GroupApi(client)
    await api.getEssenceMsgList(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_essence_msg_list', {
      group_id: 1001,
    })
  })
  it('getGroupNotice', async () => {
    const client = mockClient([])
    const api = new GroupApi(client)
    await api.getGroupNotice(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('_get_group_notice', {
      group_id: 1001,
    })
  })
})
