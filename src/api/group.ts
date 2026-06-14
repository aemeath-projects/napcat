import type { Result } from '../core/result.js'
import type {
  GroupInfo,
  GroupMember,
  HonorType,
  GroupHonor,
  EssenceMsg,
  GroupNotice,
} from '../types/api.js'

import { BaseApi } from './base.js'

export class GroupApi extends BaseApi {
  getGroupList(): Promise<Result<GroupInfo[]>> {
    return this.invoke('get_group_list')
  }
  getGroupInfo(groupId: number): Promise<Result<GroupInfo>> {
    return this.invoke('get_group_info', { group_id: groupId })
  }
  getGroupMemberList(groupId: number): Promise<Result<GroupMember[]>> {
    return this.invoke('get_group_member_list', { group_id: groupId })
  }
  getGroupMemberInfo(groupId: number, userId: number): Promise<Result<GroupMember>> {
    return this.invoke('get_group_member_info', { group_id: groupId, user_id: userId })
  }
  setGroupKick(groupId: number, userId: number, rejectAddRequest?: boolean): Promise<Result<void>> {
    return this.invoke('set_group_kick', {
      group_id: groupId,
      user_id: userId,
      reject_add_request: rejectAddRequest,
    })
  }
  setGroupBan(groupId: number, userId: number, duration?: number): Promise<Result<void>> {
    return this.invoke('set_group_ban', { group_id: groupId, user_id: userId, duration })
  }
  setGroupWholeBan(groupId: number, enable?: boolean): Promise<Result<void>> {
    return this.invoke('set_group_whole_ban', { group_id: groupId, enable })
  }
  setGroupAdmin(groupId: number, userId: number, enable?: boolean): Promise<Result<void>> {
    return this.invoke('set_group_admin', { group_id: groupId, user_id: userId, enable })
  }
  setGroupCard(groupId: number, userId: number, card: string): Promise<Result<void>> {
    return this.invoke('set_group_card', { group_id: groupId, user_id: userId, card })
  }
  setGroupName(groupId: number, name: string): Promise<Result<void>> {
    return this.invoke('set_group_name', { group_id: groupId, group_name: name })
  }
  setGroupLeave(groupId: number, isDismiss?: boolean): Promise<Result<void>> {
    return this.invoke('set_group_leave', { group_id: groupId, is_dismiss: isDismiss })
  }
  setGroupSpecialTitle(groupId: number, userId: number, title: string): Promise<Result<void>> {
    return this.invoke('set_group_special_title', {
      group_id: groupId,
      user_id: userId,
      special_title: title,
    })
  }
  sendGroupSign(groupId: number): Promise<Result<void>> {
    return this.invoke('send_group_sign', { group_id: groupId })
  }
  getGroupHonorInfo(groupId: number, type: HonorType): Promise<Result<GroupHonor>> {
    return this.invoke('get_group_honor_info', { group_id: groupId, type })
  }
  setEssenceMsg(messageId: number): Promise<Result<void>> {
    return this.invoke('set_essence_msg', { message_id: messageId })
  }
  deleteEssenceMsg(messageId: number): Promise<Result<void>> {
    return this.invoke('delete_essence_msg', { message_id: messageId })
  }
  getEssenceMsgList(groupId: number): Promise<Result<EssenceMsg[]>> {
    return this.invoke('get_essence_msg_list', { group_id: groupId })
  }
  sendGroupNotice(groupId: number, content: string, image?: string): Promise<Result<void>> {
    return this.invoke('_send_group_notice', { group_id: groupId, content, image })
  }
  getGroupNotice(groupId: number): Promise<Result<GroupNotice[]>> {
    return this.invoke('_get_group_notice', { group_id: groupId })
  }
}
