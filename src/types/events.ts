/**
 * 所有 OneBot 11 事件类型定义（含 NapCat 扩展）及 SDK 事件映射。
 */

import type { Anonymous, HeartbeatStatus, OneBotEvent, Sender } from './common.js'
import type { MessageSegment } from './segments.js'

// ── 消息事件 ──

/** 消息事件基类。 */
export interface MessageEvent extends OneBotEvent {
  post_type: 'message'
  message_type: string
  sub_type: string
  message_id: number
  user_id: number
  message: MessageSegment[] | string
  raw_message: string
  font: number
  sender: Sender
}

/** 私聊（好友）消息事件。 */
export interface PrivateMessageEvent extends MessageEvent {
  message_type: 'private'
  sub_type: string // friend | group | other（好友 | 群临时 | 其他）
  target_id?: number | null
  temp_source?: number | null
}

/** 群消息事件。 */
export interface GroupMessageEvent extends MessageEvent {
  message_type: 'group'
  sub_type: string // normal | anonymous | notice（普通 | 匿名 | 通知）
  group_id: number
  anonymous?: Anonymous | null
}

/** 机器人自发消息事件（NapCat 扩展，post_type=message_sent）。 */
export interface MessageSentEvent extends OneBotEvent {
  post_type: 'message_sent'
  message_type: string
  sub_type: string
  message_id: number
  user_id: number
  message: MessageSegment[] | string
  raw_message: string
  font: number
  sender: Sender
  target_id: number
}

// ── 元事件 ──

/** 元事件基类。 */
export interface MetaEvent extends OneBotEvent {
  post_type: 'meta_event'
  meta_event_type: string
}

/** 生命周期事件（NapCat 中仅有 connect）。 */
export interface LifecycleEvent extends MetaEvent {
  meta_event_type: 'lifecycle'
  sub_type: string
}

/** 心跳事件。 */
export interface HeartbeatEvent extends MetaEvent {
  meta_event_type: 'heartbeat'
  status: HeartbeatStatus
  interval: number
}

// ── 通知事件 ──

/** 通知事件基类。 */
export interface NoticeEvent extends OneBotEvent {
  post_type: 'notice'
  notice_type: string
  sub_type?: string // 部分通知事件（如 bot_offline）无此字段
}

/** 好友添加通知。 */
export interface FriendAddNotice extends NoticeEvent {
  notice_type: 'friend_add'
  user_id: number
}

/** 好友消息撤回通知。 */
export interface FriendRecallNotice extends NoticeEvent {
  notice_type: 'friend_recall'
  user_id: number
  message_id: number
}

/** 群文件上传通知。 */
export interface GroupUploadNotice extends NoticeEvent {
  notice_type: 'group_upload'
  group_id: number
  user_id: number
  file: Record<string, unknown>
}

/** 群管理员变更通知。 */
export interface GroupAdminNotice extends NoticeEvent {
  notice_type: 'group_admin'
  sub_type: string // set | unset（设置 | 取消）
  group_id: number
  user_id: number
}

/** 群成员减少通知。 */
export interface GroupDecreaseNotice extends NoticeEvent {
  notice_type: 'group_decrease'
  sub_type: string // leave | kick | kick_me | disband（退群 | 被踢 | 号被踢 | 解散）
  group_id: number
  user_id: number
  operator_id: number
}

/** 群成员增加通知。 */
export interface GroupIncreaseNotice extends NoticeEvent {
  notice_type: 'group_increase'
  sub_type: string // approve | invite（同意 | 邀请）
  group_id: number
  user_id: number
  operator_id: number
}

/** 群禁言通知。 */
export interface GroupBanNotice extends NoticeEvent {
  notice_type: 'group_ban'
  sub_type: string // ban | lift_ban（禁言 | 解禁）
  group_id: number
  user_id: number
  operator_id: number
  duration: number
}

/** 群消息撤回通知。 */
export interface GroupRecallNotice extends NoticeEvent {
  notice_type: 'group_recall'
  group_id: number
  user_id: number
  operator_id: number
  message_id: number
}

/** 群名片变更通知。 */
export interface GroupCardNotice extends NoticeEvent {
  notice_type: 'group_card'
  group_id: number
  user_id: number
  card_new: string
  card_old: string
}

/** 精华消息通知。 */
export interface EssenceNotice extends NoticeEvent {
  notice_type: 'essence'
  sub_type: string // add | delete（加精 | 取消）
  group_id: number
  message_id: number
  sender_id: number
  operator_id: number
}

/** 群消息表情回应通知。 */
export interface GroupMsgEmojiLikeNotice extends NoticeEvent {
  notice_type: 'group_msg_emoji_like'
  group_id: number
  user_id: number
  message_id: number
  likes: Record<string, unknown>[]
}

/** 通知子类型事件（戳一戳、群名称、头衔等）。 */
export interface NotifyEvent extends NoticeEvent {
  notice_type: 'notify'
  sub_type: string
  group_id?: number | null
  user_id: number
  target_id?: number | null
}

/** 戳一戳通知。 */
export interface PokeNotify extends NotifyEvent {
  sub_type: 'poke'
  raw_info?: Record<string, unknown> | null
}

/** 群名称变更通知。 */
export interface GroupNameNotify extends NotifyEvent {
  sub_type: 'group_name'
  name_new: string
}

/** 群头衔变更通知。 */
export interface TitleNotify extends NotifyEvent {
  sub_type: 'title'
  title: string
}

/** 名片点赞通知。 */
export interface ProfileLikeNotify extends NotifyEvent {
  sub_type: 'profile_like'
  operator_id: number
  operator_nick: string
  times: number
}

/** 输入状态通知。 */
export interface InputStatusNotify extends NotifyEvent {
  sub_type: 'input_status'
  status_text: string
  event_type: number
}

/** 群灰条消息通知（NapCat 扩展）。 */
export interface GrayTipNotify extends NotifyEvent {
  sub_type: 'gray_tip'
  group_id?: number | null
  user_id: number
  message_id: number
  busi_id: string
  content: string
  raw_info?: Record<string, unknown> | null
}

/** 机器人下线通知。 */
export interface BotOfflineNotice extends NoticeEvent {
  notice_type: 'bot_offline'
  user_id: number
  tag: string
  message: string
}

// ── 请求事件 ──

/** 请求事件基类。 */
export interface RequestEvent extends OneBotEvent {
  post_type: 'request'
  request_type: string
  user_id: number
  comment: string
  flag: string
}

/** 好友添加请求。 */
export interface FriendRequestEvent extends RequestEvent {
  request_type: 'friend'
}

/** 入群请求。 */
export interface GroupRequestEvent extends RequestEvent {
  request_type: 'group'
  sub_type: string // add | invite（添加 | 邀请）
  group_id: number
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

// ── SDK 事件映射 ──

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

  meta_event: (event: LifecycleEvent | HeartbeatEvent) => void
  'meta_event.lifecycle': (event: LifecycleEvent) => void
  'meta_event.heartbeat': (event: HeartbeatEvent) => void

  connect: () => void
  close: () => void
  error: (error: Error) => void
  reconnecting: (attempt: number, delay: number) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (...args: any[]) => void
}
