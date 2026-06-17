/**
 * OneBot 11 API 方法请求/响应数据类型定义。
 */

import type { GroupRole, Sender } from './common.js'
import type { MessageSegment } from './segments.js'

/** sendMsg 参数。 */
export interface SendMsgParams {
  messageType?: 'private' | 'group'
  userId?: number
  groupId?: number
  message: MessageSegment[]
  autoEscape?: boolean
}

/** 消息详情。 */
export interface MessageDetail {
  messageId: number
  realId?: number
  sender: Sender
  time: number
  messageType: string
  message: MessageSegment[]
  rawMessage: string
  groupId?: number
  [key: string]: unknown
}

/** 合并转发消息。 */
export interface ForwardMessage {
  id: string
  content?: unknown[]
  [key: string]: unknown
}

/** 转发节点。 */
export interface ForwardNode {
  type: 'node'
  data: {
    id?: number
    content?: MessageSegment[]
    userId?: number
    nickname?: string
  }
}

/** 群信息。 */
export interface GroupInfo {
  groupId: number
  groupName: string
  memberCount?: number
  maxMemberCount?: number
  [key: string]: unknown
}

/** 群成员信息。 */
export interface GroupMember {
  groupId: number
  userId: number
  nickname: string
  card?: string
  sex?: string
  age?: number
  area?: string
  joinTime?: number
  lastSentTime?: number
  level?: string
  role: GroupRole
  title?: string
  [key: string]: unknown
}

/** 荣誉类型。 */
export type HonorType = 'talkative' | 'performer' | 'legend' | 'strong_newbie' | 'emotion' | 'all'

/** 群荣誉信息。 */
export interface GroupHonor {
  groupId: number
  [key: string]: unknown
}

/** 精华消息。 */
export interface EssenceMsg {
  senderId: number
  senderNick: string
  senderTime: number
  operatorId: number
  operatorNick: string
  operatorTime: number
  messageId: number
  [key: string]: unknown
}

/** 群公告。 */
export interface GroupNotice {
  senderId: number
  publishTime: number
  message: { text: string; images: unknown[] }
  [key: string]: unknown
}

/** 好友信息。 */
export interface FriendInfo {
  userId: number
  nickname: string
  remark?: string
  [key: string]: unknown
}

/** 好友分类列表。 */
export interface FriendCategory {
  categoryId: number
  categoryName: string
  friends: FriendInfo[]
  [key: string]: unknown
}

/** 好友点赞信息。 */
export interface ProfileLike {
  likeList: { userId: number; nickname: string; time: number }[]
  [key: string]: unknown
}

/** 表情回应信息。 */
export interface EmojiLike {
  emojiLikesList: { emojiId: string; count: number }[]
  [key: string]: unknown
}

/** 用户在线状态。 */
export interface UserStatus {
  userId: number
  status: number
  extStatus: number
  [key: string]: unknown
}

/** 陌生人信息。 */
export interface StrangerInfo {
  userId: number
  nickname: string
  sex?: string
  age?: number
  [key: string]: unknown
}

/** 登录信息。 */
export interface LoginInfo {
  userId: number
  nickname: string
}

/** 版本信息。 */
export interface VersionInfo {
  appName: string
  appVersion: string
  protocolVersion: string
  [key: string]: unknown
}

/** Bot 运行状态。 */
export interface BotStatus {
  online?: boolean
  good: boolean
  [key: string]: unknown
}

/** OCR 识别结果。 */
export interface OcrResult {
  texts: { text: string; confidence: number; coordinates: unknown[] }[]
  language: string
  [key: string]: unknown
}

/** 文件系统信息。 */
export interface FileSystemInfo {
  fileCount: number
  limitCount: number
  usedSpace: number
  totalSpace: number
  [key: string]: unknown
}

/** 文件列表。 */
export interface FileList {
  files: unknown[]
  folders: unknown[]
  [key: string]: unknown
}

/** AI 角色信息。 */
export interface AiCharacter {
  characterId: string
  characterName: string
  [key: string]: unknown
}

/** Rkey 信息。 */
export interface RkeyInfo {
  channelType: number
  rkey: string
  ttl: number
  [key: string]: unknown
}

/** 群信息（扩展）。 */
export interface GroupInfoEx {
  groupId: number
  groupName: string
  memberCount: number
  maxMemberCount: number
  [key: string]: unknown
}

/** 群 @全体成员 剩余次数。 */
export interface GroupAtAllRemain {
  canAtAll: boolean
  remainAtAllCountForGroup: number
  remainAtAllCountForUin: number
  [key: string]: unknown
}

/** 群禁言成员。 */
export interface GroupShutMember {
  userId: number
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
  requestId?: number
  groupId?: number
  userId?: number
  [key: string]: unknown
}

/** 最近联系人。 */
export interface RecentContact {
  userId: number
  groupId?: number
  lastTime: number
  messageType: string
  [key: string]: unknown
}

/** 内联键盘按钮点击参数。 */
export interface InlineKeyboardClick {
  groupId: number
  botAppid: string
  buttonId: string
  callbackData: string
  msgSeq: string
}

/** 私聊文件 URL 信息。 */
export interface PrivateFileUrl {
  url: string
  [key: string]: unknown
}

/** QQ 个人资料设置参数。 */
export interface QQProfile {
  nickname?: string
  personalNote?: string
  sex?: number | string
  [key: string]: unknown
}

/** 在线客户端信息。 */
export interface OnlineClient {
  appId: number
  deviceName: string
  deviceKind: string
  [key: string]: unknown
}

/** 在线机型信息。 */
export interface ModelShow {
  modelShow: string
  [key: string]: unknown
}

/** QQ 机器人 UIN 范围。 */
export interface RobotUinRange {
  minUin: number
  maxUin: number
  [key: string]: unknown
}

/** PacketServer 状态。 */
export interface PacketStatus {
  online: boolean
  good: boolean
  [key: string]: unknown
}

/** 凭证信息。 */
export interface Credentials {
  cookies: string
  csrfToken: number
  [key: string]: unknown
}

/** 客户端密钥。 */
export interface ClientKey {
  clientKey: string
  [key: string]: unknown
}

/** URL 安全检查结果。 */
export interface UrlSafety {
  level: number
  [key: string]: unknown
}

/** 收藏项，具体字段由 NapCat 实现定义，无固定结构。 */
export type CollectionItem = Record<string, unknown>

/** MiniApp 参数。不同小程序使用不同参数集合，无固定结构。 */
export type MiniAppParams = Record<string, unknown>
