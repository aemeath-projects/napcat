import { describe, it, expect, vi } from 'vitest'

import { GroupApi } from '../../../src/api'
import type { NapCatClient } from '../../../src/core'

function mockClient(data: unknown = null) {
  return {
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode: 0, data }),
  } as unknown as NapCatClient
}

describe('群 API', () => {
  it('getGroupList 调用 get_group_list', async () => {
    const client = mockClient([])
    const api = new GroupApi(client)
    await api.getGroupList()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_list', {})
  })
  it('setGroupKick 踢出群成员', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupKick(1001, 9999, true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_kick', {
      group_id: 1001,
      user_id: 9999,
      reject_add_request: true,
    })
  })
  it('setGroupBan 禁言群成员', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupBan(1001, 9999, 3600)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_ban', {
      group_id: 1001,
      user_id: 9999,
      duration: 3600,
    })
  })
  it('setEssenceMsg 设置精华消息', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setEssenceMsg(12345)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_essence_msg', {
      message_id: 12345,
    })
  })
  it('出错时返回 ok:false', async () => {
    const client = {
      call: vi.fn().mockResolvedValue({ status: 'failed', retcode: 100, data: null }),
    } as unknown as NapCatClient
    const api = new GroupApi(client)
    const result = await api.getGroupList()
    expect(result.ok).toBe(false)
  })
  it('getGroupMemberList 获取群成员列表', async () => {
    const client = mockClient([])
    const api = new GroupApi(client)
    await api.getGroupMemberList(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_member_list', {
      group_id: 1001,
    })
  })
  it('setGroupWholeBan 全员禁言', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupWholeBan(1001, true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_whole_ban', {
      group_id: 1001,
      enable: true,
    })
  })
  it('setGroupAdmin 设置群管理员', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupAdmin(1001, 9999, true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_admin', {
      group_id: 1001,
      user_id: 9999,
      enable: true,
    })
  })
  it('setGroupName 设置群名', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupName(1001, '新群名')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_name', {
      group_id: 1001,
      group_name: '新群名',
    })
  })
  it('sendGroupSign 发送群签到', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.sendGroupSign(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_group_sign', {
      group_id: 1001,
    })
  })
  it('deleteEssenceMsg 删除精华消息', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.deleteEssenceMsg(9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('delete_essence_msg', {
      message_id: 9999,
    })
  })
  it('sendGroupNotice 发送群公告', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.sendGroupNotice(1001, 'content')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('_send_group_notice', {
      group_id: 1001,
      content: 'content',
      image: undefined,
    })
  })
  it('getGroupInfo 获取群信息', async () => {
    const client = mockClient({ group_id: 1001, group_name: 'Test' })
    const api = new GroupApi(client)
    await api.getGroupInfo(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_info', {
      group_id: 1001,
    })
  })
  it('getGroupMemberInfo 获取群成员信息', async () => {
    const client = mockClient({ user_id: 9999, group_id: 1001 })
    const api = new GroupApi(client)
    await api.getGroupMemberInfo(1001, 9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_member_info', {
      group_id: 1001,
      user_id: 9999,
    })
  })
  it('setGroupCard 设置群名片', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupCard(1001, 9999, '新昵称')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_card', {
      group_id: 1001,
      user_id: 9999,
      card: '新昵称',
    })
  })
  it('setGroupLeave 退出群', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupLeave(1001, false)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_leave', {
      group_id: 1001,
      is_dismiss: false,
    })
  })
  it('setGroupSpecialTitle 设置群头衔', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupSpecialTitle(1001, 9999, '称号')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'set_group_special_title',
      { group_id: 1001, user_id: 9999, special_title: '称号' },
    )
  })
  it('getGroupHonorInfo 获取群荣誉', async () => {
    const client = mockClient({ group_id: 1001, talkative_list: [] })
    const api = new GroupApi(client)
    await api.getGroupHonorInfo(1001, 'talkative')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_honor_info', {
      group_id: 1001,
      type: 'talkative',
    })
  })
  it('getEssenceMsgList 获取精华消息列表', async () => {
    const client = mockClient([])
    const api = new GroupApi(client)
    await api.getEssenceMsgList(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_essence_msg_list', {
      group_id: 1001,
    })
  })
  it('getGroupNotice 获取群公告', async () => {
    const client = mockClient([])
    const api = new GroupApi(client)
    await api.getGroupNotice(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('_get_group_notice', {
      group_id: 1001,
    })
  })
  it('getGroupInfoEx 获取扩展群信息', async () => {
    const client = mockClient({
      group_id: 1001,
      group_name: 'Test',
      member_count: 50,
      max_member_count: 200,
    })
    const api = new GroupApi(client)
    await api.getGroupInfoEx(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_info_ex', {
      group_id: 1001,
    })
  })
  it('getGroupAtAllRemain 获取 @全体剩余次数', async () => {
    const client = mockClient({ can_at_all: true, remain_at_all_count_for_group: 10 })
    const api = new GroupApi(client)
    await api.getGroupAtAllRemain(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_group_at_all_remain',
      {
        group_id: 1001,
      },
    )
  })
  it('setGroupPortrait 设置群头像', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupPortrait(1001, '/path/to/avatar.png', 1)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_portrait', {
      group_id: 1001,
      file: '/path/to/avatar.png',
      cache: 1,
    })
  })
  it('deleteGroupNotice 删除群公告', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.deleteGroupNotice(1001, 'notice_001')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('_del_group_notice', {
      group_id: 1001,
      notice_id: 'notice_001',
    })
  })
  it('getGroupShutList 获取禁言列表', async () => {
    const client = mockClient([])
    const api = new GroupApi(client)
    await api.getGroupShutList(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_shut_list', {
      group_id: 1001,
    })
  })
  it('setGroupSign 群签到', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupSign(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_sign', {
      group_id: 1001,
    })
  })
  it('setGroupRemark 设置群备注', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupRemark(1001, '备注名')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_remark', {
      group_id: 1001,
      remark: '备注名',
    })
  })
  it('getGroupSystemMsg 获取群系统消息', async () => {
    const client = mockClient({})
    const api = new GroupApi(client)
    await api.getGroupSystemMsg()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_system_msg', {})
  })
  it('getGroupIgnoredNotifies 获取被忽略的群通知', async () => {
    const client = mockClient([])
    const api = new GroupApi(client)
    await api.getGroupIgnoredNotifies()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_group_ignored_notifies',
      {},
    )
  })
})
