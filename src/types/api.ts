/**
 * OneBot 11 API 方法请求/响应数据类型定义。
 */

import type { GroupRole, Sender } from './common.js'
import type { MessageSegment } from './segments.js'

/** sendMsg 参数。 */
export interface SendMsgParams {
  /** 消息类型：private 或 group。 */
  messageType?: 'private' | 'group'
  /** 目标用户 QQ 号。 */
  userId?: number
  /** 目标群号。 */
  groupId?: number
  /** 消息内容，消息段数组。 */
  message: MessageSegment[]
  /** 是否自动转义 CQ 码，默认 false。 */
  autoEscape?: boolean
}

/** 消息详情。 */
export interface MessageDetail {
  /** 消息 ID。 */
  messageId: number
  /** 真实消息 ID（某些情况与 messageId 不同）。 */
  realId?: number
  /** 发送者信息。 */
  sender: Sender
  /** 发送时间（Unix 时间戳）。 */
  time: number
  /** 消息类型：private 或 group。 */
  messageType: string
  /** 消息内容，消息段数组。 */
  message: MessageSegment[]
  /** 原始消息文本。 */
  rawMessage: string
  /** 群号，仅群消息时有值。 */
  groupId?: number
  [key: string]: unknown
}

/** 合并转发消息。 */
export interface ForwardMessage {
  /** 合并转发消息 ID。 */
  id: string
  /** 节点内容，传入时使用。 */
  content?: unknown[]
  [key: string]: unknown
}

/** 转发节点。 */
export interface ForwardNode {
  /** 节点类型，固定为 node。 */
  type: 'node'
  data: {
    /** 引用已有消息的 ID。 */
    id?: number
    /** 消息内容段，传入新消息时使用。 */
    content?: MessageSegment[]
    /** 发送者 QQ 号。 */
    userId?: number
    /** 发送者昵称。 */
    nickname?: string
  }
}

/** 群信息。 */
export interface GroupInfo {
  /** 群号。 */
  groupId: number
  /** 群名称。 */
  groupName: string
  /** 当前成员数。 */
  memberCount?: number
  /** 最大成员数上限。 */
  maxMemberCount?: number
  [key: string]: unknown
}

/** 群成员信息。 */
export interface GroupMember {
  /** 群号。 */
  groupId: number
  /** 成员 QQ 号。 */
  userId: number
  /** 成员 QQ 昵称。 */
  nickname: string
  /** 群名片。 */
  card?: string
  /** 性别。 */
  sex?: string
  /** 年龄。 */
  age?: number
  /** 地区。 */
  area?: string
  /** 入群时间（Unix 时间戳）。 */
  joinTime?: number
  /** 最后发言时间（Unix 时间戳）。 */
  lastSentTime?: number
  /** 等级。 */
  level?: string
  /** 成员角色：owner、admin 或 member。 */
  role: GroupRole
  /** 专属头衔。 */
  title?: string
  [key: string]: unknown
}

/** 荣誉类型。 */
export type HonorType = 'talkative' | 'performer' | 'legend' | 'strong_newbie' | 'emotion' | 'all'

/** 群荣誉信息。 */
export interface GroupHonor {
  /** 群号。 */
  groupId: number
  [key: string]: unknown
}

/** 精华消息。 */
export interface EssenceMsg {
  /** 消息发送者 QQ 号。 */
  senderId: number
  /** 消息发送者昵称。 */
  senderNick: string
  /** 消息发送时间（Unix 时间戳）。 */
  senderTime: number
  /** 设置精华的操作者 QQ 号。 */
  operatorId: number
  /** 设置精华的操作者昵称。 */
  operatorNick: string
  /** 设置精华的时间（Unix 时间戳）。 */
  operatorTime: number
  /** 消息 ID。 */
  messageId: number
  [key: string]: unknown
}

/** 群公告。 */
export interface GroupNotice {
  /** 发布者 QQ 号。 */
  senderId: number
  /** 发布时间（Unix 时间戳）。 */
  publishTime: number
  /** 公告内容，含文本和图片列表。 */
  message: { text: string; images: unknown[] }
  [key: string]: unknown
}

/** 好友信息。 */
export interface FriendInfo {
  /** 好友 QQ 号。 */
  userId: number
  /** 好友 QQ 昵称。 */
  nickname: string
  /** 备注名。 */
  remark?: string
  [key: string]: unknown
}

/** 好友分类列表。 */
export interface FriendCategory {
  /** 分类 ID。 */
  categoryId: number
  /** 分类名称。 */
  categoryName: string
  /** 分类下的好友列表。 */
  friends: FriendInfo[]
  [key: string]: unknown
}

/** 好友点赞信息。 */
export interface ProfileLike {
  /** 点赞列表。 */
  likeList: { userId: number; nickname: string; time: number }[]
  [key: string]: unknown
}

/** 表情回应信息。 */
export interface EmojiLike {
  /** 表情回应列表。 */
  emojiLikesList: { emojiId: string; count: number }[]
  [key: string]: unknown
}

/** 用户在线状态。 */
export interface UserStatus {
  /** 用户 QQ 号。 */
  userId: number
  /** 在线状态，10 为在线等。 */
  status: number
  /** 扩展在线状态。 */
  extStatus: number
  [key: string]: unknown
}

/** 陌生人信息。 */
export interface StrangerInfo {
  /** 陌生人 QQ 号。 */
  userId: number
  /** 陌生人 QQ 昵称。 */
  nickname: string
  /** 性别。 */
  sex?: string
  /** 年龄。 */
  age?: number
  [key: string]: unknown
}

/** 登录信息。 */
export interface LoginInfo {
  /** 登录账号 QQ 号。 */
  userId: number
  /** 登录账号昵称。 */
  nickname: string
}

/** 版本信息。 */
export interface VersionInfo {
  /** 应用名称。 */
  appName: string
  /** 应用版本号。 */
  appVersion: string
  /** 协议版本号。 */
  protocolVersion: string
  [key: string]: unknown
}

/** Bot 运行状态。 */
export interface BotStatus {
  /** 是否在线。 */
  online?: boolean
  /** 运行是否正常。 */
  good: boolean
  [key: string]: unknown
}

/** OCR 识别结果。 */
export interface OcrResult {
  /** 识别出的文本列表，含置信度和坐标。 */
  texts: { text: string; confidence: number; coordinates: unknown[] }[]
  /** 识别语言。 */
  language: string
  [key: string]: unknown
}

/** 文件系统信息。 */
export interface FileSystemInfo {
  /** 已用文件数。 */
  fileCount: number
  /** 文件数上限。 */
  limitCount: number
  /** 已用空间（字节）。 */
  usedSpace: number
  /** 总空间（字节）。 */
  totalSpace: number
  [key: string]: unknown
}

/** 文件列表。 */
export interface FileList {
  /** 文件列表。 */
  files: unknown[]
  /** 文件夹列表。 */
  folders: unknown[]
  [key: string]: unknown
}

/** AI 角色信息。 */
export interface AiCharacter {
  /** 角色 ID。 */
  characterId: string
  /** 角色名称。 */
  characterName: string
  [key: string]: unknown
}

/** Rkey 信息。 */
export interface RkeyInfo {
  /** 频道类型。 */
  channelType: number
  /** 密钥字符串。 */
  rkey: string
  /** 有效时间（秒）。 */
  ttl: number
  [key: string]: unknown
}

/** 群信息（扩展）。 */
export interface GroupInfoEx {
  /** 群号。 */
  groupId: number
  /** 群名称。 */
  groupName: string
  /** 当前成员数。 */
  memberCount: number
  /** 最大成员数上限。 */
  maxMemberCount: number
  [key: string]: unknown
}

/** 群 @全体成员 剩余次数。 */
export interface GroupAtAllRemain {
  /** 是否可以使用 @全体成员。 */
  canAtAll: boolean
  /** 群维度剩余次数。 */
  remainAtAllCountForGroup: number
  /** 个人维度剩余次数。 */
  remainAtAllCountForUin: number
  [key: string]: unknown
}

/** 群禁言成员。 */
export interface GroupShutMember {
  /** 被禁言成员 QQ 号。 */
  userId: number
  /** 禁言结束时间（Unix 时间戳）。 */
  banTime: number
  [key: string]: unknown
}

/** 群系统消息。OneBot 11 标准响应，包含被邀请和加群请求列表。 */
export interface GroupSystemMsg {
  /** 被邀请入群请求列表 */
  invitedRequests?: unknown[]
  /** 加群请求列表 */
  joinRequests?: unknown[]
  [key: string]: unknown
}

/** 被忽略的请求条目，具体字段由 NapCat/OneBot 实现定义。 */
export interface IgnoredRequest {
  /** 请求 ID。 */
  requestId?: number
  /** 群号。 */
  groupId?: number
  /** 用户 QQ 号。 */
  userId?: number
  [key: string]: unknown
}

/** 最近联系人。 */
export interface RecentContact {
  /** 联系人 QQ 号。 */
  userId: number
  /** 群号，仅群消息时有值。 */
  groupId?: number
  /** 最后消息时间（Unix 时间戳）。 */
  lastTime: number
  /** 消息类型：private 或 group。 */
  messageType: string
  [key: string]: unknown
}

/** 内联键盘按钮点击参数。 */
export interface InlineKeyboardClick {
  /** 群号。 */
  groupId: number
  /** 机器人 App ID。 */
  botAppid: string
  /** 按钮 ID。 */
  buttonId: string
  /** 回调数据。 */
  callbackData: string
  /** 消息序列号。 */
  msgSeq: string
}

/** 私聊文件 URL 信息。 */
export interface PrivateFileUrl {
  /** 文件下载 URL。 */
  url: string
  [key: string]: unknown
}

/** QQ 个人资料设置参数。 */
export interface QQProfile {
  /** 昵称。 */
  nickname?: string
  /** 个性签名。 */
  personalNote?: string
  /** 性别，0/unknown、1/male、2/female。 */
  sex?: number | string
  [key: string]: unknown
}

/** 在线客户端信息。 */
export interface OnlineClient {
  /** 客户端 App ID。 */
  appId: number
  /** 设备名称。 */
  deviceName: string
  /** 设备类型。 */
  deviceKind: string
  [key: string]: unknown
}

/** 在线机型信息。 */
export interface ModelShow {
  /** 机型展示字符串。 */
  modelShow: string
  [key: string]: unknown
}

/** QQ 机器人 UIN 范围。 */
export interface RobotUinRange {
  /** 最小 UIN。 */
  minUin: number
  /** 最大 UIN。 */
  maxUin: number
  [key: string]: unknown
}

/** PacketServer 状态。 */
export interface PacketStatus {
  /** 是否在线。 */
  online: boolean
  /** 运行是否正常。 */
  good: boolean
  [key: string]: unknown
}

/** 凭证信息。 */
export interface Credentials {
  /** Cookie 字符串。 */
  cookies: string
  /** CSRF Token。 */
  csrfToken: number
  [key: string]: unknown
}

/** 客户端密钥。 */
export interface ClientKey {
  /** 客户端密钥字符串。 */
  clientKey: string
  [key: string]: unknown
}

/** URL 安全检查结果。 */
export interface UrlSafety {
  /** 安全等级，数字越小越安全。 */
  level: number
  [key: string]: unknown
}

/** 收藏项，具体字段由 NapCat 实现定义，无固定结构。 */
export type CollectionItem = Record<string, unknown>

/** MiniApp 参数。不同小程序使用不同参数集合，无固定结构。 */
export type MiniAppParams = Record<string, unknown>
