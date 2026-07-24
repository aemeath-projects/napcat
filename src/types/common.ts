/**
 * OneBot 11 通用枚举与基础类型定义。
 */

/** 上报类型枚举。 */
export const POST_TYPE = {
  message: 'message',
  messageSent: 'message_sent',
  notice: 'notice',
  request: 'request',
  metaEvent: 'meta_event',
} as const
export type PostType = (typeof POST_TYPE)[keyof typeof POST_TYPE]

/** 消息类型枚举。 */
export const MESSAGE_TYPE = {
  private: 'private',
  group: 'group',
} as const
export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE]

/** 通知类型枚举。 */
export const NOTICE_TYPE = {
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
export type NoticeType = (typeof NOTICE_TYPE)[keyof typeof NOTICE_TYPE]

/** 请求类型枚举。 */
export const REQUEST_TYPE = {
  friend: 'friend',
  group: 'group',
} as const
export type RequestType = (typeof REQUEST_TYPE)[keyof typeof REQUEST_TYPE]

/** 元事件类型枚举。 */
export const META_EVENT_TYPE = {
  lifecycle: 'lifecycle',
  heartbeat: 'heartbeat',
} as const
export type MetaEventType = (typeof META_EVENT_TYPE)[keyof typeof META_EVENT_TYPE]

/** 群成员角色枚举。 */
export const GROUP_ROLE = {
  owner: 'owner',
  admin: 'admin',
  member: 'member',
} as const
export type GroupRole = (typeof GROUP_ROLE)[keyof typeof GROUP_ROLE]

/** 消息发送者信息。 */
export interface Sender {
  /** 发送者 QQ 号。 */
  userId?: number | null
  /** 发送者 QQ 昵称。 */
  nickname?: string | null
  /** 性别。 */
  sex?: string | null
  /** 年龄。 */
  age?: number | null
  /** 群名片，仅群消息时有值。 */
  card?: string | null
  /** 群角色：owner、admin 或 member。 */
  role?: string | null
  /** 专属头衔。 */
  title?: string | null
  /** 等级。 */
  level?: string | null
  /** 地区。 */
  area?: string | null
  /** 群号，仅群消息时有值。 */
  groupId?: number | null
  [key: string]: unknown
}

/** 匿名用户信息。 */
export interface Anonymous {
  /** 匿名用户 ID。 */
  id: number
  /** 匿名用户展示名称。 */
  name: string
  /** 匿名用户标识。 */
  flag: string
  [key: string]: unknown
}

/** 心跳状态。 */
export interface HeartbeatStatus {
  /** 是否在线。 */
  online?: boolean | null
  /** 运行是否正常。 */
  good: boolean
  [key: string]: unknown
}

/** OneBot 事件基础结构。 */
export interface OneBotEvent {
  /** 事件发生时间（Unix 时间戳，秒）。 */
  time: number
  /** 机器人自身 QQ 号。 */
  selfId: number
  /** 上报类型：message、notice、request、meta_event。 */
  postType: string
  [key: string]: unknown
}

/**
 * API 响应结构（SDK 内部处理 echo，此处不含 echo 字段）。
 */
export interface ApiResponse {
  /** 状态：ok 表示成功，failed 表示失败。 */
  status: string
  /** 返回码，0 表示成功。 */
  retcode: number
  /** 响应数据。 */
  data: Record<string, unknown> | unknown[] | null
  /** 错误消息，success 时可能为 null。 */
  message?: string | null
  /** 错误提示文本。 */
  wording?: string | null
  [key: string]: unknown
}
