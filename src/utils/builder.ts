/**
 * 消息构建器共享接口与工厂函数。
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
} from '../types'

/** 链式消息构建器接口。 */
export interface MessageBuilder {
  text(text: string): MessageBuilder
  face(id: number): MessageBuilder
  image(file: string, opts?: Partial<ImageSegment['data']>): MessageBuilder
  record(file: string, opts?: Partial<RecordSegment['data']>): MessageBuilder
  video(file: string, opts?: Partial<VideoSegment['data']>): MessageBuilder
  at(qq: number | 'all'): MessageBuilder
  reply(id: number): MessageBuilder
  forward(id: string): MessageBuilder
  mface(opts: Partial<MFaceSegment['data']>): MessageBuilder
  dice(): MessageBuilder
  rps(): MessageBuilder
  poke(type: string, id: string): MessageBuilder
  file(file: string, opts?: Partial<FileSegment['data']>): MessageBuilder
  json(data: string): MessageBuilder
  music(type: string, id: string): MessageBuilder
  customMusic(
    url: string,
    audio: string,
    title: string,
    singer?: string,
    image?: string,
  ): MessageBuilder
  node(content: MessageSegment[], userId?: number, nickname?: string): MessageBuilder
  contact(type: 'qq' | 'group', id: string): MessageBuilder
  markdown(content: string): MessageBuilder
  share(url: string, title: string, opts?: { content?: string; image?: string }): MessageBuilder
  location(lat: number, lon: number, opts?: { title?: string; content?: string }): MessageBuilder

  value(): MessageSegment[]
  stringify(): string
}

/** 静态工厂方法集合。确保与 MessageBuilder 接口保持方法名同步。 */
export const factories = {
  text(text: string): TextSegment {
    return { type: 'text', data: { text } }
  },

  face(id: number): FaceSegment {
    return { type: 'face', data: { id } }
  },

  image(file: string, opts?: Partial<ImageSegment['data']>): ImageSegment {
    return { type: 'image', data: { file, ...opts } }
  },

  record(file: string, opts?: Partial<RecordSegment['data']>): RecordSegment {
    return { type: 'record', data: { file, ...opts } }
  },

  video(file: string, opts?: Partial<VideoSegment['data']>): VideoSegment {
    return { type: 'video', data: { file, ...opts } }
  },

  at(qq: number | 'all'): AtSegment {
    return { type: 'at', data: { qq: typeof qq === 'number' ? String(qq) : qq } }
  },

  reply(id: number): ReplySegment {
    return { type: 'reply', data: { id } }
  },

  forward(id: string): ForwardSegment {
    return { type: 'forward', data: { id } }
  },

  mface(opts: Partial<MFaceSegment['data']>): MFaceSegment {
    return { type: 'mface', data: { ...opts } }
  },

  dice(): DiceSegment {
    return { type: 'dice', data: {} }
  },

  rps(): RpsSegment {
    return { type: 'rps', data: {} }
  },

  poke(type: string, id: string): PokeSegment {
    return { type: 'poke', data: { type, id } }
  },

  file(file: string, opts?: Partial<FileSegment['data']>): FileSegment {
    return { type: 'file', data: { file, ...opts } }
  },

  json(data: string): JsonSegment {
    return { type: 'json', data: { data } }
  },

  music(type: string, id: string): MusicSegment {
    return { type: 'music', data: { type, id } }
  },

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

  node(content: MessageSegment[], userId?: number, nickname?: string): NodeSegment {
    return {
      type: 'node',
      data: {
        content,
        userId: userId ?? null,
        nickname: nickname ?? null,
      },
    }
  },

  contact(type: 'qq' | 'group', id: string): ContactSegment {
    return { type: 'contact', data: { type, id } }
  },

  markdown(content: string): MarkdownSegment {
    return { type: 'markdown', data: { content } }
  },

  share(url: string, title: string, opts?: { content?: string; image?: string }): ShareSegment {
    return { type: 'share', data: { url, title, ...opts } }
  },

  location(lat: number, lon: number, opts?: { title?: string; content?: string }): LocationSegment {
    return { type: 'location', data: { lat, lon, ...opts } }
  },
} satisfies Record<
  keyof Omit<MessageBuilder, 'value' | 'stringify'>,
  (...args: never[]) => MessageSegment
>

/**
 * 创建链式消息构建器。
 * @param initial 可选的初始消息段数组
 * @param stringifyFn 序列化函数（将消息段数组转为 CQ 码字符串）
 */
export function createBuilder(
  initial?: MessageSegment[],
  stringifyFn?: (segs: MessageSegment[]) => string,
): MessageBuilder {
  const segments: MessageSegment[] = [...(initial ?? [])]

  const builder: MessageBuilder = {
    text(text: string) {
      segments.push(factories.text(text))
      return builder
    },

    face(id: number) {
      segments.push(factories.face(id))
      return builder
    },

    image(file: string, opts?: Partial<ImageSegment['data']>) {
      segments.push(factories.image(file, opts))
      return builder
    },

    record(file: string, opts?: Partial<RecordSegment['data']>) {
      segments.push(factories.record(file, opts))
      return builder
    },

    video(file: string, opts?: Partial<VideoSegment['data']>) {
      segments.push(factories.video(file, opts))
      return builder
    },

    at(qq: number | 'all') {
      segments.push(factories.at(qq))
      return builder
    },

    reply(id: number) {
      segments.push(factories.reply(id))
      return builder
    },

    forward(id: string) {
      segments.push(factories.forward(id))
      return builder
    },

    mface(opts: Partial<MFaceSegment['data']>) {
      segments.push(factories.mface(opts))
      return builder
    },

    dice() {
      segments.push(factories.dice())
      return builder
    },

    rps() {
      segments.push(factories.rps())
      return builder
    },

    poke(type: string, id: string) {
      segments.push(factories.poke(type, id))
      return builder
    },

    file(file: string, opts?: Partial<FileSegment['data']>) {
      segments.push(factories.file(file, opts))
      return builder
    },

    json(data: string) {
      segments.push(factories.json(data))
      return builder
    },

    music(type: string, id: string) {
      segments.push(factories.music(type, id))
      return builder
    },

    customMusic(url: string, audio: string, title: string, singer?: string, image?: string) {
      segments.push(factories.customMusic(url, audio, title, singer, image))
      return builder
    },

    node(content: MessageSegment[], userId?: number, nickname?: string) {
      segments.push(factories.node(content, userId, nickname))
      return builder
    },

    contact(type: 'qq' | 'group', id: string) {
      segments.push(factories.contact(type, id))
      return builder
    },

    markdown(content: string) {
      segments.push(factories.markdown(content))
      return builder
    },

    share(url: string, title: string, opts?: { content?: string; image?: string }) {
      segments.push(factories.share(url, title, opts))
      return builder
    },

    location(lat: number, lon: number, opts?: { title?: string; content?: string }) {
      segments.push(factories.location(lat, lon, opts))
      return builder
    },

    value() {
      return [...segments]
    },

    stringify() {
      if (!stringifyFn) {
        throw new Error('stringify not available')
      }
      return stringifyFn(segments)
    },
  }

  return builder
}
