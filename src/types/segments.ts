/**
 * 消息段类型定义（标准 OneBot 11 + NapCat 扩展）。
 */

/** 纯文本消息段。 */
export interface TextSegment {
  /** 消息段类型标识。 */
  type: 'text'
  data: {
    /** 文本内容。 */
    text: string
    [key: string]: unknown
  }
}

/** 表情消息段。 */
export interface FaceSegment {
  /** 消息段类型标识。 */
  type: 'face'
  data: {
    /** 表情 ID。 */
    id: number
    /** 原始 OBJ 消息数据。 */
    raw?: string | null
    /** 表情结果 ID。 */
    resultId?: string | null
    /** 合并的表情数量。 */
    chainCount?: number | null
    [key: string]: unknown
  }
}

/** 图片消息段。 */
export interface ImageSegment {
  /** 消息段类型标识。 */
  type: 'image'
  data: {
    /** 图片文件路径、文件名、base64 或 URL。 */
    file: string
    /** 图片原文件名。 */
    name?: string | null
    /** 图片摘要，写入时通常传空。 */
    summary?: string | null
    /** 图片子类型，0 为正常图片。 */
    subType?: number | null
    /** 文件 UUID，写入消息时优先使用。 */
    fileId?: string | null
    /** 图片下载地址。 */
    url?: string | null
    /** 图片缓存路径。 */
    path?: string | null
    /** 文件大小（字节）。 */
    fileSize?: number | null
    /** 文件唯一标识。 */
    fileUnique?: string | null
    [key: string]: unknown
  }
}

/** 语音消息段。 */
export interface RecordSegment {
  /** 消息段类型标识。 */
  type: 'record'
  data: {
    /** 语音文件路径、文件名、base64 或 URL。 */
    file: string
    /** 语音原文件名。 */
    name?: string | null
    /** 文件 UUID，写入消息时优先使用。 */
    fileId?: string | null
    /** 语音下载地址。 */
    url?: string | null
    /** 语音缓存路径。 */
    path?: string | null
    /** 文件大小（字节）。 */
    fileSize?: number | null
    /** 文件唯一标识。 */
    fileUnique?: string | null
    [key: string]: unknown
  }
}

/** 视频消息段。 */
export interface VideoSegment {
  /** 消息段类型标识。 */
  type: 'video'
  data: {
    /** 视频文件路径、文件名或 URL。 */
    file: string
    /** 视频原文件名。 */
    name?: string | null
    /** 视频缩略图路径或 URL。 */
    thumb?: string | null
    /** 文件 UUID，写入消息时优先使用。 */
    fileId?: string | null
    /** 视频下载地址。 */
    url?: string | null
    /** 视频缓存路径。 */
    path?: string | null
    /** 文件大小（字节）。 */
    fileSize?: number | null
    /** 文件唯一标识。 */
    fileUnique?: string | null
    [key: string]: unknown
  }
}

/** @提及消息段。 */
export interface AtSegment {
  /** 消息段类型标识。 */
  type: 'at'
  data: {
    /** QQ 号字符串，或 "all" 表示 @全体成员。 */
    qq: string
    [key: string]: unknown
  }
}

/** 引用回复消息段。 */
export interface ReplySegment {
  /** 消息段类型标识。 */
  type: 'reply'
  data: {
    /** 被引用消息的 ID。 */
    id: number
    [key: string]: unknown
  }
}

/** 合并转发消息段。 */
export interface ForwardSegment {
  /** 消息段类型标识。 */
  type: 'forward'
  data: {
    /** 合并转发消息的 ID。 */
    id: string
    /** 节点内容列表，传入时使用。 */
    content?: unknown[] | null
    [key: string]: unknown
  }
}

/** 商城表情消息段（NapCat 扩展）。 */
export interface MFaceSegment {
  /** 消息段类型标识。 */
  type: 'mface'
  data: {
    /** 表情 ID。 */
    emojiId?: string | null
    /** 表情包 ID。 */
    emojiPackageId?: string | null
    /** 表情加密密钥。 */
    key?: string | null
    /** 表情摘要。 */
    summary?: string | null
    [key: string]: unknown
  }
}

/** 骰子消息段。 */
export interface DiceSegment {
  /** 消息段类型标识。 */
  type: 'dice'
  data: {
    /** 骰子结果，1-6。 */
    result?: number | null
    [key: string]: unknown
  }
}

/** 猜拳消息段。 */
export interface RpsSegment {
  /** 消息段类型标识。 */
  type: 'rps'
  data: {
    /** 猜拳结果，1-3 分别代表石头、剪刀、布。 */
    result?: number | null
    [key: string]: unknown
  }
}

/** 戳一戳消息段。 */
export interface PokeSegment {
  /** 消息段类型标识。 */
  type: 'poke'
  data: {
    /** 戳一戳类型标识。 */
    type: string
    /** 目标 ID。 */
    id: string
    [key: string]: unknown
  }
}

/** 文件消息段。 */
export interface FileSegment {
  /** 消息段类型标识。 */
  type: 'file'
  data: {
    /** 文件路径、文件名或 URL。 */
    file: string
    /** 文件原文件名。 */
    name?: string | null
    /** 文件 UUID，写入消息时优先使用。 */
    fileId?: string | null
    /** 文件大小（字节）。 */
    fileSize?: number | null
    /** 文件唯一标识。 */
    fileUnique?: string | null
    /** 文件缓存路径。 */
    path?: string | null
    /** 文件下载地址。 */
    url?: string | null
    [key: string]: unknown
  }
}

/** JSON 富文本消息段。 */
export interface JsonSegment {
  /** 消息段类型标识。 */
  type: 'json'
  data: {
    /** JSON 数据字符串或对象。 */
    data: string | Record<string, unknown>
    [key: string]: unknown
  }
}

/** 音乐分享消息段。 */
export interface MusicSegment {
  /** 消息段类型标识。 */
  type: 'music'
  data: {
    /** 音乐来源类型：qq、163、kugou、kuwo、migu 或 custom。 */
    type: string
    /** 音乐 ID。 */
    id?: string | null
    /** 音乐跳转链接。 */
    url?: string | null
    /** 封面图片或 URL。 */
    image?: string | null
    /** 歌手。 */
    singer?: string | null
    /** 歌曲标题。 */
    title?: string | null
    /** 内容说明。 */
    content?: string | null
    [key: string]: unknown
  }
}

/** 转发消息节点消息段。 */
export interface NodeSegment {
  /** 消息段类型标识。 */
  type: 'node'
  data: {
    /** 引用已有消息的 ID，引用时填写。 */
    id?: number | null
    /** 消息内容段，传入新消息时使用。 */
    content?: unknown[] | null
    /** 发送者 QQ 号。 */
    userId?: number | null
    /** 发送者昵称。 */
    nickname?: string | null
    [key: string]: unknown
  }
}

/** 联系人名片消息段。 */
export interface ContactSegment {
  /** 消息段类型标识。 */
  type: 'contact'
  data: {
    /** 联系人类型：qq 或 group。 */
    type: string
    /** 联系人 QQ 号或群号。 */
    id: string
    [key: string]: unknown
  }
}

/** Markdown 消息段。 */
export interface MarkdownSegment {
  /** 消息段类型标识。 */
  type: 'markdown'
  data: {
    /** Markdown 文本内容。 */
    content?: string | null
    [key: string]: unknown
  }
}

/** 链接分享消息段。 */
export interface ShareSegment {
  /** 消息段类型标识。 */
  type: 'share'
  data: {
    /** 链接地址。 */
    url?: string | null
    /** 标题。 */
    title?: string | null
    /** 内容简介。 */
    content?: string | null
    /** 分享图片或 URL。 */
    image?: string | null
    [key: string]: unknown
  }
}

/** 位置消息段。 */
export interface LocationSegment {
  /** 消息段类型标识。 */
  type: 'location'
  data: {
    /** 纬度。 */
    lat?: number | null
    /** 经度。 */
    lon?: number | null
    /** 位置名称。 */
    title?: string | null
    /** 详细地址。 */
    content?: string | null
    [key: string]: unknown
  }
}

/** 未知/自定义消息段。 */
export interface UnknownSegment {
  /** 消息段类型。 */
  type: string
  /** 消息段数据。 */
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
