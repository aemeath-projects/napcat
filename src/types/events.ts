/**
 * 所有 OneBot 11 事件类型定义（含 NapCat 扩展）及 SDK 事件映射。
 */

import type { Anonymous, HeartbeatStatus, OneBotEvent, Sender } from './common.js'
import type { MessageSegment } from './segments.js'

/* 消息事件 */

/** 消息事件基类。 */
export interface MessageEvent extends OneBotEvent {
  postType: 'message'
  messageType: string
  subType: string
  messageId: number
  userId: number
  message: MessageSegment[] | string
  rawMessage: string
  font: number
  sender: Sender
}

/** 私聊（好友）消息事件。 */
export interface PrivateMessageEvent extends MessageEvent {
  messageType: 'private'
  subType: string // friend | group | other（好友 | 群临时 | 其他）
  targetId?: number | null
  tempSource?: number | null
}

/** 群消息事件。 */
export interface GroupMessageEvent extends MessageEvent {
  messageType: 'group'
  subType: string // normal | anonymous | notice（普通 | 匿名 | 通知）
  groupId: number
  anonymous?: Anonymous | null
}

/** 机器人自发消息事件（NapCat 扩展，postType=message_sent）。 */
export interface MessageSentEvent extends OneBotEvent {
  postType: 'message_sent'
  messageType: string
  subType: string
  messageId: number
  userId: number
  message: MessageSegment[] | string
  rawMessage: string
  font: number
  sender: Sender
  targetId: number
}

/* 元事件 */

/** 元事件基类。 */
export interface MetaEvent extends OneBotEvent {
  postType: 'meta_event'
  metaEventType: string
}

/** 生命周期事件（NapCat 中仅有 connect）。 */
export interface LifecycleEvent extends MetaEvent {
  metaEventType: 'lifecycle'
  subType: string
}

/** 心跳事件。 */
export interface HeartbeatEvent extends MetaEvent {
  metaEventType: 'heartbeat'
  status: HeartbeatStatus
  interval: number
}

/* 通知事件 */

/** 通知事件基类。 */
export interface NoticeEvent extends OneBotEvent {
  postType: 'notice'
  noticeType: string
  subType?: string // 部分通知事件（如 bot_offline）无此字段
}

/** 好友添加通知。 */
export interface FriendAddNotice extends NoticeEvent {
  noticeType: 'friend_add'
  userId: number
}

/** 好友消息撤回通知。 */
export interface FriendRecallNotice extends NoticeEvent {
  noticeType: 'friend_recall'
  userId: number
  messageId: number
}

/** 群文件上传通知。 */
export interface GroupUploadNotice extends NoticeEvent {
  noticeType: 'group_upload'
  groupId: number
  userId: number
  file: Record<string, unknown>
}

/** 群管理员变更通知。 */
export interface GroupAdminNotice extends NoticeEvent {
  noticeType: 'group_admin'
  subType: string // set | unset（设置 | 取消）
  groupId: number
  userId: number
}

/** 群成员减少通知。 */
export interface GroupDecreaseNotice extends NoticeEvent {
  noticeType: 'group_decrease'
  subType: string // leave | kick | kick_me | disband（退群 | 被踢 | 号被踢 | 解散）
  groupId: number
  userId: number
  operatorId: number
}

/** 群成员增加通知。 */
export interface GroupIncreaseNotice extends NoticeEvent {
  noticeType: 'group_increase'
  subType: string // approve | invite（同意 | 邀请）
  groupId: number
  userId: number
  operatorId: number
}

/** 群禁言通知。 */
export interface GroupBanNotice extends NoticeEvent {
  noticeType: 'group_ban'
  subType: string // ban | lift_ban（禁言 | 解禁）
  groupId: number
  userId: number
  operatorId: number
  duration: number
}

/** 群消息撤回通知。 */
export interface GroupRecallNotice extends NoticeEvent {
  noticeType: 'group_recall'
  groupId: number
  userId: number
  operatorId: number
  messageId: number
}

/** 群名片变更通知。 */
export interface GroupCardNotice extends NoticeEvent {
  noticeType: 'group_card'
  groupId: number
  userId: number
  cardNew: string
  cardOld: string
}

/** 精华消息通知。 */
export interface EssenceNotice extends NoticeEvent {
  noticeType: 'essence'
  subType: string // add | delete（加精 | 取消）
  groupId: number
  messageId: number
  senderId: number
  operatorId: number
}

/** 群消息表情回应通知。 */
export interface GroupMsgEmojiLikeNotice extends NoticeEvent {
  noticeType: 'group_msg_emoji_like'
  groupId: number
  userId: number
  messageId: number
  likes: Record<string, unknown>[]
}

/** 通知子类型事件（戳一戳、群名称、头衔等）。 */
export interface NotifyEvent extends NoticeEvent {
  noticeType: 'notify'
  subType: string
  groupId?: number | null
  userId: number
  targetId?: number | null
}

/** 戳一戳通知。 */
export interface PokeNotify extends NotifyEvent {
  subType: 'poke'
  rawInfo?: Record<string, unknown> | null
}

/** 群名称变更通知。 */
export interface GroupNameNotify extends NotifyEvent {
  subType: 'group_name'
  nameNew: string
}

/** 群头衔变更通知。 */
export interface TitleNotify extends NotifyEvent {
  subType: 'title'
  title: string
}

/** 名片点赞通知。 */
export interface ProfileLikeNotify extends NotifyEvent {
  subType: 'profile_like'
  operatorId: number
  operatorNick: string
  times: number
}

/** 输入状态通知。 */
export interface InputStatusNotify extends NotifyEvent {
  subType: 'input_status'
  statusText: string
  eventType: number
}

/** 群灰条消息通知（NapCat 扩展）。 */
export interface GrayTipNotify extends NotifyEvent {
  subType: 'gray_tip'
  groupId?: number | null
  userId: number
  messageId: number
  busiId: string
  content: string
  rawInfo?: Record<string, unknown> | null
}

/** 机器人下线通知。 */
export interface BotOfflineNotice extends NoticeEvent {
  noticeType: 'bot_offline'
  userId: number
  tag: string
  message: string
}

/* 请求事件 */

/** 请求事件基类。 */
export interface RequestEvent extends OneBotEvent {
  postType: 'request'
  requestType: string
  userId: number
  comment: string
  flag: string
}

/** 好友添加请求。 */
export interface FriendRequestEvent extends RequestEvent {
  requestType: 'friend'
}

/** 入群请求。 */
export interface GroupRequestEvent extends RequestEvent {
  requestType: 'group'
  subType: string // add | invite（添加 | 邀请）
  groupId: number
}

/** 所有已知事件类型的联合类型。 */
export type AnyOneBotEvent =
  | PrivateMessageEvent
  | GroupMessageEvent
  | MessageSentEvent
  | LifecycleEvent
  | HeartbeatEvent
  | FriendAddNotice
  | FriendRecallNotice
  | GroupUploadNotice
  | GroupAdminNotice
  | GroupDecreaseNotice
  | GroupIncreaseNotice
  | GroupBanNotice
  | GroupRecallNotice
  | GroupCardNotice
  | EssenceNotice
  | GroupMsgEmojiLikeNotice
  | PokeNotify
  | GroupNameNotify
  | TitleNotify
  | ProfileLikeNotify
  | InputStatusNotify
  | GrayTipNotify
  | BotOfflineNotice
  | FriendRequestEvent
  | GroupRequestEvent
  | OneBotEvent

/** 所有通知事件联合类型。 */
export type AnyNoticeEvent =
  | FriendAddNotice
  | FriendRecallNotice
  | GroupUploadNotice
  | GroupAdminNotice
  | GroupDecreaseNotice
  | GroupIncreaseNotice
  | GroupBanNotice
  | GroupRecallNotice
  | GroupCardNotice
  | EssenceNotice
  | GroupMsgEmojiLikeNotice
  | NotifyEvent
  | BotOfflineNotice

/* SDK 事件映射 */

/** Transport 层事件映射。 */
export interface TransportEventMap {
  event: (event: OneBotEvent) => void
  error: (error: Error) => void
  close: () => void
  connect: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (...args: any[]) => void
}

/** Client 层完整事件映射。 */
export interface ClientEventMap {
  message: (event: PrivateMessageEvent | GroupMessageEvent) => void
  'message.private': (event: PrivateMessageEvent) => void
  'message.group': (event: GroupMessageEvent) => void
  // eslint-disable-next-line @typescript-eslint/naming-convention
  message_sent: (event: MessageSentEvent) => void

  notice: (event: AnyNoticeEvent) => void
  'notice.group_increase': (event: GroupIncreaseNotice) => void
  'notice.group_decrease': (event: GroupDecreaseNotice) => void
  'notice.group_ban': (event: GroupBanNotice) => void
  'notice.group_admin': (event: GroupAdminNotice) => void
  'notice.group_upload': (event: GroupUploadNotice) => void
  'notice.group_recall': (event: GroupRecallNotice) => void
  'notice.group_card': (event: GroupCardNotice) => void
  'notice.friend_add': (event: FriendAddNotice) => void
  'notice.friend_recall': (event: FriendRecallNotice) => void
  'notice.essence': (event: EssenceNotice) => void
  'notice.group_msg_emoji_like': (event: GroupMsgEmojiLikeNotice) => void
  'notice.notify': (event: NotifyEvent) => void
  'notice.bot_offline': (event: BotOfflineNotice) => void

  request: (event: FriendRequestEvent | GroupRequestEvent) => void
  'request.friend': (event: FriendRequestEvent) => void
  'request.group': (event: GroupRequestEvent) => void

  // eslint-disable-next-line @typescript-eslint/naming-convention
  meta_event: (event: LifecycleEvent | HeartbeatEvent) => void
  'meta_event.lifecycle': (event: LifecycleEvent) => void
  'meta_event.heartbeat': (event: HeartbeatEvent) => void

  connect: () => void
  close: () => void
  error: (error: Error) => void
  reconnecting: (attempt: number, delay: number) => void
  giveUp: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (...args: any[]) => void
}
