import type { Result } from '../core'
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
} from '../types'

import { BaseApi } from './base.js'

/** 群聊相关 API 模块。 */
export class GroupApi extends BaseApi {
  /**
   * 获取群列表。
   * @returns 群信息列表。
   */
  getGroupList(): Promise<Result<GroupInfo[]>> {
    return this.invoke('get_group_list')
  }

  /**
   * 获取群信息。
   * @param groupId - 群号。
   * @returns 群信息。
   */
  getGroupInfo(groupId: number): Promise<Result<GroupInfo>> {
    return this.invoke('get_group_info', { group_id: groupId })
  }

  /**
   * 获取群扩展信息。
   * @param groupId - 群号。
   * @returns 群扩展信息。
   */
  getGroupInfoEx(groupId: number): Promise<Result<GroupInfoEx>> {
    return this.invoke('get_group_info_ex', { group_id: groupId })
  }

  /**
   * 获取群详细信息。
   * @param groupId - 群号。
   * @returns 群详细信息。
   */
  getGroupDetailInfo(groupId: number): Promise<Result<unknown>> {
    return this.invoke('get_group_detail_info', { group_id: groupId })
  }

  /**
   * 获取群成员列表。
   * @param groupId - 群号。
   * @returns 群成员列表。
   */
  getGroupMemberList(groupId: number): Promise<Result<GroupMember[]>> {
    return this.invoke('get_group_member_list', { group_id: groupId })
  }

  /**
   * 获取群成员信息。
   * @param groupId - 群号。
   * @param userId - QQ 号。
   * @returns 群成员信息。
   */
  getGroupMemberInfo(groupId: number, userId: number): Promise<Result<GroupMember>> {
    return this.invoke('get_group_member_info', { group_id: groupId, user_id: userId })
  }

  /**
   * 群组踢人。
   * @param groupId - 群号。
   * @param userId - 被踢成员的 QQ 号。
   * @param rejectAddRequest - 是否拒绝再次加群请求。
   * @returns 无返回值。
   */
  setGroupKick(groupId: number, userId: number, rejectAddRequest?: boolean): Promise<Result<void>> {
    return this.invoke('set_group_kick', {
      group_id: groupId,
      user_id: userId,
      reject_add_request: rejectAddRequest,
    })
  }

  /**
   * 批量踢出群成员。
   * @param groupId - 群号。
   * @param userIds - 待踢出成员的 QQ 号数组。
   * @returns 无返回值。
   */
  setGroupKickMembers(groupId: number, userIds: number[]): Promise<Result<void>> {
    return this.invoke('set_group_kick_members', { group_id: groupId, user_id: userIds })
  }

  /**
   * 群组单人禁言。
   * @param groupId - 群号。
   * @param userId - 被禁言成员的 QQ 号。
   * @param duration - 禁言时长（秒），0 或省略表示解除禁言。
   * @returns 无返回值。
   */
  setGroupBan(groupId: number, userId: number, duration?: number): Promise<Result<void>> {
    return this.invoke('set_group_ban', { group_id: groupId, user_id: userId, duration })
  }

  /**
   * 群组全员禁言。
   * @param groupId - 群号。
   * @param enable - 是否开启全员禁言。
   * @returns 无返回值。
   */
  setGroupWholeBan(groupId: number, enable?: boolean): Promise<Result<void>> {
    return this.invoke('set_group_whole_ban', { group_id: groupId, enable })
  }

  /**
   * 群组设置管理员。
   * @param groupId - 群号。
   * @param userId - 目标成员的 QQ 号。
   * @param enable - 是否设为管理员，false 则取消管理员。
   * @returns 无返回值。
   */
  setGroupAdmin(groupId: number, userId: number, enable?: boolean): Promise<Result<void>> {
    return this.invoke('set_group_admin', { group_id: groupId, user_id: userId, enable })
  }

  /**
   * 设置群名片（群备注）。
   * @param groupId - 群号。
   * @param userId - 目标成员的 QQ 号。
   * @param card - 群名片内容。
   * @returns 无返回值。
   */
  setGroupCard(groupId: number, userId: number, card: string): Promise<Result<void>> {
    return this.invoke('set_group_card', { group_id: groupId, user_id: userId, card })
  }

  /**
   * 设置群名。
   * @param groupId - 群号。
   * @param name - 新群名称。
   * @returns 无返回值。
   */
  setGroupName(groupId: number, name: string): Promise<Result<void>> {
    return this.invoke('set_group_name', { group_id: groupId, group_name: name })
  }

  /**
   * 退出群组。
   * @param groupId - 群号。
   * @param isDismiss - 是否解散群（仅群主可用）。
   * @returns 无返回值。
   */
  setGroupLeave(groupId: number, isDismiss?: boolean): Promise<Result<void>> {
    return this.invoke('set_group_leave', { group_id: groupId, is_dismiss: isDismiss })
  }

  /**
   * 设置群组专属头衔。
   * @param groupId - 群号。
   * @param userId - 目标成员的 QQ 号。
   * @param title - 专属头衔内容。
   * @returns 无返回值。
   */
  setGroupSpecialTitle(groupId: number, userId: number, title: string): Promise<Result<void>> {
    return this.invoke('set_group_special_title', {
      group_id: groupId,
      user_id: userId,
      special_title: title,
    })
  }

  /**
   * 设置群备注。
   * @param groupId - 群号。
   * @param remark - 群备注内容。
   * @returns 无返回值。
   */
  setGroupRemark(groupId: number, remark: string): Promise<Result<void>> {
    return this.invoke('set_group_remark', { group_id: groupId, remark })
  }

  /**
   * 设置群头像。
   * @param groupId - 群号。
   * @param file - 头像文件路径。
   * @returns 无返回值。
   */
  setGroupPortrait(groupId: number, file: string): Promise<Result<void>> {
    return this.invoke('set_group_portrait', { group_id: groupId, file })
  }

  /**
   * 群签到。
   * @param groupId - 群号。
   * @returns 无返回值。
   */
  setGroupSign(groupId: number): Promise<Result<void>> {
    return this.invoke('set_group_sign', { group_id: groupId })
  }

  /**
   * 群打卡。
   * @param groupId - 群号。
   * @returns 无返回值。
   */
  sendGroupSign(groupId: number): Promise<Result<void>> {
    return this.invoke('send_group_sign', { group_id: groupId })
  }

  /**
   * 获取群荣誉信息。
   * @param groupId - 群号。
   * @param type - 荣誉类型，见 HonorType。
   * @returns 群荣誉信息。
   */
  getGroupHonorInfo(groupId: number, type: HonorType): Promise<Result<GroupHonor>> {
    return this.invoke('get_group_honor_info', { group_id: groupId, type })
  }

  /**
   * 获取群 @全体成员 剩余次数。
   * @param groupId - 群号。
   * @returns @全体成员 剩余次数信息。
   */
  getGroupAtAllRemain(groupId: number): Promise<Result<GroupAtAllRemain>> {
    return this.invoke('get_group_at_all_remain', { group_id: groupId })
  }

  /**
   * 获取群系统消息。
   * @param count - 获取数量。
   * @returns 群系统消息。
   */
  getGroupSystemMsg(count?: number): Promise<Result<GroupSystemMsg>> {
    return this.invoke('get_group_system_msg', { count })
  }

  /**
   * 获取群通知忽略列表。
   * @returns 群通知忽略请求列表。
   */
  getGroupIgnoredNotifies(): Promise<Result<IgnoredRequest[]>> {
    return this.invoke('get_group_ignored_notifies')
  }

  /**
   * 群聊戳一戳。
   * @param groupId - 群号。
   * @param userId - 目标 QQ 号。
   * @returns 无返回值。
   */
  groupPoke(groupId: number, userId: number): Promise<Result<void>> {
    return this.invoke('group_poke', { group_id: groupId, user_id: userId })
  }

  /**
   * 转发单条消息到群聊。
   * @param groupId - 目标群号。
   * @param messageId - 待转发的消息 ID。
   * @returns 无返回值。
   */
  forwardGroupSingleMsg(groupId: number, messageId: string): Promise<Result<void>> {
    return this.invoke('forward_group_single_msg', {
      group_id: groupId,
      message_id: messageId,
    })
  }

  /**
   * 标记群聊消息已读。
   * @param groupId - 群号。
   * @param userId - 消息发送者的 QQ 号。
   * @param messageId - 消息 ID。
   * @returns 无返回值。
   */
  markGroupMsgAsRead(groupId: number, userId?: number, messageId?: string): Promise<Result<void>> {
    return this.invoke('mark_group_msg_as_read', {
      group_id: groupId,
      user_id: userId,
      message_id: messageId,
    })
  }

  /**
   * 处理加群请求／邀请。
   * @param flag - 加群请求标识。
   * @param approve - 是否同意。
   * @param reason - 拒绝原因（拒绝时使用）。
   * @returns 无返回值。
   */
  setGroupAddRequest(flag: string, approve?: boolean, reason?: string): Promise<Result<void>> {
    return this.invoke('set_group_add_request', { flag, approve, reason })
  }

  /**
   * 获取群禁言列表。
   * @param groupId - 群号。
   * @returns 群禁言成员列表。
   */
  getGroupShutList(groupId: number): Promise<Result<GroupShutMember[]>> {
    return this.invoke('get_group_shut_list', { group_id: groupId })
  }

  /**
   * 设置精华消息。
   * @param messageId - 消息 ID。
   * @returns 无返回值。
   */
  setEssenceMsg(messageId: number): Promise<Result<void>> {
    return this.invoke('set_essence_msg', { message_id: messageId })
  }

  /**
   * 移出精华消息。
   * @param messageId - 消息 ID。
   * @returns 无返回值。
   */
  deleteEssenceMsg(messageId: number): Promise<Result<void>> {
    return this.invoke('delete_essence_msg', { message_id: messageId })
  }

  /**
   * 获取精华消息列表。
   * @param groupId - 群号。
   * @returns 精华消息列表。
   */
  getEssenceMsgList(groupId: number): Promise<Result<EssenceMsg[]>> {
    return this.invoke('get_essence_msg_list', { group_id: groupId })
  }

  /**
   * 发送群公告。
   * @param groupId - 群号。
   * @param content - 公告内容。
   * @param image - 公告图片路径。
   * @param pinned - 是否置顶。
   * @param type - 公告类型。
   * @param confirmRequired - 是否需要确认已读。
   * @param isShowEditCard - 是否显示编辑卡片。
   * @param tipWindowType - 提示窗口类型。
   * @returns 无返回值。
   */
  sendGroupNotice(
    groupId: number,
    content: string,
    image?: string,
    pinned?: number,
    type?: number,
    confirmRequired?: number,
    isShowEditCard?: number,
    tipWindowType?: number,
  ): Promise<Result<void>> {
    return this.invoke('_send_group_notice', {
      group_id: groupId,
      content,
      image,
      pinned,
      type,
      confirm_required: confirmRequired,
      is_show_edit_card: isShowEditCard,
      tip_window_type: tipWindowType,
    })
  }

  /**
   * 获取群公告。
   * @param groupId - 群号。
   * @returns 群公告列表。
   */
  getGroupNotice(groupId: number): Promise<Result<GroupNotice[]>> {
    return this.invoke('_get_group_notice', { group_id: groupId })
  }

  /**
   * 删除群公告。
   * @param groupId - 群号。
   * @param noticeId - 公告 ID。
   * @returns 无返回值。
   */
  deleteGroupNotice(groupId: number, noticeId: string): Promise<Result<void>> {
    return this.invoke('_del_group_notice', { group_id: groupId, notice_id: noticeId })
  }

  /**
   * 获取群今日打卡列表。
   * @param groupId - 群号。
   * @returns 打卡成员列表。
   */
  getGroupSignedList(groupId: number): Promise<Result<unknown[]>> {
    return this.invoke('get_group_signed_list', { group_id: groupId })
  }

  // === 群相册 ===

  /**
   * 获取群相册列表。
   * @param groupId - 群号。
   * @param attachInfo - 翻页参数。
   * @returns 群相册列表。
   */
  getQunAlbumList(groupId: number, attachInfo?: string): Promise<Result<unknown[]>> {
    return this.invoke('get_qun_album_list', { group_id: groupId, attach_info: attachInfo })
  }

  /**
   * 获取群相册媒体列表。
   * @param groupId - 群号。
   * @param albumId - 相册 ID。
   * @param attachInfo - 翻页参数。
   * @returns 群相册媒体列表。
   */
  getGroupAlbumMediaList(
    groupId: number,
    albumId: string,
    attachInfo?: string,
  ): Promise<Result<unknown[]>> {
    return this.invoke('get_group_album_media_list', {
      group_id: groupId,
      album_id: albumId,
      attach_info: attachInfo,
    })
  }

  /**
   * 删除群相册媒体。
   * @param groupId - 群号。
   * @param albumId - 相册 ID。
   * @param lloc - 媒体 lloc 标识。
   * @returns 无返回值。
   */
  delGroupAlbumMedia(groupId: number, albumId: string, lloc: string): Promise<Result<void>> {
    return this.invoke('del_group_album_media', { group_id: groupId, album_id: albumId, lloc })
  }

  /**
   * 点赞群相册媒体。
   * @param groupId - 群号。
   * @param albumId - 相册 ID。
   * @param batchId - 批次 ID。
   * @param lloc - 媒体 lloc 标识。
   * @returns 无返回值。
   */
  setGroupAlbumMediaLike(
    groupId: number,
    albumId: string,
    batchId: string,
    lloc?: string,
  ): Promise<Result<void>> {
    return this.invoke('set_group_album_media_like', {
      group_id: groupId,
      album_id: albumId,
      batch_id: batchId,
      lloc,
    })
  }

  /**
   * 取消点赞群相册媒体。
   * @param groupId - 群号。
   * @param albumId - 相册 ID。
   * @param batchId - 批次 ID。
   * @param lloc - 媒体 lloc 标识。
   * @returns 无返回值。
   */
  cancelGroupAlbumMediaLike(
    groupId: number,
    albumId: string,
    batchId: string,
    lloc?: string,
  ): Promise<Result<void>> {
    return this.invoke('cancel_group_album_media_like', {
      group_id: groupId,
      album_id: albumId,
      batch_id: batchId,
      lloc,
    })
  }

  /**
   * 发表群相册评论。
   * @param groupId - 群号。
   * @param albumId - 相册 ID。
   * @param lloc - 媒体 lloc 标识。
   * @param content - 评论内容。
   * @returns 无返回值。
   */
  doGroupAlbumComment(
    groupId: number,
    albumId: string,
    lloc: string,
    content: string,
  ): Promise<Result<void>> {
    return this.invoke('do_group_album_comment', {
      group_id: groupId,
      album_id: albumId,
      lloc,
      content,
    })
  }

  /**
   * 上传图片到群相册。
   * @param groupId - 群号。
   * @param albumId - 相册 ID。
   * @param albumName - 相册名称。
   * @param file - 图片文件路径。
   * @returns 无返回值。
   */
  uploadImageToQunAlbum(
    groupId: number,
    albumId: string,
    albumName: string,
    file: string,
  ): Promise<Result<void>> {
    return this.invoke('upload_image_to_qun_album', {
      group_id: groupId,
      album_id: albumId,
      album_name: albumName,
      file,
    })
  }

  // === 群待办 ===

  /**
   * 设置群待办。
   * @param groupId - 群号。
   * @param messageId - 消息 ID。
   * @param messageSeq - 消息序号。
   * @returns 无返回值。
   */
  setGroupTodo(groupId: number, messageId: string, messageSeq: string): Promise<Result<void>> {
    return this.invoke('set_group_todo', {
      group_id: groupId,
      message_id: messageId,
      message_seq: messageSeq,
    })
  }

  /**
   * 完成群待办。
   * @param groupId - 群号。
   * @param messageId - 消息 ID。
   * @param messageSeq - 消息序号。
   * @returns 无返回值。
   */
  completeGroupTodo(groupId: number, messageId: string, messageSeq: string): Promise<Result<void>> {
    return this.invoke('complete_group_todo', {
      group_id: groupId,
      message_id: messageId,
      message_seq: messageSeq,
    })
  }

  /**
   * 取消群待办。
   * @param groupId - 群号。
   * @param messageId - 消息 ID。
   * @param messageSeq - 消息序号。
   * @returns 无返回值。
   */
  cancelGroupTodo(groupId: number, messageId: string, messageSeq: string): Promise<Result<void>> {
    return this.invoke('cancel_group_todo', {
      group_id: groupId,
      message_id: messageId,
      message_seq: messageSeq,
    })
  }

  // === 群设置 ===

  /**
   * 设置群加群选项。
   * @param groupId - 群号。
   * @param addType - 加群类型。
   * @param groupQuestion - 加群问题。
   * @param groupAnswer - 加群答案。
   * @returns 无返回值。
   */
  setGroupAddOption(
    groupId: number,
    addType: number,
    groupQuestion?: string,
    groupAnswer?: string,
  ): Promise<Result<void>> {
    return this.invoke('set_group_add_option', {
      group_id: groupId,
      add_type: addType,
      group_question: groupQuestion,
      group_answer: groupAnswer,
    })
  }

  /**
   * 设置群机器人加群选项。
   * @param groupId - 群号。
   * @param robotMemberSwitch - 机器人成员开关。
   * @param robotMemberExamine - 机器人成员审核设置。
   * @returns 无返回值。
   */
  setGroupRobotAddOption(
    groupId: number,
    robotMemberSwitch?: number,
    robotMemberExamine?: number,
  ): Promise<Result<void>> {
    return this.invoke('set_group_robot_add_option', {
      group_id: groupId,
      robot_member_switch: robotMemberSwitch,
      robot_member_examine: robotMemberExamine,
    })
  }

  /**
   * 设置群搜索选项。
   * @param groupId - 群号。
   * @param noCodeFingerOpen - 非代码指纹开关。
   * @param noFingerOpen - 无指纹开关。
   * @returns 无返回值。
   */
  setGroupSearch(
    groupId: number,
    noCodeFingerOpen?: boolean,
    noFingerOpen?: boolean,
  ): Promise<Result<void>> {
    return this.invoke('set_group_search', {
      group_id: groupId,
      no_code_finger_open: noCodeFingerOpen,
      no_finger_open: noFingerOpen,
    })
  }
}
