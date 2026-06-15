import type { Result } from '../core'
import type { FriendInfo, FriendCategory, ProfileLike, EmojiLike, UserStatus } from '../types'

import { BaseApi } from './base.js'

/** 好友相关 API 模块。 */
export class FriendApi extends BaseApi {
  /** 获取好友列表。 */
  getFriendList(): Promise<Result<FriendInfo[]>> {
    return this.invoke('get_friend_list')
  }

  /** 获取好友分类列表。 */
  getFriendsWithCategory(): Promise<Result<FriendCategory[]>> {
    return this.invoke('get_friends_with_category')
  }

  /** 获取单向好友列表。 */
  getUnidirectionalFriendList(): Promise<Result<FriendInfo[]>> {
    return this.invoke('get_unidirectional_friend_list')
  }

  /** 发送好友赞。 */
  sendLike(userId: number, times?: number): Promise<Result<void>> {
    return this.invoke('send_like', { user_id: userId, times })
  }

  /** 删除好友。 */
  deleteFriend(userId: number): Promise<Result<void>> {
    return this.invoke('delete_friend', { user_id: userId })
  }

  /** 设置好友备注。 */
  setFriendRemark(userId: number, remark: string): Promise<Result<void>> {
    return this.invoke('set_friend_remark', { user_id: userId, remark })
  }

  /** 处理加好友请求。 */
  setFriendAddRequest(flag: string, approve: boolean, remark?: string): Promise<Result<void>> {
    return this.invoke('set_friend_add_request', { flag, approve, remark })
  }

  /** 处理加群请求／邀请。 */
  setGroupAddRequest(flag: string, approve?: boolean, reason?: string): Promise<Result<void>> {
    return this.invoke('set_group_add_request', { flag, approve, reason })
  }

  /** 标记私聊消息已读。 */
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

  /** 转发单条消息到私聊。 */
  forwardFriendSingleMsg(userId: number, messageId: string): Promise<Result<void>> {
    return this.invoke('forward_friend_single_msg', { user_id: userId, message_id: messageId })
  }

  /** 获取个人资料点赞列表。 */
  getProfileLike(start?: number, count?: number): Promise<Result<ProfileLike>> {
    return this.invoke('get_profile_like', { start, count })
  }

  /** 获取表情回应列表。 */
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

  /** 获取用户在线状态（NapCat 扩展）。 */
  ncGetUserStatus(userId: number): Promise<Result<UserStatus>> {
    return this.invoke('nc_get_user_status', { user_id: userId })
  }
}
