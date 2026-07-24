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
  /** 添加文本消息段。
   * @param text - 文本内容。
   * @returns this */
  text(text: string): MessageBuilder
  /** 添加表情消息段。
   * @param id - 表情 ID。
   * @returns this */
  face(id: number): MessageBuilder
  /** 添加图片消息段。
   * @param file - 图片文件路径或 URL。
   * @param opts - 图片附加参数。
   * @returns this */
  image(file: string, opts?: Partial<ImageSegment['data']>): MessageBuilder
  /** 添加语音消息段。
   * @param file - 语音文件路径或 URL。
   * @param opts - 语音附加参数。
   * @returns this */
  record(file: string, opts?: Partial<RecordSegment['data']>): MessageBuilder
  /** 添加视频消息段。
   * @param file - 视频文件路径或 URL。
   * @param opts - 视频附加参数。
   * @returns this */
  video(file: string, opts?: Partial<VideoSegment['data']>): MessageBuilder
  /** 添加 at 消息段。
   * @param qq - QQ 号或 'all'。
   * @returns this */
  at(qq: number | 'all'): MessageBuilder
  /** 添加回复消息段。
   * @param id - 回复目标消息 ID。
   * @returns this */
  reply(id: number): MessageBuilder
  /** 添合并转发消息段。
   * @param id - 合并转发 ID。
   * @returns this */
  forward(id: string): MessageBuilder
  /** 添加商城表情消息段。
   * @param opts - 商城表情参数。
   * @returns this */
  mface(opts: Partial<MFaceSegment['data']>): MessageBuilder
  /** 添加骰子消息段。
   * @returns this */
  dice(): MessageBuilder
  /** 添加猜拳消息段。
   * @returns this */
  rps(): MessageBuilder
  /** 添加戳一戳消息段。
   * @param type - 戳一戳类型。
   * @param id - 戳一戳 ID。
   * @returns this */
  poke(type: string, id: string): MessageBuilder
  /** 添加文件消息段。
   * @param file - 文件路径或 URL。
   * @param opts - 文件附加参数。
   * @returns this */
  file(file: string, opts?: Partial<FileSegment['data']>): MessageBuilder
  /** 添加 JSON 消息段。
   * @param data - JSON 字符串。
   * @returns this */
  json(data: string): MessageBuilder
  /** 添加音乐消息段。
   * @param type - 音乐平台类型。
   * @param id - 音乐 ID。
   * @returns this */
  music(type: string, id: string): MessageBuilder
  /** 添加自定义音乐消息段。
   * @param url - 跳转 URL。
   * @param audio - 音频 URL。
   * @param title - 标题。
   * @param singer - 歌手。
   * @param image - 封面图 URL。
   * @returns this */
  customMusic(
    url: string,
    audio: string,
    title: string,
    singer?: string,
    image?: string,
  ): MessageBuilder
  /** 添加合并转发节点消息段。
   * @param content - 节点内消息段数组。
   * @param userId - 发送者 QQ 号。
   * @param nickname - 发送者昵称。
   * @returns this */
  node(content: MessageSegment[], userId?: number, nickname?: string): MessageBuilder
  /** 添加推荐联系人/群消息段。
   * @param type - 推荐类型（'qq' 或 'group'）。
   * @param id - 推荐 ID。
   * @returns this */
  contact(type: 'qq' | 'group', id: string): MessageBuilder
  /** 添加 Markdown 消息段。
   * @param content - Markdown 内容。
   * @returns this */
  markdown(content: string): MessageBuilder
  /** 添加链接分享消息段。
   * @param url - 分享链接。
   * @param title - 标题。
   * @param opts - 可选参数（content, image）。
   * @returns this */
  share(url: string, title: string, opts?: { content?: string; image?: string }): MessageBuilder
  /** 添加位置消息段。
   * @param lat - 纬度。
   * @param lon - 经度。
   * @param opts - 可选参数（title, content）。
   * @returns this */
  location(lat: number, lon: number, opts?: { title?: string; content?: string }): MessageBuilder

  /** 获取当前累积的消息段数组。
   * @returns 消息段数组。 */
  value(): MessageSegment[]
  /** 序列化当前消息段数组为 CQ 码字符串。
   * @returns CQ 码字符串。 */
  stringify(): string
}

/** 静态工厂方法集合。确保与 MessageBuilder 接口保持方法名同步。 */
export const factories = {
  /** 创建文本消息段。
   * @param text - 文本内容。
   * @returns 文本消息段。 */
  text(text: string): TextSegment {
    return { type: 'text', data: { text } }
  },

  /** 创建表情消息段。
   * @param id - 表情 ID。
   * @returns 表情消息段。 */
  face(id: number): FaceSegment {
    return { type: 'face', data: { id } }
  },

  /** 创建图片消息段。
   * @param file - 图片文件路径或 URL。
   * @param opts - 图片附加参数。
   * @returns 图片消息段。 */
  image(file: string, opts?: Partial<ImageSegment['data']>): ImageSegment {
    return { type: 'image', data: { file, ...opts } }
  },

  /** 创建语音消息段。
   * @param file - 语音文件路径或 URL。
   * @param opts - 语音附加参数。
   * @returns 语音消息段。 */
  record(file: string, opts?: Partial<RecordSegment['data']>): RecordSegment {
    return { type: 'record', data: { file, ...opts } }
  },

  /** 创建视频消息段。
   * @param file - 视频文件路径或 URL。
   * @param opts - 视频附加参数。
   * @returns 视频消息段。 */
  video(file: string, opts?: Partial<VideoSegment['data']>): VideoSegment {
    return { type: 'video', data: { file, ...opts } }
  },

  /** 创建 at 消息段。
   * @param qq - QQ 号或 'all'。
   * @returns at 消息段。 */
  at(qq: number | 'all'): AtSegment {
    return { type: 'at', data: { qq: typeof qq === 'number' ? String(qq) : qq } }
  },

  /** 创建回复消息段。
   * @param id - 回复目标消息 ID。
   * @returns 回复消息段。 */
  reply(id: number): ReplySegment {
    return { type: 'reply', data: { id } }
  },

  /** 创建合并转发消息段。
   * @param id - 合并转发 ID。
   * @returns 合并转发消息段。 */
  forward(id: string): ForwardSegment {
    return { type: 'forward', data: { id } }
  },

  /** 创建商城表情消息段。
   * @param opts - 商城表情参数。
   * @returns 商城表情消息段。 */
  mface(opts: Partial<MFaceSegment['data']>): MFaceSegment {
    return { type: 'mface', data: { ...opts } }
  },

  /** 创建骰子消息段。
   * @returns 骰子消息段。 */
  dice(): DiceSegment {
    return { type: 'dice', data: {} }
  },

  /** 创建猜拳消息段。
   * @returns 猜拳消息段。 */
  rps(): RpsSegment {
    return { type: 'rps', data: {} }
  },

  /** 创建戳一戳消息段。
   * @param type - 戳一戳类型。
   * @param id - 戳一戳 ID。
   * @returns 戳一戳消息段。 */
  poke(type: string, id: string): PokeSegment {
    return { type: 'poke', data: { type, id } }
  },

  /** 创建文件消息段。
   * @param file - 文件路径或 URL。
   * @param opts - 文件附加参数。
   * @returns 文件消息段。 */
  file(file: string, opts?: Partial<FileSegment['data']>): FileSegment {
    return { type: 'file', data: { file, ...opts } }
  },

  /** 创建 JSON 消息段。
   * @param data - JSON 字符串。
   * @returns JSON 消息段。 */
  json(data: string): JsonSegment {
    return { type: 'json', data: { data } }
  },

  /** 创建音乐消息段。
   * @param type - 音乐平台类型。
   * @param id - 音乐 ID。
   * @returns 音乐消息段。 */
  music(type: string, id: string): MusicSegment {
    return { type: 'music', data: { type, id } }
  },

  /** 创建自定义音乐消息段。
   * @param url - 跳转 URL。
   * @param audio - 音频 URL。
   * @param title - 标题。
   * @param singer - 歌手。
   * @param image - 封面图 URL。
   * @returns 自定义音乐消息段。 */
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

  /** 创建合并转发节点消息段。
   * @param content - 节点内消息段数组。
   * @param userId - 发送者 QQ 号。
   * @param nickname - 发送者昵称。
   * @returns 合并转发节点消息段。 */
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

  /** 创建推荐联系人/群消息段。
   * @param type - 推荐类型（'qq' 或 'group'）。
   * @param id - 推荐 ID。
   * @returns 推荐联系人/群消息段。 */
  contact(type: 'qq' | 'group', id: string): ContactSegment {
    return { type: 'contact', data: { type, id } }
  },

  /** 创建 Markdown 消息段。
   * @param content - Markdown 内容。
   * @returns Markdown 消息段。 */
  markdown(content: string): MarkdownSegment {
    return { type: 'markdown', data: { content } }
  },

  /** 创建链接分享消息段。
   * @param url - 分享链接。
   * @param title - 标题。
   * @param opts - 可选参数（content, image）。
   * @returns 链接分享消息段。 */
  share(url: string, title: string, opts?: { content?: string; image?: string }): ShareSegment {
    return { type: 'share', data: { url, title, ...opts } }
  },

  /** 创建位置消息段。
   * @param lat - 纬度。
   * @param lon - 经度。
   * @param opts - 可选参数（title, content）。
   * @returns 位置消息段。 */
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
