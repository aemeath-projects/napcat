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

/** 被忽略的请求。 */
export type IgnoredRequest = Record<string, unknown>

/** MiniApp 参数。 */
export type MiniAppParams = Record<string, unknown>
