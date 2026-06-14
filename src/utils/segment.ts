/**
 * 消息段构建工厂 Seg 及相关工具函数。
 */

import type {
  MessageSegment,
  TextSegment,
  FaceSegment,
  ImageSegment,
  RecordSegment,
  VideoSegment,
  AtSegment,
  ReplySegment,
  ForwardSegment,
  MFaceSegment,
  DiceSegment,
  RpsSegment,
  PokeSegment,
  FileSegment,
  JsonSegment,
  MusicSegment,
  NodeSegment,
  ContactSegment,
  MarkdownSegment,
  ShareSegment,
  LocationSegment,
} from '../types/index.js'

/** 消息段构建工厂。每个方法返回对应类型的消息段对象。 */
export const Seg = {
  /** 构建纯文本消息段。 */
  text(text: string): TextSegment {
    return { type: 'text', data: { text } }
  },

  /** 构建表情消息段。 */
  face(id: number): FaceSegment {
    return { type: 'face', data: { id } }
  },

  /** 构建图片消息段。 */
  image(file: string, opts?: Partial<ImageSegment['data']>): ImageSegment {
    return { type: 'image', data: { file, ...opts } }
  },

  /** 构建语音消息段。 */
  record(file: string, opts?: Partial<RecordSegment['data']>): RecordSegment {
    return { type: 'record', data: { file, ...opts } }
  },

  /** 构建视频消息段。 */
  video(file: string, opts?: Partial<VideoSegment['data']>): VideoSegment {
    return { type: 'video', data: { file, ...opts } }
  },

  /** 构建 @提及消息段。qq 为数字时自动转为字符串；传 'all' 表示 @全体成员。 */
  at(qq: number | 'all'): AtSegment {
    return { type: 'at', data: { qq: typeof qq === 'number' ? String(qq) : qq } }
  },

  /** 构建引用回复消息段。 */
  reply(id: number): ReplySegment {
    return { type: 'reply', data: { id } }
  },

  /** 构建合并转发消息段。 */
  forward(id: string): ForwardSegment {
    return { type: 'forward', data: { id } }
  },

  /** 构建商城表情消息段（NapCat 扩展）。 */
  mface(opts: Partial<MFaceSegment['data']>): MFaceSegment {
    return { type: 'mface', data: { ...opts } }
  },

  /** 构建骰子消息段。 */
  dice(): DiceSegment {
    return { type: 'dice', data: {} }
  },

  /** 构建猜拳消息段。 */
  rps(): RpsSegment {
    return { type: 'rps', data: {} }
  },

  /** 构建戳一戳消息段。 */
  poke(type: string, id: string): PokeSegment {
    return { type: 'poke', data: { type, id } }
  },

  /** 构建文件消息段。 */
  file(file: string, opts?: Partial<FileSegment['data']>): FileSegment {
    return { type: 'file', data: { file, ...opts } }
  },

  /** 构建 JSON 富文本消息段。 */
  json(data: string): JsonSegment {
    return { type: 'json', data: { data } }
  },

  /** 构建平台音乐分享消息段（qq / 163 / kugou 等）。 */
  music(type: string, id: string): MusicSegment {
    return { type: 'music', data: { type, id } }
  },

  /** 构建自定义音乐分享消息段。 */
  customMusic(
    url: string,
    audio: string,
    title: string,
    singer?: string,
    image?: string,
  ): MusicSegment {
    return {
      type: 'music',
      data: { type: 'custom', url, content: audio, title, singer, image },
    }
  },

  /** 构建转发消息节点消息段。 */
  node(content: MessageSegment[], userId?: number, nickname?: string): NodeSegment {
    return {
      type: 'node',
      data: {
        content,
        user_id: userId ?? null,
        nickname: nickname ?? null,
      },
    }
  },

  /** 构建联系人名片消息段。 */
  contact(type: 'qq' | 'group', id: string): ContactSegment {
    return { type: 'contact', data: { type, id } }
  },

  /** 构建 Markdown 消息段。 */
  markdown(content: string): MarkdownSegment {
    return { type: 'markdown', data: { content } }
  },

  /** 构建链接分享消息段。 */
  share(url: string, title: string, opts?: { content?: string; image?: string }): ShareSegment {
    return { type: 'share', data: { url, title, ...opts } }
  },

  /** 构建位置消息段。 */
  location(lat: number, lon: number, opts?: { title?: string; content?: string }): LocationSegment {
    return { type: 'location', data: { lat, lon, ...opts } }
  },
} as const

/** 从消息段数组中提取纯文本内容。非文本段以空格占位，结果 trim 首尾空白。 */
export function extractPlaintext(segments: MessageSegment[]): string {
  return segments
    .map((seg) => (seg.type === 'text' ? (seg as TextSegment).data.text : ' '))
    .join('')
    .trim()
}
