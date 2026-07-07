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
      pinned: undefined,
      type: undefined,
      confirm_required: undefined,
      is_show_edit_card: undefined,
      tip_window_type: undefined,
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
    await api.setGroupPortrait(1001, '/path/to/avatar.png')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_portrait', {
      group_id: 1001,
      file: '/path/to/avatar.png',
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
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_system_msg', {
      count: undefined,
    })
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

  /* 4.18.8+ 群相关端点测试 */

  it('getGroupDetailInfo 获取群详细信息', async () => {
    const client = mockClient({ group_id: 1001, group_name: 'Test', member_count: 50 })
    const api = new GroupApi(client)
    const result = await api.getGroupDetailInfo(1001)
    expect(result.ok).toBe(true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_detail_info', {
      group_id: 1001,
    })
  })

  it('getGroupSignedList 获取群打卡列表', async () => {
    const client = mockClient([])
    const api = new GroupApi(client)
    await api.getGroupSignedList(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_signed_list', {
      group_id: 1001,
    })
  })

  it('getQunAlbumList 获取群相册列表', async () => {
    const client = mockClient([])
    const api = new GroupApi(client)
    await api.getQunAlbumList(1001, 'attach_info_abc')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_qun_album_list', {
      group_id: 1001,
      attach_info: 'attach_info_abc',
    })
  })

  it('getGroupAlbumMediaList 获取群相册媒体列表', async () => {
    const client = mockClient([])
    const api = new GroupApi(client)
    await api.getGroupAlbumMediaList(1001, 'album_001')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_group_album_media_list',
      {
        group_id: 1001,
        album_id: 'album_001',
        attach_info: undefined,
      },
    )
  })

  it('delGroupAlbumMedia 删除群相册媒体', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.delGroupAlbumMedia(1001, 'album_001', 'lloc_abc')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('del_group_album_media', {
      group_id: 1001,
      album_id: 'album_001',
      lloc: 'lloc_abc',
    })
  })

  it('setGroupAlbumMediaLike 点赞群相册媒体', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupAlbumMediaLike(1001, 'album_001', 'batch_001', 'lloc_abc')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'set_group_album_media_like',
      {
        group_id: 1001,
        album_id: 'album_001',
        batch_id: 'batch_001',
        lloc: 'lloc_abc',
      },
    )
  })

  it('cancelGroupAlbumMediaLike 取消点赞群相册媒体', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.cancelGroupAlbumMediaLike(1001, 'album_001', 'batch_001')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'cancel_group_album_media_like',
      {
        group_id: 1001,
        album_id: 'album_001',
        batch_id: 'batch_001',
        lloc: undefined,
      },
    )
  })

  it('doGroupAlbumComment 发表群相册评论', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.doGroupAlbumComment(1001, 'album_001', 'lloc_abc', '好照片！')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('do_group_album_comment', {
      group_id: 1001,
      album_id: 'album_001',
      lloc: 'lloc_abc',
      content: '好照片！',
    })
  })

  it('uploadImageToQunAlbum 上传图片到群相册', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.uploadImageToQunAlbum(1001, 'album_001', '旅行相册', '/path/photo.jpg')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'upload_image_to_qun_album',
      {
        group_id: 1001,
        album_id: 'album_001',
        album_name: '旅行相册',
        file: '/path/photo.jpg',
      },
    )
  })

  it('setGroupTodo 设置群待办', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupTodo(1001, 'msg_001', 'seq_001')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_todo', {
      group_id: 1001,
      message_id: 'msg_001',
      message_seq: 'seq_001',
    })
  })

  it('completeGroupTodo 完成群待办', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.completeGroupTodo(1001, 'msg_002', 'seq_002')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('complete_group_todo', {
      group_id: 1001,
      message_id: 'msg_002',
      message_seq: 'seq_002',
    })
  })

  it('cancelGroupTodo 取消群待办', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.cancelGroupTodo(1001, 'msg_003', 'seq_003')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('cancel_group_todo', {
      group_id: 1001,
      message_id: 'msg_003',
      message_seq: 'seq_003',
    })
  })

  it('setGroupAddOption 设置群加群选项', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupAddOption(1001, 2, '问题', '答案')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_add_option', {
      group_id: 1001,
      add_type: 2,
      group_question: '问题',
      group_answer: '答案',
    })
  })

  it('setGroupRobotAddOption 设置群机器人加群选项', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupRobotAddOption(1001, 1, 1)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'set_group_robot_add_option',
      {
        group_id: 1001,
        robot_member_switch: 1,
        robot_member_examine: 1,
      },
    )
  })

  it('setGroupSearch 设置群搜索选项', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupSearch(1001, true, false)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_search', {
      group_id: 1001,
      no_code_finger_open: true,
      no_finger_open: false,
    })
  })

  it('setGroupKickMembers 批量踢出群成员', async () => {
    const client = mockClient()
    const api = new GroupApi(client)
    await api.setGroupKickMembers(1001, [9998, 9999])
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_group_kick_members', {
      group_id: 1001,
      user_id: [9998, 9999],
    })
  })
})
