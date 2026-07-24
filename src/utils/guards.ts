/**
 * OneBot 11 事件类型守卫函数。
 */

import type {
  OneBotEvent,
  GroupMessageEvent,
  PrivateMessageEvent,
  MessageSentEvent,
  NoticeEvent,
  RequestEvent,
  MetaEvent,
} from '../types'

/** 判断事件是否为群消息事件。
 * @param event - 消息事件。
 * @returns 事件是否为群消息。 */
export function isGroupMessage(event: OneBotEvent): event is GroupMessageEvent {
  // eslint-disable-next-line @typescript-eslint/dot-notation -- `message_type` 不是 OneBotEvent 上声明的键
  return event.post_type === 'message' && event['message_type'] === 'group'
}

/** 判断事件是否为私聊消息事件。
 * @param event - 消息事件。
 * @returns 事件是否为私聊消息。 */
export function isPrivateMessage(event: OneBotEvent): event is PrivateMessageEvent {
  // eslint-disable-next-line @typescript-eslint/dot-notation
  return event.post_type === 'message' && event['message_type'] === 'private'
}

/** 判断事件是否为机器人自发消息事件（NapCat 扩展）。
 * @param event - 消息事件。
 * @returns 事件是否为机器人自发消息。 */
export function isMessageSent(event: OneBotEvent): event is MessageSentEvent {
  return event.post_type === 'message_sent'
}

/** 判断事件是否为通知事件。
 * @param event - 消息事件。
 * @returns 事件是否为通知事件。 */
export function isNoticeEvent(event: OneBotEvent): event is NoticeEvent {
  return event.post_type === 'notice'
}

/** 判断事件是否为请求事件。
 * @param event - 消息事件。
 * @returns 事件是否为请求事件。 */
export function isRequestEvent(event: OneBotEvent): event is RequestEvent {
  return event.post_type === 'request'
}

/** 判断事件是否为元事件。
 * @param event - 消息事件。
 * @returns 事件是否为元事件。 */
export function isMetaEvent(event: OneBotEvent): event is MetaEvent {
  return event.post_type === 'meta_event'
}
