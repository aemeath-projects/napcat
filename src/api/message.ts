import type { Result } from '../core'
import type {
  MessageDetail,
  ForwardMessage,
  ForwardNode,
  SendMsgParams,
  RecentContact,
  InlineKeyboardClick,
  MessageSegment,
} from '../types'

import { BaseApi } from './base.js'

/** 消息相关 API 模块。 */
export class MessageApi extends BaseApi {
  /** 发送私聊消息。 */
  sendPrivateMsg(
    userId: number,
    message: MessageSegment[],
  ): Promise<Result<{ messageId: number }>> {
    return this.invoke('send_private_msg', { user_id: userId, message })
  }

  /** 发送群聊消息。 */
  sendGroupMsg(groupId: number, message: MessageSegment[]): Promise<Result<{ messageId: number }>> {
    return this.invoke('send_group_msg', { group_id: groupId, message })
  }

  /** 发送消息（通用）。 */
  sendMsg(params: SendMsgParams): Promise<Result<{ messageId: number }>> {
    return this.invoke('send_msg', params)
  }

  /** 撤回消息。 */
  deleteMsg(messageId: number): Promise<Result<void>> {
    return this.invoke('delete_msg', { message_id: messageId })
  }

  /** 获取消息详情。 */
  getMsg(messageId: number): Promise<Result<MessageDetail>> {
    return this.invoke('get_msg', { message_id: messageId })
  }

  /** 获取合并转发消息。 */
  getForwardMsg(id: string): Promise<Result<ForwardMessage>> {
    return this.invoke('get_forward_msg', { id })
  }

  /** 发送群合并转发消息。 */
  sendGroupForwardMsg(
    groupId: number,
    nodes: ForwardNode[],
  ): Promise<Result<{ messageId: number }>> {
    return this.invoke('send_group_forward_msg', { group_id: groupId, messages: nodes })
  }

  /** 发送私聊合并转发消息。 */
  sendPrivateForwardMsg(
    userId: number,
    nodes: ForwardNode[],
  ): Promise<Result<{ messageId: number }>> {
    return this.invoke('send_private_forward_msg', { user_id: userId, messages: nodes })
  }

  /** 发送合并转发（通用）。 */
  sendForwardMsg(nodes: ForwardNode[]): Promise<Result<{ messageId: number }>> {
    return this.invoke('send_forward_msg', { messages: nodes })
  }

  /** 标记消息已读。 */
  markMsgAsRead(messageId: number): Promise<Result<void>> {
    return this.invoke('mark_msg_as_read', { message_id: messageId })
  }

  /** 标记所有消息已读。 */
  markAllAsRead(): Promise<Result<void>> {
    return this.invoke('_mark_all_as_read')
  }

  /** 发送戳一戳（私聊或群聊）。 */
  sendPoke(userId: number, groupId?: number, targetId?: number): Promise<Result<void>> {
    return this.invoke('send_poke', { user_id: userId, group_id: groupId, target_id: targetId })
  }

  /** 获取群聊历史消息。 */
  getGroupMsgHistory(
    groupId: number,
    messageSeq?: number,
    count?: number,
    reverseOrder?: boolean,
    disableGetUrl?: boolean,
    parseMultMsg?: boolean,
    quickReply?: boolean,
  ): Promise<Result<MessageDetail[]>> {
    return this.invoke('get_group_msg_history', {
      group_id: groupId,
      message_seq: messageSeq,
      count,
      reverse_order: reverseOrder,
      disable_get_url: disableGetUrl,
      parse_mult_msg: parseMultMsg,
      quick_reply: quickReply,
    })
  }

  /** 获取私聊历史消息。 */
  getFriendMsgHistory(
    userId: number,
    messageSeq?: number,
    count?: number,
    reverseOrder?: boolean,
    disableGetUrl?: boolean,
    parseMultMsg?: boolean,
    quickReply?: boolean,
  ): Promise<Result<MessageDetail[]>> {
    return this.invoke('get_friend_msg_history', {
      user_id: userId,
      message_seq: messageSeq,
      count,
      reverse_order: reverseOrder,
      disable_get_url: disableGetUrl,
      parse_mult_msg: parseMultMsg,
      quick_reply: quickReply,
    })
  }

  /** 获取最近的聊天记录。 */
  getRecentContact(count?: number): Promise<Result<RecentContact[]>> {
    return this.invoke('get_recent_contact', { count })
  }

  /** 点击内联键盘按钮。 */
  clickInlineKeyboardButton(params: InlineKeyboardClick): Promise<Result<void>> {
    return this.invoke('click_inline_keyboard_button', params)
  }
}
