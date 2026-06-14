import type { Result } from '../core/result.js'
import type { MessageDetail, ForwardMessage, ForwardNode, SendMsgParams } from '../types/api.js'
import type { MessageSegment } from '../types/segments.js'

import { BaseApi } from './base.js'

/** 消息相关 API 模块。 */
export class MessageApi extends BaseApi {
  /** 发送私聊消息。 */
  sendPrivateMsg(
    userId: number,
    message: MessageSegment[],
  ): Promise<Result<{ message_id: number }>> {
    return this.invoke('send_private_msg', { user_id: userId, message })
  }

  /** 发送群聊消息。 */
  sendGroupMsg(
    groupId: number,
    message: MessageSegment[],
  ): Promise<Result<{ message_id: number }>> {
    return this.invoke('send_group_msg', { group_id: groupId, message })
  }

  /** 发送消息（通用）。 */
  sendMsg(params: SendMsgParams): Promise<Result<{ message_id: number }>> {
    return this.invoke('send_msg', params as unknown as Record<string, unknown>)
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
  ): Promise<Result<{ message_id: number }>> {
    return this.invoke('send_group_forward_msg', { group_id: groupId, messages: nodes })
  }

  /** 发送私聊合并转发消息。 */
  sendPrivateForwardMsg(
    userId: number,
    nodes: ForwardNode[],
  ): Promise<Result<{ message_id: number }>> {
    return this.invoke('send_private_forward_msg', { user_id: userId, messages: nodes })
  }

  /** 标记消息已读。 */
  markMsgAsRead(messageId: number): Promise<Result<void>> {
    return this.invoke('mark_msg_as_read', { message_id: messageId })
  }

  /** 获取群聊历史消息。 */
  getGroupMsgHistory(
    groupId: number,
    messageSeq?: number,
    count?: number,
  ): Promise<Result<MessageDetail[]>> {
    return this.invoke('get_group_msg_history', {
      group_id: groupId,
      message_seq: messageSeq,
      count,
    })
  }

  /** 获取私聊历史消息。 */
  getFriendMsgHistory(
    userId: number,
    messageSeq?: number,
    count?: number,
  ): Promise<Result<MessageDetail[]>> {
    return this.invoke('get_friend_msg_history', {
      user_id: userId,
      message_seq: messageSeq,
      count,
    })
  }
}
