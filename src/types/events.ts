/**
 * 所有 OneBot 11 事件类型定义（含 NapCat 扩展）及 SDK 事件映射。
 */

import type { Anonymous, HeartbeatStatus, OneBotEvent, Sender } from './common.js'
import type { MessageSegment } from './segments.js'

// === 消息事件 ===

/** 消息事件基类。 */
export interface MessageEvent extends OneBotEvent {
  /** 上报类型，固定为 message。 */
  postType: 'message'
  /** 消息类型：private 或 group。 */
  messageType: string
  /** 消息子类型。 */
  subType: string
  /** 消息 ID。 */
  messageId: number
  /** 发送者 QQ 号。 */
  userId: number
  /** 消息内容，消息段数组或字符串。 */
  message: MessageSegment[] | string
  /** 原始消息文本。 */
  rawMessage: string
  /** 字体序号。 */
  font: number
  /** 发送者信息。 */
  sender: Sender
}

/** 私聊（好友）消息事件。 */
export interface PrivateMessageEvent extends MessageEvent {
  /** 消息类型，固定为 private。 */
  messageType: 'private'
  /** 子类型：friend（好友）、group（群临时）、other（其他）。 */
  subType: string
  /** 接收者 QQ 号（群临时会话时为目标群号）。 */
  targetId?: number | null
  /** 临时会话来源标识。 */
  tempSource?: number | null
}

/** 群消息事件。 */
export interface GroupMessageEvent extends MessageEvent {
  /** 消息类型，固定为 group。 */
  messageType: 'group'
  /** 子类型：normal（普通）、anonymous（匿名）、notice（通知）。 */
  subType: string
  /** 群号。 */
  groupId: number
  /** 匿名用户信息，仅匿名消息时有值。 */
  anonymous?: Anonymous | null
}

/** 机器人自发消息事件（NapCat 扩展，postType=message_sent）。 */
export interface MessageSentEvent extends OneBotEvent {
  /** 上报类型，固定为 message_sent。 */
  postType: 'message_sent'
  /** 消息类型：private 或 group。 */
  messageType: string
  /** 消息子类型。 */
  subType: string
  /** 消息 ID。 */
  messageId: number
  /** 目标用户 QQ 号。 */
  userId: number
  /** 消息内容，消息段数组或字符串。 */
  message: MessageSegment[] | string
  /** 原始消息文本。 */
  rawMessage: string
  /** 字体序号。 */
  font: number
  /** 发送者信息（机器人本身）。 */
  sender: Sender
  /** 目标 ID（私聊为用户 QQ，群聊为群号）。 */
  targetId: number
}

// === 元事件 ===

/** 元事件基类。 */
export interface MetaEvent extends OneBotEvent {
  /** 上报类型，固定为 meta_event。 */
  postType: 'meta_event'
  /** 元事件类型：lifecycle 或 heartbeat。 */
  metaEventType: string
}

/** 生命周期事件（NapCat 中仅有 connect）。 */
export interface LifecycleEvent extends MetaEvent {
  /** 元事件类型，固定为 lifecycle。 */
  metaEventType: 'lifecycle'
  /** 生命周期子类型，例如 connect。 */
  subType: string
}

/** 心跳事件。 */
export interface HeartbeatEvent extends MetaEvent {
  /** 元事件类型，固定为 heartbeat。 */
  metaEventType: 'heartbeat'
  /** 机器人在线状态。 */
  status: HeartbeatStatus
  /** 心跳间隔（毫秒）。 */
  interval: number
}

// === 通知事件 ===

/** 通知事件基类。 */
export interface NoticeEvent extends OneBotEvent {
  /** 上报类型，固定为 notice。 */
  postType: 'notice'
  /** 通知类型，如 group_upload。 */
  noticeType: string
  /** 通知子类型，部分通知事件（如 bot_offline）无此字段。 */
  subType?: string
}

/** 好友添加通知。 */
export interface FriendAddNotice extends NoticeEvent {
  /** 通知类型，固定为 friend_add。 */
  noticeType: 'friend_add'
  /** 新好友 QQ 号。 */
  userId: number
}

/** 好友消息撤回通知。 */
export interface FriendRecallNotice extends NoticeEvent {
  /** 通知类型，固定为 friend_recall。 */
  noticeType: 'friend_recall'
  /** 撤回消息的好友 QQ 号。 */
  userId: number
  /** 被撤回的消息 ID。 */
  messageId: number
}

/** 群文件上传通知。 */
export interface GroupUploadNotice extends NoticeEvent {
  /** 通知类型，固定为 group_upload。 */
  noticeType: 'group_upload'
  /** 群号。 */
  groupId: number
  /** 上传者 QQ 号。 */
  userId: number
  /** 文件信息对象。 */
  file: Record<string, unknown>
}

/** 群管理员变更通知。 */
export interface GroupAdminNotice extends NoticeEvent {
  /** 通知类型，固定为 group_admin。 */
  noticeType: 'group_admin'
  /** 子类型：set（设置）、unset（取消）。 */
  subType: string
  /** 群号。 */
  groupId: number
  /** 被操作的管理员 QQ 号。 */
  userId: number
}

/** 群成员减少通知。 */
export interface GroupDecreaseNotice extends NoticeEvent {
  /** 通知类型，固定为 group_decrease。 */
  noticeType: 'group_decrease'
  /** 子类型：leave（退群）、kick（被踢）、kick_me（号被踢）、disband（解散）。 */
  subType: string
  /** 群号。 */
  groupId: number
  /** 退出成员 QQ 号。 */
  userId: number
  /** 操作者 QQ 号（自己退群时与 userId 相同）。 */
  operatorId: number
}

/** 群成员增加通知。 */
export interface GroupIncreaseNotice extends NoticeEvent {
  /** 通知类型，固定为 group_increase。 */
  noticeType: 'group_increase'
  /** 子类型：approve（同意）、invite（邀请）。 */
  subType: string
  /** 群号。 */
  groupId: number
  /** 新成员 QQ 号。 */
  userId: number
  /** 操作者 QQ 号（邀请入群时为邀请人）。 */
  operatorId: number
}

/** 群禁言通知。 */
export interface GroupBanNotice extends NoticeEvent {
  /** 通知类型，固定为 group_ban。 */
  noticeType: 'group_ban'
  /** 子类型：ban（禁言）、lift_ban（解禁）。 */
  subType: string
  /** 群号。 */
  groupId: number
  /** 被禁言/解禁的成员 QQ 号。 */
  userId: number
  /** 操作者 QQ 号。 */
  operatorId: number
  /** 禁言时长（秒），0 为解禁。 */
  duration: number
}

/** 群消息撤回通知。 */
export interface GroupRecallNotice extends NoticeEvent {
  /** 通知类型，固定为 group_recall。 */
  noticeType: 'group_recall'
  /** 群号。 */
  groupId: number
  /** 消息发送者 QQ 号。 */
  userId: number
  /** 撤回操作者 QQ 号。 */
  operatorId: number
  /** 被撤回的消息 ID。 */
  messageId: number
}

/** 群名片变更通知。 */
export interface GroupCardNotice extends NoticeEvent {
  /** 通知类型，固定为 group_card。 */
  noticeType: 'group_card'
  /** 群号。 */
  groupId: number
  /** 变更成员的 QQ 号。 */
  userId: number
  /** 新群名片。 */
  cardNew: string
  /** 旧群名片。 */
  cardOld: string
}

/** 精华消息通知。 */
export interface EssenceNotice extends NoticeEvent {
  /** 通知类型，固定为 essence。 */
  noticeType: 'essence'
  /** 子类型：add（加精）、delete（取消）。 */
  subType: string
  /** 群号。 */
  groupId: number
  /** 消息 ID。 */
  messageId: number
  /** 消息发送者 QQ 号。 */
  senderId: number
  /** 设置精华的操作者 QQ 号。 */
  operatorId: number
}

/** 群消息表情回应通知。 */
export interface GroupMsgEmojiLikeNotice extends NoticeEvent {
  /** 通知类型，固定为 group_msg_emoji_like。 */
  noticeType: 'group_msg_emoji_like'
  /** 群号。 */
  groupId: number
  /** 表情回应者 QQ 号。 */
  userId: number
  /** 被回应消息的 ID。 */
  messageId: number
  /** 表情回应列表。 */
  likes: Record<string, unknown>[]
}

/** 通知子类型事件（戳一戳、群名称、头衔等）。 */
export interface NotifyEvent extends NoticeEvent {
  /** 通知类型，固定为 notify。 */
  noticeType: 'notify'
  /** 通知子类型，如 poke、group_name、title 等。 */
  subType: string
  /** 群号，仅群相关通知时有值。 */
  groupId?: number | null
  /** 操作者 QQ 号。 */
  userId: number
  /** 目标 QQ 号。 */
  targetId?: number | null
}

/** 戳一戳通知。 */
export interface PokeNotify extends NotifyEvent {
  /** 子类型，固定为 poke。 */
  subType: 'poke'
  /** 戳一戳原始数据。 */
  rawInfo?: Record<string, unknown> | null
}

/** 群名称变更通知。 */
export interface GroupNameNotify extends NotifyEvent {
  /** 子类型，固定为 group_name。 */
  subType: 'group_name'
  /** 新群名称。 */
  nameNew: string
}

/** 群头衔变更通知。 */
export interface TitleNotify extends NotifyEvent {
  /** 子类型，固定为 title。 */
  subType: 'title'
  /** 新头衔内容。 */
  title: string
}

/** 名片点赞通知。 */
export interface ProfileLikeNotify extends NotifyEvent {
  /** 子类型，固定为 profile_like。 */
  subType: 'profile_like'
  /** 点赞者 QQ 号。 */
  operatorId: number
  /** 点赞者昵称。 */
  operatorNick: string
  /** 点赞次数。 */
  times: number
}

/** 输入状态通知。 */
export interface InputStatusNotify extends NotifyEvent {
  /** 子类型，固定为 input_status。 */
  subType: 'input_status'
  /** 输入状态文本。 */
  statusText: string
  /** 事件类型编号。 */
  eventType: number
}

/** 群灰条消息通知（NapCat 扩展）。 */
export interface GrayTipNotify extends NotifyEvent {
  /** 子类型，固定为 gray_tip。 */
  subType: 'gray_tip'
  /** 群号。 */
  groupId?: number | null
  /** 操作者 QQ 号。 */
  userId: number
  /** 消息 ID。 */
  messageId: number
  /** 业务 ID。 */
  busiId: string
  /** 灰条消息文本内容。 */
  content: string
  /** 灰条消息原始数据。 */
  rawInfo?: Record<string, unknown> | null
}

/** 机器人下线通知。 */
export interface BotOfflineNotice extends NoticeEvent {
  /** 通知类型，固定为 bot_offline。 */
  noticeType: 'bot_offline'
  /** 机器人 QQ 号。 */
  userId: number
  /** 下线原因标签。 */
  tag: string
  /** 下线详细信息。 */
  message: string
}

// === 请求事件 ===

/** 请求事件基类。 */
export interface RequestEvent extends OneBotEvent {
  /** 上报类型，固定为 request。 */
  postType: 'request'
  /** 请求类型：friend 或 group。 */
  requestType: string
  /** 请求者 QQ 号。 */
  userId: number
  /** 验证信息（备注）。 */
  comment: string
  /** 处理请求用的标识。 */
  flag: string
}

/** 好友添加请求。 */
export interface FriendRequestEvent extends RequestEvent {
  /** 请求类型，固定为 friend。 */
  requestType: 'friend'
}

/** 入群请求。 */
export interface GroupRequestEvent extends RequestEvent {
  /** 请求类型，固定为 group。 */
  requestType: 'group'
  /** 子类型：add（添加）、invite（邀请）。 */
  subType: string
  /** 群号。 */
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

// === SDK 事件映射 ===

/** Transport 层事件映射。 */
export interface TransportEventMap {
  /** 收到 OneBot 事件。 */
  event: (event: OneBotEvent) => void
  /** 传输层错误。 */
  error: (error: Error) => void
  /** 连接关闭。 */
  close: () => void
  /** 连接建立。 */
  connect: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (...args: any[]) => void
}

/** Client 层完整事件映射。 */
export interface ClientEventMap {
  /** 消息事件（私聊或群聊）。 */
  message: (event: PrivateMessageEvent | GroupMessageEvent) => void
  /** 私聊消息事件。 */
  'message.private': (event: PrivateMessageEvent) => void
  /** 群消息事件。 */
  'message.group': (event: GroupMessageEvent) => void
  /** 机器人自发消息事件。 */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  message_sent: (event: MessageSentEvent) => void

  /** 通知事件。 */
  notice: (event: AnyNoticeEvent) => void
  /** 群成员增加通知。 */
  'notice.group_increase': (event: GroupIncreaseNotice) => void
  /** 群成员减少通知。 */
  'notice.group_decrease': (event: GroupDecreaseNotice) => void
  /** 群禁言通知。 */
  'notice.group_ban': (event: GroupBanNotice) => void
  /** 群管理员变更通知。 */
  'notice.group_admin': (event: GroupAdminNotice) => void
  /** 群文件上传通知。 */
  'notice.group_upload': (event: GroupUploadNotice) => void
  /** 群消息撤回通知。 */
  'notice.group_recall': (event: GroupRecallNotice) => void
  /** 群名片变更通知。 */
  'notice.group_card': (event: GroupCardNotice) => void
  /** 好友添加通知。 */
  'notice.friend_add': (event: FriendAddNotice) => void
  /** 好友消息撤回通知。 */
  'notice.friend_recall': (event: FriendRecallNotice) => void
  /** 精华消息通知。 */
  'notice.essence': (event: EssenceNotice) => void
  /** 群消息表情回应通知。 */
  'notice.group_msg_emoji_like': (event: GroupMsgEmojiLikeNotice) => void
  /** 通知子类型事件。 */
  'notice.notify': (event: NotifyEvent) => void
  /** 机器人下线通知。 */
  'notice.bot_offline': (event: BotOfflineNotice) => void

  /** 请求事件。 */
  request: (event: FriendRequestEvent | GroupRequestEvent) => void
  /** 好友添加请求。 */
  'request.friend': (event: FriendRequestEvent) => void
  /** 入群请求。 */
  'request.group': (event: GroupRequestEvent) => void

  /** 元事件。 */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  meta_event: (event: LifecycleEvent | HeartbeatEvent) => void
  /** 生命周期事件。 */
  'meta_event.lifecycle': (event: LifecycleEvent) => void
  /** 心跳事件。 */
  'meta_event.heartbeat': (event: HeartbeatEvent) => void

  /** Transport 连接建立。 */
  connect: () => void
  /** Transport 连接关闭。 */
  close: () => void
  /** 错误事件。 */
  error: (error: Error) => void
  /** 重连中，attempt 为当前尝试次数，delay 为延迟毫秒数。 */
  reconnecting: (attempt: number, delay: number) => void
  /** 放弃重连。 */
  giveUp: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (...args: any[]) => void
}
