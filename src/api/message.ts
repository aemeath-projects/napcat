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
  /**
   * 发送私聊消息。
   * @param userId - 目标 QQ 号。
   * @param message - 消息段数组。
   * @returns 发送结果，包含 message_id。
   */
  sendPrivateMsg(
    userId: number,
    message: MessageSegment[],
  ): Promise<Result<{ messageId: number }>> {
    return this.invoke('send_private_msg', { user_id: userId, message })
  }

  /**
   * 发送群聊消息。
   * @param groupId - 目标群号。
   * @param message - 消息段数组。
   * @returns 发送结果，包含 message_id。
   */
  sendGroupMsg(groupId: number, message: MessageSegment[]): Promise<Result<{ messageId: number }>> {
    return this.invoke('send_group_msg', { group_id: groupId, message })
  }

  /**
   * 发送消息（通用）。
   * @param params - 发送消息参数，包含消息类型、目标 ID 和消息内容。
   * @returns 发送结果，包含 message_id。
   */
  sendMsg(params: SendMsgParams): Promise<Result<{ messageId: number }>> {
    return this.invoke('send_msg', params)
  }

  /**
   * 撤回消息。
   * @param messageId - 消息 ID。
   * @returns 无返回值。
   */
  deleteMsg(messageId: number): Promise<Result<void>> {
    return this.invoke('delete_msg', { message_id: messageId })
  }

  /**
   * 获取消息详情。
   * @param messageId - 消息 ID。
   * @returns 消息详情。
   */
  getMsg(messageId: number): Promise<Result<MessageDetail>> {
    return this.invoke('get_msg', { message_id: messageId })
  }

  /**
   * 获取合并转发消息。
   * @param id - 合并转发消息 ID。
   * @returns 合并转发消息内容。
   */
  getForwardMsg(id: string): Promise<Result<ForwardMessage>> {
    return this.invoke('get_forward_msg', { id })
  }

  /**
   * 发送群合并转发消息。
   * @param groupId - 目标群号。
   * @param nodes - 转发节点数组。
   * @returns 发送结果，包含 message_id。
   */
  sendGroupForwardMsg(
    groupId: number,
    nodes: ForwardNode[],
  ): Promise<Result<{ messageId: number }>> {
    return this.invoke('send_group_forward_msg', { group_id: groupId, messages: nodes })
  }

  /**
   * 发送私聊合并转发消息。
   * @param userId - 目标 QQ 号。
   * @param nodes - 转发节点数组。
   * @returns 发送结果，包含 message_id。
   */
  sendPrivateForwardMsg(
    userId: number,
    nodes: ForwardNode[],
  ): Promise<Result<{ messageId: number }>> {
    return this.invoke('send_private_forward_msg', { user_id: userId, messages: nodes })
  }

  /**
   * 发送合并转发（通用）。
   * @param nodes - 转发节点数组。
   * @returns 发送结果，包含 message_id。
   */
  sendForwardMsg(nodes: ForwardNode[]): Promise<Result<{ messageId: number }>> {
    return this.invoke('send_forward_msg', { messages: nodes })
  }

  /**
   * 标记消息已读。
   * @param messageId - 消息 ID。
   * @returns 无返回值。
   */
  markMsgAsRead(messageId: number): Promise<Result<void>> {
    return this.invoke('mark_msg_as_read', { message_id: messageId })
  }

  /**
   * 标记所有消息已读。
   * @returns 无返回值。
   */
  markAllAsRead(): Promise<Result<void>> {
    return this.invoke('_mark_all_as_read')
  }

  /**
   * 发送戳一戳（私聊或群聊）。
   * @param userId - 目标 QQ 号。
   * @param groupId - 群号，私聊时不需要传递。
   * @param targetId - 目标 ID。
   * @returns 无返回值。
   */
  sendPoke(userId: number, groupId?: number, targetId?: number): Promise<Result<void>> {
    return this.invoke('send_poke', { user_id: userId, group_id: groupId, target_id: targetId })
  }

  /**
   * 获取群聊历史消息。
   * @param groupId - 群号。
   * @param messageSeq - 起始消息序号。
   * @param count - 获取数量。
   * @param reverseOrder - 是否倒序获取。
   * @param disableGetUrl - 是否禁用获取 URL。
   * @param parseMultMsg - 是否解析合并消息。
   * @param quickReply - 是否快速回复。
   * @returns 群聊历史消息列表。
   */
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

  /**
   * 获取私聊历史消息。
   * @param userId - QQ 号。
   * @param messageSeq - 起始消息序号。
   * @param count - 获取数量。
   * @param reverseOrder - 是否倒序获取。
   * @param disableGetUrl - 是否禁用获取 URL。
   * @param parseMultMsg - 是否解析合并消息。
   * @param quickReply - 是否快速回复。
   * @returns 私聊历史消息列表。
   */
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

  /**
   * 获取最近的聊天记录。
   * @param count - 获取数量。
   * @returns 最近联系人列表。
   */
  getRecentContact(count?: number): Promise<Result<RecentContact[]>> {
    return this.invoke('get_recent_contact', { count })
  }

  /**
   * 点击内联键盘按钮。
   * @param params - 内联键盘点击参数，包含消息 ID、按钮 ID 等。
   * @returns 无返回值。
   */
  clickInlineKeyboardButton(params: InlineKeyboardClick): Promise<Result<void>> {
    return this.invoke('click_inline_keyboard_button', params)
  }
}
