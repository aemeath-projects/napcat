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

/** 群成员邀请策略：禁止 / 需管理员审核 / 无需审核 / 群成员少于 100 人时无需审核。 */
export type GroupMemberInvitePolicy =
  'disabled' | 'require_approval' | 'no_approval' | 'no_approval_under_100'

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
  /** 是否为「发给新成员」公告（4.18.37+）。 */
  sendToNewMember?: boolean
  /** 是否置顶，仅「发给新成员」公告可读到（4.18.37+）。 */
  pinned?: boolean
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

/** QQ 空间标识：QQ 号、说说 tid、评论 ID 等，字符串或安全整数。 */
export type QzoneId = string | number

/**
 * QQ 空间动态引用。
 *
 * 必须传回 SDK 返回的完整对象，不能由 tid 拼造，整体不得超过 64 KiB。
 * 键名会在请求前递归转为 snake_case；含 `a_1b` 这类下划线后接数字的键无法自动还原。
 */
export type QzoneFeedRef = Record<string, unknown>

/** 空间动态原始对象，字段由上游定义，原样透传。 */
export type QzoneNativeFeed = Record<string, unknown>

/** 空间评论原始对象，字段由上游定义，原样透传。 */
export type QzoneNativeComment = Record<string, unknown>

/** 空间回复原始对象，字段由上游定义，原样透传。 */
export type QzoneNativeReply = Record<string, unknown>

/** 空友爱看接口能力，结构由上游定义。 */
export type QzonePublicCapabilities = Record<string, unknown>

/** 空友爱看动态完整对象，必须原样回传，不得裁剪字段。 */
export type QzonePublicFeed = Record<string, unknown>

/** 空友爱看评论完整对象，必须原样回传并保留 like.id 等字段。 */
export type QzonePublicComment = Record<string, unknown>

/** 空友爱看回复完整对象，必须原样回传。 */
export type QzonePublicReply = Record<string, unknown>

/** 空友爱看富文本对象，必须保留每个对象的全部字段。 */
export type QzoneRichText = Record<string, unknown>

/** 空友爱看端点的不透明响应，结构由上游定义。 */
export type QzonePublicResult = Record<string, unknown>

/** sendQzoneMsg 可选参数。 */
export interface QzoneSendMsgParams {
  /** 图片数组，支持 file://、http(s)://、base64://。 */
  images?: string[]
  /** 查看权限：1 所有人可见、4 好友可见、16 部分好友可见、64 仅自己可见、128 部分好友不可见。 */
  ugcRight?: 1 | 4 | 16 | 64 | 128
  /** ugcRight 为 16/128 时，权限作用的 QQ 号数组。 */
  targetUins?: number[]
}

/** sendQzoneMsg 响应。 */
export interface QzoneSendMsgResult {
  /** 说说 tid。 */
  tid: string
  /** 发表时间（Unix 秒）；上游未提供时为 0。 */
  time: number
  [key: string]: unknown
}

/** getQzoneFeeds 的 SnowLuma 模式参数。 */
export interface QzoneFeedsSnowlumaParams {
  /** 返回格式，默认 snowluma。 */
  format?: 'snowluma'
  /** 页码，默认 1。 */
  pageNum?: number | string
  /** 每页数量，默认 10。 */
  count?: number | string
  /** 续页游标，原样传回返回的 nextCursor。 */
  cursor?: string
}

/** getQzoneFeeds 的 native 模式参数。 */
export interface QzoneFeedsNativeParams {
  /** 返回格式，native 保留原 H5 Feed 结构。 */
  format: 'native'
  /** 续页游标，原样传回返回的 nextCursor。 */
  cursor?: string
  /** native 模式不接受页码。 */
  pageNum?: never
  /** native 模式不接受每页数量。 */
  count?: never
}

/** getQzoneFeeds 参数。 */
export type QzoneFeedsParams = QzoneFeedsSnowlumaParams | QzoneFeedsNativeParams

/** getQzoneMsgList 的 SnowLuma 偏移分页参数。 */
export interface QzoneMsgListSnowlumaParams {
  /** 返回格式，默认 snowluma。 */
  format?: 'snowluma'
  /** 目标 QQ 号，默认当前账号。 */
  targetUin?: QzoneId
  /** 起始位置，默认 0。 */
  pos?: number | string
  /** 获取数量，默认 20，有效范围 1 至 100。 */
  num?: number | string
  /** SnowLuma 模式不使用游标。 */
  cursor?: never
}

/** getQzoneMsgList 的 native 游标分页参数。 */
export interface QzoneMsgListNativeParams {
  /** 返回格式，native 保留原 H5 Feed 结构。 */
  format: 'native'
  /** 目标 QQ 号，默认当前账号。 */
  targetUin?: QzoneId
  /** 续页游标，原样传回返回的 nextCursor。 */
  cursor?: string
  /** native 模式不使用偏移分页。 */
  pos?: never
  /** native 模式不使用偏移分页。 */
  num?: never
}

/** getQzoneMsgList 仅传旧游标时的隐式 native 参数。 */
export interface QzoneMsgListLegacyCursorParams {
  /** 未显式指定格式，传旧游标时上游自动选择 native。 */
  format?: undefined
  /** 目标 QQ 号，默认当前账号。 */
  targetUin?: QzoneId
  /** 旧版 native 游标。 */
  cursor: string
  /** 与游标分页不能混用。 */
  pos?: never
  /** 与游标分页不能混用。 */
  num?: never
}

/** getQzoneMsgList 参数。 */
export type QzoneMsgListParams =
  QzoneMsgListSnowlumaParams | QzoneMsgListNativeParams | QzoneMsgListLegacyCursorParams

/** getQzoneMsgDetail 的 tid 定位参数。 */
export interface QzoneMsgDetailByTidParams {
  /** 说说 tid。 */
  tid: QzoneId
  /** 目标 QQ 号，默认当前账号。 */
  targetUin?: QzoneId
  /** 评论起始位置，默认 0。 */
  pos?: number | string
  /** 评论获取数量，默认 20。 */
  num?: number | string
  /** 与 tid 定位不能混用。 */
  feedRef?: never
}

/** getQzoneMsgDetail 的 feed_ref 定位参数。 */
export interface QzoneMsgDetailByFeedRefParams {
  /** 列表或详情返回的完整动态引用。 */
  feedRef: QzoneFeedRef
  /** 与 feed_ref 定位不能混用。 */
  tid?: never
  /** 目标 QQ 号，默认当前账号。 */
  targetUin?: QzoneId
  /** 评论起始位置，默认 0。 */
  pos?: number | string
  /** 评论获取数量，默认 20。 */
  num?: number | string
}

/** getQzoneMsgDetail 参数。 */
export type QzoneMsgDetailParams = QzoneMsgDetailByTidParams | QzoneMsgDetailByFeedRefParams

/** getQzoneCommentList 参数。 */
export interface QzoneCommentListParams {
  /** 动态引用，必须原样传回。 */
  feedRef: QzoneFeedRef
  /** 续页游标；不传时读取首批评论。 */
  cursor?: string
}

/** getQzoneCommentReplies 参数。 */
export interface QzoneCommentRepliesParams {
  /** 动态引用，必须原样传回。 */
  feedRef: QzoneFeedRef
  /** 完整父评论对象，必须原样传回，id 为 0 时同样有效。 */
  comment: QzoneNativeComment
  /** 续页游标；不传时读取首批回复。 */
  cursor?: string
}

/** likeQzone / unlikeQzone 的 tid 定位参数。 */
export interface QzoneLikeByTidParams {
  /** 说说 tid。 */
  tid: QzoneId
  /** 目标 QQ 号，默认当前账号。 */
  targetUin?: QzoneId
  /** 说说发布时间，默认 0。 */
  abstime?: number | string
  /** 与 tid 定位不能混用。 */
  feedRef?: never
}

/** likeQzone / unlikeQzone 的 feed_ref 定位参数。 */
export interface QzoneLikeByFeedRefParams {
  /** 列表或详情返回的完整动态引用。 */
  feedRef: QzoneFeedRef
  /** 与 feed_ref 定位不能混用。 */
  tid?: never
  /** 与 feed_ref 定位不能混用。 */
  targetUin?: never
  /** 与 feed_ref 定位不能混用。 */
  abstime?: never
}

/** likeQzone / unlikeQzone 参数。 */
export type QzoneLikeParams = QzoneLikeByTidParams | QzoneLikeByFeedRefParams

/** commentQzone 的 tid 一级评论参数。 */
export interface QzoneTopLevelCommentByTidParams {
  /** 说说 tid。 */
  tid: QzoneId
  /** 目标 QQ 号，默认当前账号。 */
  targetUin?: QzoneId
  /** 评论正文。 */
  content: string
  /** 评论图片，仅一级评论支持。 */
  images?: string[]
  /** 一级评论不使用父评论 ID。 */
  commentId?: never
  /** 一级评论不使用父评论 QQ 号。 */
  commentUin?: never
  /** 一级评论不使用被回复者 QQ 号。 */
  replyUin?: never
  /** 一级评论不使用被回复者昵称。 */
  replyName?: never
  /** 与 tid 定位不能混用。 */
  comment?: never
  /** 与 tid 定位不能混用。 */
  replyUser?: never
  /** 与 tid 定位不能混用。 */
  feedRef?: never
}

/** commentQzone 的 tid 回复参数。 */
export interface QzoneReplyByTidParams {
  /** 说说 tid。 */
  tid: QzoneId
  /** 目标 QQ 号，默认当前账号。 */
  targetUin?: QzoneId
  /** 回复正文。 */
  content: string
  /** 父评论 ID，必须与 commentUin 成对提供。 */
  commentId: QzoneId
  /** 父评论作者 QQ 号，必须与 commentId 成对提供。 */
  commentUin: QzoneId
  /** 被回复者 QQ 号，指定接收者时使用。 */
  replyUin?: QzoneId
  /** 被回复者昵称，指定接收者时使用。 */
  replyName?: string
  /** 楼中楼回复仅支持文字。 */
  images?: never
  /** 与 tid 定位不能混用。 */
  comment?: never
  /** 与 tid 定位不能混用。 */
  replyUser?: never
  /** 与 tid 定位不能混用。 */
  feedRef?: never
}

/** commentQzone 的 feed_ref 定位参数。 */
export interface QzoneCommentByFeedRefParams {
  /** 列表或详情返回的完整动态引用。 */
  feedRef: QzoneFeedRef
  /** 评论正文。 */
  content: string
  /** 父评论对象，回复时提供。 */
  comment?: QzoneNativeComment
  /** 被回复用户，指定接收者时提供。 */
  replyUser?: QzoneReplyUser
  /** 与 feed_ref 定位不能混用。 */
  tid?: never
  /** 与 feed_ref 定位不能混用。 */
  targetUin?: never
  /** 与 feed_ref 定位不能混用。 */
  commentId?: never
  /** 与 feed_ref 定位不能混用。 */
  commentUin?: never
  /** 与 feed_ref 定位不能混用。 */
  replyUin?: never
  /** 与 feed_ref 定位不能混用。 */
  replyName?: never
  /** feed_ref 模式仅支持文字。 */
  images?: never
}

/** commentQzone 参数。 */
export type QzoneCommentParams =
  QzoneTopLevelCommentByTidParams | QzoneReplyByTidParams | QzoneCommentByFeedRefParams

/** feed_ref 模式下的回复目标用户。 */
export interface QzoneReplyUser {
  /** QQ 号。 */
  uin: QzoneId
  /** QQ UID；部分空间用户返回空字符串。 */
  uid?: string
  /** 昵称。 */
  nick?: string
  [key: string]: unknown
}

/** setQzoneProfile 参数，name 与 description 至少提供一项；空字符串表示清空。 */
export type QzoneSetProfileParams =
  | {
      /** 空间名称；空字符串表示清空。 */
      name: string
      /** 空间说明；空字符串表示清空。 */
      description?: string
    }
  | {
      /** 至少提供 description 时省略 name。 */
      name?: never
      /** 空间说明；空字符串表示清空。 */
      description: string
    }

/** setQzoneMsgRight 参数。 */
export type QzoneSetMsgRightParams =
  | {
      /** 说说 tid。 */
      tid: QzoneId
      /** 查看权限：16 部分好友可见、128 部分好友不可见。 */
      ugcRight: 16 | 128
      /** 权限作用的 QQ 号列表，该模式下不能为空。 */
      targetUins: QzoneId[]
    }
  | {
      /** 说说 tid。 */
      tid: QzoneId
      /** 查看权限：1 所有人、4 好友、64 仅自己。 */
      ugcRight: 1 | 4 | 64
      /** 该权限不使用目标列表。 */
      targetUins?: never
    }

/** getQzonePublicFeeds 参数。 */
export interface QzonePublicFeedsParams {
  /** 上一页返回的 nextCursor；首次请求可省略。 */
  cursor?: string
}

/** getQzonePublicReplies 参数。 */
export interface QzonePublicRepliesParams {
  /** 回复分页游标；空字符串时使用 comment.replyAttachInfo。 */
  cursor?: string
  /** 每页回复数量，默认 20，向零截断后必须大于等于 1。 */
  pageSize?: number | string
}

/** setQzonePublicCommentLike 参数。 */
export interface QzonePublicCommentLikeParams {
  /** 完整回复对象；传入时对该回复点赞，否则操作评论。 */
  reply?: QzonePublicReply
  /** 是否启用，默认 true。 */
  enable?: boolean
}

/** SnowLuma 好友动态条目。 */
export interface QzoneFeed {
  /** 发布者 QQ 号。 */
  uin: number
  /** 发布者昵称。 */
  nickname: string
  /** 发布时间（Unix 秒）。 */
  time: number
  /** 客户端 App ID。 */
  appid: number
  /** 动态 key。 */
  key: string
  /** 动态 HTML 片段。 */
  html: string
  /** 说说 tid。 */
  tid: string | null
  /** 摘要正文。 */
  content: string | null
  /** 正文是否完整。 */
  contentComplete: boolean | null
  /** 图片列表。 */
  images: string[] | null
  /** 点赞数。 */
  likeCount: number | null
  /** 评论数。 */
  commentCount: number | null
  [key: string]: unknown
}

/** SnowLuma 好友动态分页响应。 */
export interface QzoneFeedPage {
  /** 动态列表。 */
  feeds: QzoneFeed[]
  /** 是否还有下一页。 */
  hasMore: boolean
  /** 下一页游标，没有下一页时为 null。 */
  nextCursor: string | null
  [key: string]: unknown
}

/** native 动态条目。无法确定的字段为 null，完整原始数据保留在 feed。 */
export interface QzoneNativeFeedItem {
  /** 说说 tid。 */
  tid: string | null
  /** 发布者 QQ 号。 */
  userId: string | null
  /** 正文。 */
  content: string | null
  /** 发布时间。 */
  time: number | null
  /** 评论数。 */
  commentNum: number | null
  /** 点赞数。 */
  likeNum: number | null
  /** 图片列表。 */
  images: string[] | null
  /** 动态引用。 */
  feedRef: QzoneFeedRef | null
  /** 原始 H5 动态对象。 */
  feed: QzoneNativeFeed
  [key: string]: unknown
}

/** native 好友动态分页响应。 */
export interface QzoneNativeFeedPage {
  /** 动态列表。 */
  feeds: QzoneNativeFeedItem[]
  /** 是否还有下一页。 */
  hasMore: boolean
  /** 下一页游标，没有下一页时为 null。 */
  nextCursor: string | null
  [key: string]: unknown
}

/** SnowLuma 说说列表条目。 */
export interface QzoneMsgListItem {
  /** 说说 tid。 */
  tid: string
  /** 正文。 */
  content: string
  /** 发布时间（Unix 秒）。 */
  time: number
  /** 评论数。 */
  commentNum: number
  /** 是否为私密说说。 */
  isPrivate: boolean
  /** 图片列表。 */
  images: string[]
  [key: string]: unknown
}

/** SnowLuma 说说列表响应。 */
export interface QzoneMsgListPage {
  /** 说说总数。 */
  total: number
  /** 说说列表。 */
  msglist: QzoneMsgListItem[]
  /** total 是否为已知值。 */
  totalKnown?: boolean
  [key: string]: unknown
}

/** native 说说列表响应。 */
export interface QzoneNativeMsgListPage {
  /** 说说列表。 */
  msglist: QzoneNativeFeedItem[]
  /** 是否还有下一页。 */
  hasMore: boolean
  /** 下一页游标，没有下一页时为 null。 */
  nextCursor: string | null
  /** 空间返回的封存状态，按原始字段保留。 */
  sealOffMemory?: Record<string, unknown>
  [key: string]: unknown
}

/** SnowLuma 详情中的评论回复。 */
export interface QzoneCommentReply {
  /** 回复者 QQ 号。 */
  uin: number
  /** 回复者昵称。 */
  name: string
  /** 回复时间。 */
  time: number
  /** 回复正文。 */
  content: string
  /** 回复 ID。 */
  commentId: string
  /** 父评论 ID。 */
  parentCommentId: string
  /** 父评论作者 QQ 号。 */
  parentCommentUin: number
  [key: string]: unknown
}

/** SnowLuma 详情中的评论。 */
export interface QzoneComment {
  /** 评论者 QQ 号。 */
  uin: number
  /** 评论者昵称。 */
  name: string
  /** 评论时间。 */
  time: number
  /** 评论正文。 */
  content: string
  /** 评论 ID。 */
  commentId: string
  /** 内联回复列表。 */
  replies: QzoneCommentReply[]
  [key: string]: unknown
}

/** SnowLuma 说说详情。 */
export interface QzoneMsgDetail {
  /** 说说 tid。 */
  tid: string
  /** 正文。 */
  content: string
  /** 评论数。 */
  commentNum: number
  /** 评论列表。 */
  comments: QzoneComment[]
  [key: string]: unknown
}

/** native 说说详情。 */
export interface QzoneNativeMsgDetail {
  /** 说说 tid。 */
  tid: string | null
  /** 发布者 QQ 号。 */
  userId: string | null
  /** 正文。 */
  content: string | null
  /** 发布时间。 */
  time: number | null
  /** 评论数。 */
  commentNum: number | null
  /** 点赞数。 */
  likeNum: number | null
  /** 图片列表。 */
  images: string[] | null
  /** 动态引用。 */
  feedRef: QzoneFeedRef | null
  /** 原始 H5 动态对象。 */
  feed: QzoneNativeFeed
  /** 原始评论对象列表。 */
  comments: QzoneNativeComment[]
  /** 是否还有更多评论。 */
  commentHasMore?: boolean
  /** 下一页评论游标。 */
  commentNextCursor?: string | null
  [key: string]: unknown
}

/** 评论列表中的回复条目。 */
export interface QzoneCommentReplyItem {
  /** 回复 ID。 */
  replyId: string | null
  /** 回复者 QQ 号。 */
  userId: string | null
  /** 回复者 UID。 */
  uid: string | null
  /** 回复者昵称。 */
  nickname: string | null
  /** 回复时间。 */
  time: number | null
  /** 回复正文。 */
  content: string | null
  /** 图片列表。 */
  images: string[] | null
  /** 点赞数。 */
  likeCount: number | null
  /** 当前账号是否已点赞。 */
  liked: boolean | null
  /** 被回复者 QQ 号。 */
  targetUserId: string | null
  /** 被回复者 UID。 */
  targetUid: string | null
  /** 被回复者昵称。 */
  targetNickname: string | null
  /** 原始回复对象。 */
  reply: QzoneNativeReply
  [key: string]: unknown
}

/** 评论列表中的评论条目。 */
export interface QzoneCommentItem {
  /** 评论 ID。 */
  commentId: string | null
  /** 评论者 QQ 号。 */
  userId: string | null
  /** 评论者 UID。 */
  uid: string | null
  /** 评论者昵称。 */
  nickname: string | null
  /** 评论时间。 */
  time: number | null
  /** 评论正文。 */
  content: string | null
  /** 图片列表。 */
  images: string[] | null
  /** 点赞数。 */
  likeCount: number | null
  /** 当前账号是否已点赞。 */
  liked: boolean | null
  /** 回复数。 */
  replyNum: number | null
  /** 是否还有更多回复。 */
  hasMoreReplies: boolean | null
  /** 内联回复列表。 */
  replies: QzoneCommentReplyItem[]
  /** 原始评论对象。 */
  comment: QzoneNativeComment
  [key: string]: unknown
}

/** 评论分页响应。 */
export interface QzoneCommentPage {
  /** 动态引用，可用于续页。 */
  feedRef: QzoneFeedRef
  /** 评论总数。 */
  commentNum: number | null
  /** 评论列表。 */
  comments: QzoneCommentItem[]
  /** 是否还有下一页。 */
  hasMore: boolean
  /** 下一页游标。 */
  nextCursor: string | null
  /** 完整原始对象。 */
  raw: Record<string, unknown>
  [key: string]: unknown
}

/** 评论回复分页响应。 */
export interface QzoneCommentReplyPage {
  /** 动态引用，可用于续页。 */
  feedRef: QzoneFeedRef
  /** 父评论 ID。 */
  commentId: string
  /** 回复列表。 */
  replies: QzoneCommentReplyItem[]
  /** 回复总数。 */
  replyNum: number | null
  /** 是否还有下一页。 */
  hasMore: boolean
  /** 下一页游标。 */
  nextCursor: string | null
  /** 完整原始对象。 */
  raw: Record<string, unknown>
  [key: string]: unknown
}

/** commentQzone 的 tid 模式响应。 */
export interface QzoneCommentResultByTid {
  /** 新评论或回复 ID。 */
  commentId: string
  /** 父评论 ID。 */
  parentCommentId?: string
  /** 父评论作者 QQ 号。 */
  parentCommentUin?: number
  [key: string]: unknown
}

/** commentQzone 的 feed_ref 模式响应。 */
export interface QzoneCommentResultByFeedRef {
  /** 新评论或回复 ID。 */
  commentId: string
  /** 空间返回的完整评论或回复对象。 */
  comment: QzoneNativeComment
  [key: string]: unknown
}

/** commentQzone 响应。 */
export type QzoneCommentResult = QzoneCommentResultByTid | QzoneCommentResultByFeedRef

/** QQ 空间资料。 */
export interface QzoneProfileInfo {
  /** 空间名称。 */
  name: string
  /** 空间说明。 */
  description: string
  [key: string]: unknown
}

/** setQzoneMsgRight 响应。 */
export interface QzoneMsgRightResult {
  /** 设置成功的查看权限。 */
  ugcRight: number
  [key: string]: unknown
}

/** 空友爱看动态分页响应。 */
export interface QzonePublicFeedPage {
  /** 完整动态对象，可直接传给详情和互动接口。 */
  feeds: QzonePublicFeed[]
  /** 是否还有下一页。 */
  hasMore: boolean
  /** 下一页游标，没有下一页时为 null。 */
  nextCursor: string | null
  [key: string]: unknown
}
