/**
 * OneBot 11 通用枚举与基础类型定义。
 */

/** 上报类型枚举。 */
export const PostType = {
  message: 'message',
  messageSent: 'message_sent',
  notice: 'notice',
  request: 'request',
  metaEvent: 'meta_event',
} as const
export type PostType = (typeof PostType)[keyof typeof PostType]

/** 消息类型枚举。 */
export const MessageType = {
  private: 'private',
  group: 'group',
} as const
export type MessageType = (typeof MessageType)[keyof typeof MessageType]

/** 通知类型枚举。 */
export const NoticeType = {
  friendAdd: 'friend_add',
  friendRecall: 'friend_recall',
  groupUpload: 'group_upload',
  groupAdmin: 'group_admin',
  groupDecrease: 'group_decrease',
  groupIncrease: 'group_increase',
  groupBan: 'group_ban',
  groupRecall: 'group_recall',
  groupCard: 'group_card',
  essence: 'essence',
  groupMsgEmojiLike: 'group_msg_emoji_like',
  notify: 'notify',
  botOffline: 'bot_offline',
} as const
export type NoticeType = (typeof NoticeType)[keyof typeof NoticeType]

/** 请求类型枚举。 */
export const RequestType = {
  friend: 'friend',
  group: 'group',
} as const
export type RequestType = (typeof RequestType)[keyof typeof RequestType]

/** 元事件类型枚举。 */
export const MetaEventType = {
  lifecycle: 'lifecycle',
  heartbeat: 'heartbeat',
} as const
export type MetaEventType = (typeof MetaEventType)[keyof typeof MetaEventType]

/** 群成员角色枚举。 */
export const GroupRole = {
  owner: 'owner',
  admin: 'admin',
  member: 'member',
} as const
export type GroupRole = (typeof GroupRole)[keyof typeof GroupRole]

/** 消息发送者信息。 */
export interface Sender {
  user_id?: number | null
  nickname?: string | null
  sex?: string | null
  age?: number | null
  card?: string | null
  role?: string | null
  title?: string | null
  level?: string | null
  area?: string | null
  group_id?: number | null
  [key: string]: unknown
}

/** 匿名用户信息。 */
export interface Anonymous {
  id: number
  name: string
  flag: string
  [key: string]: unknown
}

/** 心跳状态。 */
export interface HeartbeatStatus {
  online?: boolean | null
  good: boolean
  [key: string]: unknown
}

/** OneBot 事件基础结构。 */
export interface OneBotEvent {
  time: number
  self_id: number
  post_type: string
  [key: string]: unknown
}

/**
 * API 响应结构（SDK 内部处理 echo，此处不含 echo 字段）。
 */
export interface ApiResponse {
  status: string
  retcode: number
  data: Record<string, unknown> | unknown[] | null
  message?: string | null
  wording?: string | null
  [key: string]: unknown
}
