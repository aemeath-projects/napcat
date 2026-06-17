/**
 * 消息段类型定义（标准 OneBot 11 + NapCat 扩展）。
 */

/** 纯文本消息段。 */
export interface TextSegment {
  type: 'text'
  data: {
    text: string
    [key: string]: unknown
  }
}

/** 表情消息段。 */
export interface FaceSegment {
  type: 'face'
  data: {
    id: number
    raw?: string | null
    resultId?: string | null
    chainCount?: number | null
    [key: string]: unknown
  }
}

/** 图片消息段。 */
export interface ImageSegment {
  type: 'image'
  data: {
    file: string
    name?: string | null
    summary?: string | null
    subType?: number | null
    fileId?: string | null
    url?: string | null
    path?: string | null
    fileSize?: number | null
    fileUnique?: string | null
    [key: string]: unknown
  }
}

/** 语音消息段。 */
export interface RecordSegment {
  type: 'record'
  data: {
    file: string
    name?: string | null
    fileId?: string | null
    url?: string | null
    path?: string | null
    fileSize?: number | null
    fileUnique?: string | null
    [key: string]: unknown
  }
}

/** 视频消息段。 */
export interface VideoSegment {
  type: 'video'
  data: {
    file: string
    name?: string | null
    thumb?: string | null
    fileId?: string | null
    url?: string | null
    path?: string | null
    fileSize?: number | null
    fileUnique?: string | null
    [key: string]: unknown
  }
}

/** @提及消息段。 */
export interface AtSegment {
  type: 'at'
  data: {
    qq: string // 数字 QQ 号字符串，或 "all"
    [key: string]: unknown
  }
}

/** 引用回复消息段。 */
export interface ReplySegment {
  type: 'reply'
  data: {
    id: number
    [key: string]: unknown
  }
}

/** 合并转发消息段。 */
export interface ForwardSegment {
  type: 'forward'
  data: {
    id: string
    content?: unknown[] | null
    [key: string]: unknown
  }
}

/** 商城表情消息段（NapCat 扩展）。 */
export interface MFaceSegment {
  type: 'mface'
  data: {
    emojiId?: string | null
    emojiPackageId?: string | null
    key?: string | null
    summary?: string | null
    [key: string]: unknown
  }
}

/** 骰子消息段。 */
export interface DiceSegment {
  type: 'dice'
  data: {
    result?: number | null
    [key: string]: unknown
  }
}

/** 猜拳消息段。 */
export interface RpsSegment {
  type: 'rps'
  data: {
    result?: number | null
    [key: string]: unknown
  }
}

/** 戳一戳消息段。 */
export interface PokeSegment {
  type: 'poke'
  data: {
    type: string
    id: string
    [key: string]: unknown
  }
}

/** 文件消息段。 */
export interface FileSegment {
  type: 'file'
  data: {
    file: string
    name?: string | null
    fileId?: string | null
    fileSize?: number | null
    fileUnique?: string | null
    path?: string | null
    url?: string | null
    [key: string]: unknown
  }
}

/** JSON 富文本消息段。 */
export interface JsonSegment {
  type: 'json'
  data: {
    data: string | Record<string, unknown>
    [key: string]: unknown
  }
}

/** 音乐分享消息段。 */
export interface MusicSegment {
  type: 'music'
  data: {
    type: string // qq | 163 | kugou | kuwo | migu | custom（QQ | 网易云 | 酷狗 | 酷我 | 咪咕 | 自定义）
    id?: string | null
    url?: string | null
    image?: string | null
    singer?: string | null
    title?: string | null
    content?: string | null
    [key: string]: unknown
  }
}

/** 转发消息节点消息段。 */
export interface NodeSegment {
  type: 'node'
  data: {
    id?: number | null
    content?: unknown[] | null
    userId?: number | null
    nickname?: string | null
    [key: string]: unknown
  }
}

/** 联系人名片消息段。 */
export interface ContactSegment {
  type: 'contact'
  data: {
    type: string // qq | group（QQ好友 | 群聊）
    id: string
    [key: string]: unknown
  }
}

/** Markdown 消息段。 */
export interface MarkdownSegment {
  type: 'markdown'
  data: {
    content?: string | null
    [key: string]: unknown
  }
}

/** 链接分享消息段。 */
export interface ShareSegment {
  type: 'share'
  data: {
    url?: string | null
    title?: string | null
    content?: string | null
    image?: string | null
    [key: string]: unknown
  }
}

/** 位置消息段。 */
export interface LocationSegment {
  type: 'location'
  data: {
    lat?: number | null
    lon?: number | null
    title?: string | null
    content?: string | null
    [key: string]: unknown
  }
}

/** 未知/自定义消息段。 */
export interface UnknownSegment {
  type: string
  data: Record<string, unknown>
}

/** 所有消息段类型的判别联合类型。 */
export type MessageSegment =
  | TextSegment
  | FaceSegment
  | ImageSegment
  | RecordSegment
  | VideoSegment
  | AtSegment
  | ReplySegment
  | ForwardSegment
  | MFaceSegment
  | DiceSegment
  | RpsSegment
  | PokeSegment
  | FileSegment
  | JsonSegment
  | MusicSegment
  | NodeSegment
  | ContactSegment
  | MarkdownSegment
  | ShareSegment
  | LocationSegment
  | UnknownSegment
