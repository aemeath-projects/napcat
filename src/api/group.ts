import type { Result } from '../core/result.js'
import type {
  GroupInfo,
  GroupInfoEx,
  GroupMember,
  HonorType,
  GroupHonor,
  EssenceMsg,
  GroupNotice,
  GroupAtAllRemain,
  GroupShutMember,
  GroupSystemMsg,
  IgnoredRequest,
} from '../types/api.js'

import { BaseApi } from './base.js'

/** 群聊相关 API 模块。 */
export class GroupApi extends BaseApi {
  /** 获取群列表。 */
  getGroupList(): Promise<Result<GroupInfo[]>> {
    return this.invoke('get_group_list')
  }

  /** 获取群信息。 */
  getGroupInfo(groupId: number): Promise<Result<GroupInfo>> {
    return this.invoke('get_group_info', { group_id: groupId })
  }

  /** 获取群扩展信息。 */
  getGroupInfoEx(groupId: number): Promise<Result<GroupInfoEx>> {
    return this.invoke('get_group_info_ex', { group_id: groupId })
  }

  /** 获取群成员列表。 */
  getGroupMemberList(groupId: number): Promise<Result<GroupMember[]>> {
    return this.invoke('get_group_member_list', { group_id: groupId })
  }

  /** 获取群成员信息。 */
  getGroupMemberInfo(groupId: number, userId: number): Promise<Result<GroupMember>> {
    return this.invoke('get_group_member_info', { group_id: groupId, user_id: userId })
  }

  /** 群组踢人。 */
  setGroupKick(groupId: number, userId: number, rejectAddRequest?: boolean): Promise<Result<void>> {
    return this.invoke('set_group_kick', {
      group_id: groupId,
      user_id: userId,
      reject_add_request: rejectAddRequest,
    })
  }

  /** 群组单人禁言。 */
  setGroupBan(groupId: number, userId: number, duration?: number): Promise<Result<void>> {
    return this.invoke('set_group_ban', { group_id: groupId, user_id: userId, duration })
  }

  /** 群组全员禁言。 */
  setGroupWholeBan(groupId: number, enable?: boolean): Promise<Result<void>> {
    return this.invoke('set_group_whole_ban', { group_id: groupId, enable })
  }

  /** 群组设置管理员。 */
  setGroupAdmin(groupId: number, userId: number, enable?: boolean): Promise<Result<void>> {
    return this.invoke('set_group_admin', { group_id: groupId, user_id: userId, enable })
  }

  /** 设置群名片（群备注）。 */
  setGroupCard(groupId: number, userId: number, card: string): Promise<Result<void>> {
    return this.invoke('set_group_card', { group_id: groupId, user_id: userId, card })
  }

  /** 设置群名。 */
  setGroupName(groupId: number, name: string): Promise<Result<void>> {
    return this.invoke('set_group_name', { group_id: groupId, group_name: name })
  }

  /** 退出群组。 */
  setGroupLeave(groupId: number, isDismiss?: boolean): Promise<Result<void>> {
    return this.invoke('set_group_leave', { group_id: groupId, is_dismiss: isDismiss })
  }

  /** 设置群组专属头衔。 */
  setGroupSpecialTitle(groupId: number, userId: number, title: string): Promise<Result<void>> {
    return this.invoke('set_group_special_title', {
      group_id: groupId,
      user_id: userId,
      special_title: title,
    })
  }

  /** 设置群备注。 */
  setGroupRemark(groupId: number, remark: string): Promise<Result<void>> {
    return this.invoke('set_group_remark', { group_id: groupId, remark })
  }

  /** 设置群头像。 */
  setGroupPortrait(groupId: number, file: string, cache?: number): Promise<Result<void>> {
    return this.invoke('set_group_portrait', { group_id: groupId, file, cache })
  }

  /** 群签到。 */
  setGroupSign(groupId: number): Promise<Result<void>> {
    return this.invoke('set_group_sign', { group_id: groupId })
  }

  /** 群打卡。 */
  sendGroupSign(groupId: number): Promise<Result<void>> {
    return this.invoke('send_group_sign', { group_id: groupId })
  }

  /** 获取群荣誉信息。 */
  getGroupHonorInfo(groupId: number, type: HonorType): Promise<Result<GroupHonor>> {
    return this.invoke('get_group_honor_info', { group_id: groupId, type })
  }

  /** 获取群 @全体成员 剩余次数。 */
  getGroupAtAllRemain(groupId: number): Promise<Result<GroupAtAllRemain>> {
    return this.invoke('get_group_at_all_remain', { group_id: groupId })
  }

  /** 获取群系统消息。 */
  getGroupSystemMsg(): Promise<Result<GroupSystemMsg>> {
    return this.invoke('get_group_system_msg')
  }

  /** 获取群通知忽略列表。 */
  getGroupIgnoredNotifies(): Promise<Result<IgnoredRequest[]>> {
    return this.invoke('get_group_ignored_notifies')
  }

  /** 获取群禁言列表。 */
  getGroupShutList(groupId: number): Promise<Result<GroupShutMember[]>> {
    return this.invoke('get_group_shut_list', { group_id: groupId })
  }

  /** 设置精华消息。 */
  setEssenceMsg(messageId: number): Promise<Result<void>> {
    return this.invoke('set_essence_msg', { message_id: messageId })
  }

  /** 移出精华消息。 */
  deleteEssenceMsg(messageId: number): Promise<Result<void>> {
    return this.invoke('delete_essence_msg', { message_id: messageId })
  }

  /** 获取精华消息列表。 */
  getEssenceMsgList(groupId: number): Promise<Result<EssenceMsg[]>> {
    return this.invoke('get_essence_msg_list', { group_id: groupId })
  }

  /** 发送群公告。 */
  sendGroupNotice(groupId: number, content: string, image?: string): Promise<Result<void>> {
    return this.invoke('_send_group_notice', { group_id: groupId, content, image })
  }

  /** 获取群公告。 */
  getGroupNotice(groupId: number): Promise<Result<GroupNotice[]>> {
    return this.invoke('_get_group_notice', { group_id: groupId })
  }

  /** 删除群公告。 */
  deleteGroupNotice(groupId: number, noticeId: string): Promise<Result<void>> {
    return this.invoke('_del_group_notice', { group_id: groupId, notice_id: noticeId })
  }
}
