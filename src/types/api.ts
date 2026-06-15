/**
 * OneBot 11 API 方法请求/响应数据类型定义。
 */

import type { GroupRole, Sender } from './common.js'
import type { MessageSegment } from './segments.js'

/** sendMsg 参数。 */
export interface SendMsgParams {
  message_type?: 'private' | 'group'
  user_id?: number
  group_id?: number
  message: MessageSegment[]
  auto_escape?: boolean
}

/** 消息详情。 */
export interface MessageDetail {
  message_id: number
  real_id?: number
  sender: Sender
  time: number
  message_type: string
  message: MessageSegment[]
  raw_message: string
  group_id?: number
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
    user_id?: number
    nickname?: string
  }
}

/** 群信息。 */
export interface GroupInfo {
  group_id: number
  group_name: string
  member_count?: number
  max_member_count?: number
  [key: string]: unknown
}

/** 群成员信息。 */
export interface GroupMember {
  group_id: number
  user_id: number
  nickname: string
  card?: string
  sex?: string
  age?: number
  area?: string
  join_time?: number
  last_sent_time?: number
  level?: string
  role: GroupRole
  title?: string
  [key: string]: unknown
}

/** 荣誉类型。 */
export type HonorType = 'talkative' | 'performer' | 'legend' | 'strong_newbie' | 'emotion' | 'all'

/** 群荣誉信息。 */
export interface GroupHonor {
  group_id: number
  [key: string]: unknown
}

/** 精华消息。 */
export interface EssenceMsg {
  sender_id: number
  sender_nick: string
  sender_time: number
  operator_id: number
  operator_nick: string
  operator_time: number
  message_id: number
  [key: string]: unknown
}

/** 群公告。 */
export interface GroupNotice {
  sender_id: number
  publish_time: number
  message: { text: string; images: unknown[] }
  [key: string]: unknown
}

/** 好友信息。 */
export interface FriendInfo {
  user_id: number
  nickname: string
  remark?: string
  [key: string]: unknown
}

/** 好友分类列表。 */
export interface FriendCategory {
  category_id: number
  category_name: string
  friends: FriendInfo[]
  [key: string]: unknown
}

/** 好友点赞信息。 */
export interface ProfileLike {
  like_list: { user_id: number; nickname: string; time: number }[]
  [key: string]: unknown
}

/** 表情回应信息。 */
export interface EmojiLike {
  emoji_likes_list: { emoji_id: string; count: number }[]
  [key: string]: unknown
}

/** 用户在线状态。 */
export interface UserStatus {
  user_id: number
  status: number
  ext_status: number
  [key: string]: unknown
}

/** 陌生人信息。 */
export interface StrangerInfo {
  user_id: number
  nickname: string
  sex?: string
  age?: number
  [key: string]: unknown
}

/** 登录信息。 */
export interface LoginInfo {
  user_id: number
  nickname: string
}

/** 版本信息。 */
export interface VersionInfo {
  app_name: string
  app_version: string
  protocol_version: string
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
  file_count: number
  limit_count: number
  used_space: number
  total_space: number
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
  character_id: string
  character_name: string
  [key: string]: unknown
}

/** Rkey 信息。 */
export interface RkeyInfo {
  channel_type: number
  rkey: string
  ttl: number
  [key: string]: unknown
}

/** 群信息（扩展）。 */
export interface GroupInfoEx {
  group_id: number
  group_name: string
  member_count: number
  max_member_count: number
  [key: string]: unknown
}

/** 群 @全体成员 剩余次数。 */
export interface GroupAtAllRemain {
  can_at_all: boolean
  remain_at_all_count_for_group: number
  remain_at_all_count_for_uin: number
  [key: string]: unknown
}

/** 群禁言成员。 */
export interface GroupShutMember {
  user_id: number
  ban_time: number
  [key: string]: unknown
}

/** 群系统消息。OneBot 11 标准响应，包含被邀请和加群请求列表。 */
export interface GroupSystemMsg {
  /** 被邀请入群请求列表 */
  invited_requests?: unknown[]
  /** 加群请求列表 */
  join_requests?: unknown[]
  [key: string]: unknown
}

/** 被忽略的请求条目，具体字段由 NapCat/OneBot 实现定义。 */
export interface IgnoredRequest {
  request_id?: number
  group_id?: number
  user_id?: number
  [key: string]: unknown
}

/** 最近联系人。 */
export interface RecentContact {
  user_id: number
  group_id?: number
  last_time: number
  message_type: string
  [key: string]: unknown
}

/** 内联键盘按钮点击参数。 */
export interface InlineKeyboardClick {
  group_id: number
  bot_appid: string
  button_id: string
  callback_data: string
  msg_seq: string
}

/** 私聊文件 URL 信息。 */
export interface PrivateFileUrl {
  url: string
  [key: string]: unknown
}

/** QQ 个人资料设置参数。 */
export interface QQProfile {
  nickname?: string
  personal_note?: string
  sex?: number | string
  [key: string]: unknown
}

/** 在线客户端信息。 */
export interface OnlineClient {
  app_id: number
  device_name: string
  device_kind: string
  [key: string]: unknown
}

/** 在线机型信息。 */
export interface ModelShow {
  model_show: string
  [key: string]: unknown
}

/** QQ 机器人 UIN 范围。 */
export interface RobotUinRange {
  min_uin: number
  max_uin: number
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
  csrf_token: number
  [key: string]: unknown
}

/** 客户端密钥。 */
export interface ClientKey {
  client_key: string
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
