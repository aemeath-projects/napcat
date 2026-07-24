import type { Result } from '../core'
import type { FriendInfo, FriendCategory, ProfileLike, EmojiLike, UserStatus } from '../types'

import { BaseApi } from './base.js'

/** 好友相关 API 模块。 */
export class FriendApi extends BaseApi {
  /**
   * 获取好友列表。
   * @returns 好友信息列表。
   */
  getFriendList(): Promise<Result<FriendInfo[]>> {
    return this.invoke('get_friend_list')
  }

  /**
   * 获取好友分类列表。
   * @returns 好友分类列表。
   */
  getFriendsWithCategory(): Promise<Result<FriendCategory[]>> {
    return this.invoke('get_friends_with_category')
  }

  /**
   * 获取单向好友列表。
   * @returns 单向好友信息列表。
   */
  getUnidirectionalFriendList(): Promise<Result<FriendInfo[]>> {
    return this.invoke('get_unidirectional_friend_list')
  }

  /**
   * 发送好友赞。
   * @param userId - 目标 QQ 号。
   * @param times - 点赞次数。
   * @returns 无返回值。
   */
  sendLike(userId: number, times?: number): Promise<Result<void>> {
    return this.invoke('send_like', { user_id: userId, times })
  }

  /**
   * 删除好友。
   * @param userId - 目标 QQ 号。
   * @returns 无返回值。
   */
  deleteFriend(userId: number): Promise<Result<void>> {
    return this.invoke('delete_friend', { user_id: userId })
  }

  /**
   * 设置好友备注。
   * @param userId - 目标 QQ 号。
   * @param remark - 备注内容。
   * @returns 无返回值。
   */
  setFriendRemark(userId: number, remark: string): Promise<Result<void>> {
    return this.invoke('set_friend_remark', { user_id: userId, remark })
  }

  /**
   * 处理加好友请求。
   * @param flag - 请求标识。
   * @param approve - 是否同意。
   * @param remark - 好友备注。
   * @returns 无返回值。
   */
  setFriendAddRequest(flag: string, approve: boolean, remark?: string): Promise<Result<void>> {
    return this.invoke('set_friend_add_request', { flag, approve, remark })
  }

  /**
   * 标记私聊消息已读。
   * @param userId - QQ 号。
   * @param groupId - 群号（当私聊来源于群临时会话时）。
   * @param messageId - 消息 ID。
   * @returns 无返回值。
   */
  markPrivateMsgAsRead(
    userId: number,
    groupId?: number,
    messageId?: string,
  ): Promise<Result<void>> {
    return this.invoke('mark_private_msg_as_read', {
      user_id: userId,
      group_id: groupId,
      message_id: messageId,
    })
  }

  /**
   * 转发单条消息到私聊。
   * @param userId - 目标 QQ 号。
   * @param messageId - 待转发的消息 ID。
   * @returns 无返回值。
   */
  forwardFriendSingleMsg(userId: number, messageId: string): Promise<Result<void>> {
    return this.invoke('forward_friend_single_msg', { user_id: userId, message_id: messageId })
  }

  /**
   * 获取个人资料点赞列表。
   * @param start - 起始位置。
   * @param count - 获取数量。
   * @returns 个人资料点赞信息。
   */
  getProfileLike(start?: number, count?: number): Promise<Result<ProfileLike>> {
    return this.invoke('get_profile_like', { start, count })
  }

  /**
   * 获取表情回应列表。
   * @param messageId - 消息 ID。
   * @param emojiId - 表情 ID。
   * @param emojiType - 表情类型。
   * @param count - 获取数量。
   * @param cookie - 翻页 cookie。
   * @returns 表情回应信息。
   */
  fetchEmojiLike(
    messageId: number | string,
    emojiId: number | string,
    emojiType: number | string,
    count: number,
    cookie?: string,
  ): Promise<Result<EmojiLike>> {
    return this.invoke('fetch_emoji_like', {
      message_id: messageId,
      emojiId,
      emojiType,
      count,
      cookie,
    })
  }

  /**
   * 获取用户在线状态（NapCat 扩展）。
   * @param userId - 目标 QQ 号。
   * @returns 用户在线状态。
   */
  ncGetUserStatus(userId: number): Promise<Result<UserStatus>> {
    return this.invoke('nc_get_user_status', { user_id: userId })
  }

  /**
   * 私聊戳一戳。
   * @param userId - 目标 QQ 号。
   * @returns 无返回值。
   */
  friendPoke(userId: number): Promise<Result<void>> {
    return this.invoke('friend_poke', { user_id: userId })
  }
}
