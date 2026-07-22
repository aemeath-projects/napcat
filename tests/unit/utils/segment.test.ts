import { describe, it, expect, expectTypeOf } from 'vitest'

import type { MessageSegment, TextSegment, AtSegment, NodeSegment } from '../../../src/types'
import { seg, extractPlaintext } from '../../../src/utils'
import type { MessageBuilder } from '../../../src/utils/builder.js'
import { createBuilder } from '../../../src/utils/builder.js'

describe('seg 链式构建器', () => {
  it('seg() 无初始数组时 value() 返回 []', () => {
    expect(seg().value()).toEqual([])
  })

  it('seg([initial]) 传入初始数组', () => {
    const result = seg([seg.at(123)]).value()
    expect(result).toEqual([{ type: 'at', data: { qq: '123' } }])
  })

  it('链式追加方法按顺序累加', () => {
    const result = seg().text('hello ').at(123456).text(' world!').value()
    expect(result).toEqual([
      { type: 'text', data: { text: 'hello ' } },
      { type: 'at', data: { qq: '123456' } },
      { type: 'text', data: { text: ' world!' } },
    ])
  })

  it('chain 后 value() 返回独立副本', () => {
    const builder = seg().text('hello')
    const arr1 = builder.value()
    arr1.push(seg.face(1))
    expect(builder.value()).toEqual([{ type: 'text', data: { text: 'hello' } }])
  })

  it('stringify() 正确输出 CQ 码', () => {
    const result = seg().at(123456).text(' hello!').face(178).stringify()
    expect(result).toBe('[CQ:at,qq=123456]\u0020hello![CQ:face,id=178]')
  })

  it('stringify() 正确处理 text 中的特殊字符转义', () => {
    const result = seg().text('a&b[c]d').stringify()
    expect(result).toBe('a&amp;b&#91;c&#93;d')
  })

  it('stringify() 对空构建返回空字符串', () => {
    expect(seg().stringify()).toBe('')
  })
})

describe('seg 链式构建器 极端边界', () => {
  it('seg().at("all") 链式调用正确', () => {
    const result = seg().at('all').value()
    expect(result).toEqual([{ type: 'at', data: { qq: 'all' } }])
  })

  it('seg().at(0) 正确处理零值', () => {
    const result = seg().at(0).value()
    expect(result).toEqual([{ type: 'at', data: { qq: '0' } }])
  })

  it('seg().at(NaN) 转为字符串 "NaN"', () => {
    const result = seg().at(NaN).value()
    expect(result).toEqual([{ type: 'at', data: { qq: 'NaN' } }])
  })

  it('seg().at(Infinity) 转为字符串 "Infinity"', () => {
    const result = seg().at(Infinity).value()
    expect(result).toEqual([{ type: 'at', data: { qq: 'Infinity' } }])
  })

  it('seg().at(-Infinity) 转为字符串 "-Infinity"', () => {
    const result = seg().at(-Infinity).value()
    expect(result).toEqual([{ type: 'at', data: { qq: '-Infinity' } }])
  })

  it('seg().at(-1) 负数 QQ', () => {
    const result = seg().at(-1).value()
    expect(result).toEqual([{ type: 'at', data: { qq: '-1' } }])
  })

  it('seg().at(Number.MAX_SAFE_INTEGER) 极大 QQ', () => {
    const result = seg().at(Number.MAX_SAFE_INTEGER).value()
    expect(result).toEqual([{ type: 'at', data: { qq: String(Number.MAX_SAFE_INTEGER) } }])
  })

  it('seg().face(-1) 负 id', () => {
    const result = seg().face(-1).value()
    expect(result).toEqual([{ type: 'face', data: { id: -1 } }])
  })

  it('seg().face(0) 零 id', () => {
    const result = seg().face(0).value()
    expect(result).toEqual([{ type: 'face', data: { id: 0 } }])
  })

  it('seg().text("") 空字符串 text 段正常', () => {
    const result = seg().text('').value()
    expect(result).toEqual([{ type: 'text', data: { text: '' } }])
  })

  it('seg().text 极长字符串不抛错', () => {
    const long = 'a'.repeat(10000)
    const result = seg().text(long).value()
    expect(result[0].data.text).toBe(long)
  })

  it('seg().text Unicode/emoji/换行符', () => {
    const result = seg().text('😀中文\n换行\t制表').value()
    expect(result).toEqual([{ type: 'text', data: { text: '😀中文\n换行\t制表' } }])
  })

  it('seg() 全 22 种工厂方法链式调用不抛错', () => {
    const nodes: MessageSegment[] = [seg.text('inner')]
    const result = seg()
      .text('hello ')
      .face(1)
      .image('img.jpg')
      .record('audio.silk')
      .video('video.mp4')
      .at(123)
      .reply(1)
      .forward('fwd')
      .mface({ emoji_id: '1' })
      .dice()
      .rps()
      .poke('1', '2')
      .file('doc.pdf')
      .json('{"a":1}')
      .music('qq', '123')
      .customMusic('url', 'audio', 'title')
      .node(nodes, 1, 'bot')
      .contact('qq', '456')
      .markdown('**bold**')
      .share('url', 'title')
      .location(31, 121, { title: 'sh' })
      .text(' end')
      .value()

    expect(result.length).toBe(22)
  })

  it('value() 多次调用返回独立副本不互相影响', () => {
    const builder = seg().text('hello')
    const a = builder.value()
    const b = builder.value()
    const c = builder.value()
    a.push(seg.face(1))
    b.push(seg.at(999))
    expect(c).toEqual([{ type: 'text', data: { text: 'hello' } }])
    expect(builder.value()).toEqual([{ type: 'text', data: { text: 'hello' } }])
  })

  it('seg(initial) initial 被外部修改不影响构建器状态', () => {
    const initial: MessageSegment[] = [seg.text('x')]
    const builder = seg(initial)
    initial.push(seg.text('y'))
    initial[0] = { type: 'face', data: { id: 999 } }
    expect(builder.value()).toEqual([{ type: 'text', data: { text: 'x' } }])
  })

  it('seg().image 全可选参数链式', () => {
    const result = seg()
      .image('f', {
        name: 'n',
        summary: 's',
        fileSize: 1024,
        url: 'http://x',
      })
      .value()
    expect(result[0].data.file).toBe('f')
    expect(result[0].data.fileSize).toBe(1024)
  })

  it('seg().node 不传可选参数时填充 null 的 userId', () => {
    const result = seg().node([]).value()
    expect((result[0] as NodeSegment).data.userId).toBeNull()
    expect((result[0] as NodeSegment).data.nickname).toBeNull()
  })

  it('seg().node 传全部可选参数', () => {
    const result = seg()
      .node([seg.text('inner')], 123, 'user')
      .value()
    expect((result[0] as NodeSegment).data.userId).toBe(123)
    expect((result[0] as NodeSegment).data.nickname).toBe('user')
  })

  it('seg().location 负经纬度', () => {
    const result = seg().location(-31.5, -121.3).value()
    expect(result).toEqual([{ type: 'location', data: { lat: -31.5, lon: -121.3 } }])
  })

  it('seg().location NaN/Infinity 经纬度不抛错', () => {
    expect(() => seg().location(NaN, NaN).value()).not.toThrow()
    expect(() => seg().location(Infinity, -Infinity).value()).not.toThrow()
  })

  it('createBuilder 不给 stringifyFn 时 stringify() 抛出', () => {
    const builder = createBuilder()
    expect(() => builder.stringify()).toThrow('stringify not available')
  })

  it('createBuilder 不给 stringifyFn 时 value() 仍然可用', () => {
    const builder = createBuilder([seg.text('hello')])
    expect(builder.value()).toEqual([{ type: 'text', data: { text: 'hello' } }])
  })
})

describe('seg 工厂函数', () => {
  it('seg.text 创建文本段', () => {
    expect(seg.text('hello')).toEqual({ type: 'text', data: { text: 'hello' } })
  })

  it('seg.at 从数字创建包含字符串 qq 的 AtSegment', () => {
    expect(seg.at(123)).toEqual({ type: 'at', data: { qq: '123' } })
  })

  it('seg.at 创建包含 "all" 的 AtSegment', () => {
    expect(seg.at('all')).toEqual({ type: 'at', data: { qq: 'all' } })
  })

  it('seg.image 创建图片段', () => {
    const result = seg.image('http://example.com/a.png')
    expect(result.type).toBe('image')
    expect(result.data.file).toBe('http://example.com/a.png')
  })

  it('seg.image 接受选项参数', () => {
    const result = seg.image('file.png', { name: 'test.png' })
    expect(result.data.name).toBe('test.png')
  })

  it('seg.reply 创建回复段', () => {
    expect(seg.reply(12345)).toEqual({ type: 'reply', data: { id: 12345 } })
  })

  it('seg.face 创建表情段', () => {
    expect(seg.face(1)).toEqual({ type: 'face', data: { id: 1 } })
  })

  it('seg.record 创建语音段', () => {
    expect(seg.record('audio.silk')).toEqual({ type: 'record', data: { file: 'audio.silk' } })
  })

  it('seg.video 创建视频段', () => {
    expect(seg.video('video.mp4')).toEqual({ type: 'video', data: { file: 'video.mp4' } })
  })

  it('seg.json 创建 JSON 段', () => {
    const result = seg.json('{"key":"val"}')
    expect(result.type).toBe('json')
    expect(result.data.data).toBe('{"key":"val"}')
  })

  it('seg.forward 创建转发段', () => {
    expect(seg.forward('fwd123')).toEqual({ type: 'forward', data: { id: 'fwd123' } })
  })

  it('seg.dice 创建骰子段', () => {
    expect(seg.dice().type).toBe('dice')
  })

  it('seg.rps 创建猜拳段', () => {
    expect(seg.rps().type).toBe('rps')
  })

  it('seg.poke 创建戳一戳段', () => {
    const result = seg.poke('1', '2')
    expect(result.type).toBe('poke')
    expect(result.data.type).toBe('1')
  })

  it('seg.node 创建节点段', () => {
    const result = seg.node([], 123, 'user')
    expect(result.type).toBe('node')
    expect(result.data.userId).toBe(123)
    expect(result.data.nickname).toBe('user')
  })

  it('seg.node 不传可选参数时填充 null', () => {
    const result = seg.node([])
    expect(result.type).toBe('node')
    expect(result.data.userId).toBeNull()
    expect(result.data.nickname).toBeNull()
  })

  it('seg.music 创建音乐段', () => {
    const result = seg.music('qq', '12345')
    expect(result.type).toBe('music')
    expect(result.data.type).toBe('qq')
  })

  it('seg.markdown 创建 Markdown 段', () => {
    const result = seg.markdown('**bold**')
    expect(result.type).toBe('markdown')
  })

  it('seg.location 创建位置段', () => {
    const result = seg.location(31.0, 121.0, { title: 'Shanghai' })
    expect(result.type).toBe('location')
    expect(result.data.title).toBe('Shanghai')
  })

  it('seg.mface 创建商城表情段', () => {
    const result = seg.mface({ emoji_id: 'abc', emoji_package_id: '1' })
    expect(result.type).toBe('mface')
    expect(result.data.emoji_id).toBe('abc')
  })

  it('seg.file 创建文件消息段', () => {
    const result = seg.file('file.pdf', { name: 'doc.pdf' })
    expect(result.type).toBe('file')
    expect(result.data.file).toBe('file.pdf')
    expect(result.data.name).toBe('doc.pdf')
  })

  it('seg.customMusic 创建自定义音乐段', () => {
    const result = seg.customMusic(
      'https://music.example.com',
      'https://audio.example.com',
      'Song Title',
      'Singer',
      'https://img.example.com',
    )
    expect(result.type).toBe('music')
    expect(result.data.type).toBe('custom')
    expect(result.data.url).toBe('https://music.example.com')
    expect(result.data.content).toBe('https://audio.example.com')
    expect(result.data.title).toBe('Song Title')
    expect(result.data.singer).toBe('Singer')
  })

  it('seg.contact 创建联系人名片段', () => {
    const result = seg.contact('qq', '123456')
    expect(result.type).toBe('contact')
    expect(result.data.type).toBe('qq')
    expect(result.data.id).toBe('123456')
  })

  it('seg.share 创建链接分享段', () => {
    const result = seg.share('https://example.com', 'Example', {
      content: 'Description',
      image: 'https://img.example.com',
    })
    expect(result.type).toBe('share')
    expect(result.data.url).toBe('https://example.com')
    expect(result.data.title).toBe('Example')
    expect(result.data.content).toBe('Description')
    expect(result.data.image).toBe('https://img.example.com')
  })
})

describe('seg 工厂函数 极端边界', () => {
  it('seg.at(0) 返回 { qq: "0" }', () => {
    expect(seg.at(0)).toEqual({ type: 'at', data: { qq: '0' } })
  })

  it('seg.at(NaN) 返回 { qq: "NaN" }', () => {
    expect(seg.at(NaN)).toEqual({ type: 'at', data: { qq: 'NaN' } })
  })

  it('seg.at(Infinity) 返回 { qq: "Infinity" }', () => {
    expect(seg.at(Infinity)).toEqual({ type: 'at', data: { qq: 'Infinity' } })
  })

  it('seg.at(-Infinity) 返回 { qq: "-Infinity" }', () => {
    expect(seg.at(-Infinity)).toEqual({ type: 'at', data: { qq: '-Infinity' } })
  })

  it('seg.at(-1) 返回 { qq: "-1" }', () => {
    expect(seg.at(-1)).toEqual({ type: 'at', data: { qq: '-1' } })
  })

  it('seg.at(Number.MAX_SAFE_INTEGER) 字符串化', () => {
    expect(seg.at(Number.MAX_SAFE_INTEGER)).toEqual({
      type: 'at',
      data: { qq: String(Number.MAX_SAFE_INTEGER) },
    })
  })

  it('seg.face(0) 零 id', () => {
    expect(seg.face(0)).toEqual({ type: 'face', data: { id: 0 } })
  })

  it('seg.face(-1) 负 id', () => {
    expect(seg.face(-1)).toEqual({ type: 'face', data: { id: -1 } })
  })

  it('seg.face(Number.MAX_SAFE_INTEGER) 极大 id', () => {
    expect(seg.face(Number.MAX_SAFE_INTEGER)).toEqual({
      type: 'face',
      data: { id: Number.MAX_SAFE_INTEGER },
    })
  })

  it('seg.text("") 空字符串', () => {
    expect(seg.text('')).toEqual({ type: 'text', data: { text: '' } })
  })

  it('seg.reply(0) 零 id', () => {
    expect(seg.reply(0)).toEqual({ type: 'reply', data: { id: 0 } })
  })

  it('seg.forward("") 空字符串 id', () => {
    expect(seg.forward('')).toEqual({ type: 'forward', data: { id: '' } })
  })

  it('seg.dice() data 为空对象', () => {
    expect(seg.dice()).toEqual({ type: 'dice', data: {} })
  })

  it('seg.rps() data 为空对象', () => {
    expect(seg.rps()).toEqual({ type: 'rps', data: {} })
  })

  it('seg.json("") 空字符串', () => {
    expect(seg.json('')).toEqual({ type: 'json', data: { data: '' } })
  })

  it('seg.markdown("") 空字符串', () => {
    expect(seg.markdown('')).toEqual({ type: 'markdown', data: { content: '' } })
  })

  it('seg.node 负 userId', () => {
    const result = seg.node([], -1)
    expect(result.data.userId).toBe(-1)
  })

  it('seg.node userId 为 0', () => {
    const result = seg.node([], 0)
    expect(result.data.userId).toBe(0)
  })

  it('seg.location 不传 opts 时 data 仅含 lat/lon', () => {
    const result = seg.location(31, 121)
    expect(result).toEqual({ type: 'location', data: { lat: 31, lon: 121 } })
  })

  it('seg.location 负经纬度', () => {
    const result = seg.location(-31.5, -121.3)
    expect(result).toEqual({ type: 'location', data: { lat: -31.5, lon: -121.3 } })
  })

  it('seg.share 不传 opts', () => {
    const result = seg.share('https://a', 'T')
    expect(result.data.url).toBe('https://a')
    expect(result.data.title).toBe('T')
    expect(result.data.content).toBeUndefined()
  })

  it('seg.customMusic 仅传必选参数', () => {
    const result = seg.customMusic('u', 'a', 't')
    expect(result.data.type).toBe('custom')
    expect(result.data.url).toBe('u')
    expect(result.data.content).toBe('a')
    expect(result.data.title).toBe('t')
    expect(result.data.singer).toBeUndefined()
    expect(result.data.image).toBeUndefined()
  })

  it('seg.contact("group", "456")', () => {
    expect(seg.contact('group', '456')).toEqual({
      type: 'contact',
      data: { type: 'group', id: '456' },
    })
  })

  it('seg.poke 空字符串参数', () => {
    expect(seg.poke('', '')).toEqual({ type: 'poke', data: { type: '', id: '' } })
  })

  it('seg.image 不带 opts', () => {
    const result = seg.image('file.jpg')
    expect(result).toEqual({ type: 'image', data: { file: 'file.jpg' } })
  })

  it('seg.file 不带 opts', () => {
    const result = seg.file('doc.pdf')
    expect(result).toEqual({ type: 'file', data: { file: 'doc.pdf' } })
  })

  it('seg.record 不带 opts', () => {
    const result = seg.record('audio.silk')
    expect(result).toEqual({ type: 'record', data: { file: 'audio.silk' } })
  })

  it('seg.video 不带 opts', () => {
    const result = seg.video('video.mp4')
    expect(result).toEqual({ type: 'video', data: { file: 'video.mp4' } })
  })
})

describe('提取纯文本', () => {
  it('从段中提取纯文本', () => {
    const segs = [seg.text('hello '), seg.at(123), seg.text('world')]
    expect(extractPlaintext(segs)).toBe('hello  world')
  })

  it('无文本段时返回空字符串', () => {
    const segs = [seg.at(123), seg.face(1)]
    expect(extractPlaintext(segs)).toBe('')
  })

  it('去除首尾空白', () => {
    const segs = [seg.text('  hello  ')]
    expect(extractPlaintext(segs)).toBe('hello')
  })
})

describe('提取纯文本 极端边界', () => {
  it('空数组返回空字符串', () => {
    expect(extractPlaintext([])).toBe('')
  })

  it('仅有空字符串 text 段返回空字符串', () => {
    expect(extractPlaintext([seg.text('')])).toBe('')
  })

  it('多段混合仅非 text 段之间插入空格', () => {
    const segs = [seg.text('a'), seg.face(1), seg.at(2), seg.text('b')]
    expect(extractPlaintext(segs)).toBe('a  b')
  })

  it('连续非 text 段产生连续空格', () => {
    const segs = [seg.text('a'), seg.at(1), seg.face(2), seg.at(3), seg.text('b')]
    expect(extractPlaintext(segs)).toBe('a   b')
  })

  it('全空字符串 text 返回空字符串', () => {
    expect(extractPlaintext([seg.text(''), seg.text('')])).toBe('')
  })

  it('仅含 Unicode 空白字符（NBSP 在 ES2019+ 被 trim 移除）', () => {
    expect(extractPlaintext([seg.text('\u00A0')])).toBe('')
  })

  it('多 text 段空格分隔提取后 trim', () => {
    const segs = [seg.text('  first  '), seg.text('  second  ')]
    expect(extractPlaintext(segs)).toBe('first    second')
  })
})

describe('类型级测试 (expectTypeOf)', () => {
  it('seg() 返回 MessageBuilder', () => {
    expectTypeOf(seg()).toEqualTypeOf<MessageBuilder>()
  })

  it('seg(value) builder.value() 返回 MessageSegment[]', () => {
    expectTypeOf(seg().value()).toEqualTypeOf<MessageSegment[]>()
  })

  it('seg(value) builder.stringify() 返回 string', () => {
    expectTypeOf(seg().stringify()).toEqualTypeOf<string>()
  })

  it('seg.text 返回 TextSegment', () => {
    expectTypeOf(seg.text).returns.toEqualTypeOf<TextSegment>()
  })

  it('seg.at 参数类型为 number | "all"', () => {
    expectTypeOf(seg.at).parameter(0).toEqualTypeOf<number | 'all'>()
  })

  it('seg.at 返回 AtSegment', () => {
    expectTypeOf(seg.at).returns.toEqualTypeOf<AtSegment>()
  })

  it('seg.node 参数 content 类型为 MessageSegment[]', () => {
    expectTypeOf(seg.node).parameter(0).toEqualTypeOf<MessageSegment[]>()
  })

  it('seg.node.data.userId 类型为 number | null | undefined', () => {
    expectTypeOf(seg.node([]).data.userId).toEqualTypeOf<number | null | undefined>()
  })

  it('extractPlaintext 返回 string', () => {
    expectTypeOf(extractPlaintext).returns.toEqualTypeOf<string>()
  })
})
