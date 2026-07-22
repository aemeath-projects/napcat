import { describe, it, expect, expectTypeOf } from 'vitest'

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
} from '../../../src/types'
import { seg, cq } from '../../../src/utils'
import { createBuilder } from '../../../src/utils/builder.js'
import type { MessageBuilder } from '../../../src/utils/builder.js'

describe('cq 静态工厂', () => {
  it('cq.text 创建文本段', () => {
    expect(cq.text('hello')).toEqual({ type: 'text', data: { text: 'hello' } })
  })

  it('cq.at 创建 AtSegment', () => {
    expect(cq.at(123)).toEqual({ type: 'at', data: { qq: '123' } })
    expect(cq.at('all')).toEqual({ type: 'at', data: { qq: 'all' } })
  })

  it('cq.face 创建表情段', () => {
    expect(cq.face(178)).toEqual({ type: 'face', data: { id: 178 } })
  })

  it('cq.image 创建图片段', () => {
    expect(cq.image('file.jpg').type).toBe('image')
  })

  it('cq.record 创建语音段', () => {
    expect(cq.record('audio.silk').type).toBe('record')
  })

  it('cq.video 创建视频段', () => {
    expect(cq.video('video.mp4').type).toBe('video')
  })

  it('cq.reply 创建回复段', () => {
    expect(cq.reply(1).type).toBe('reply')
  })

  it('cq.forward 创建转发段', () => {
    expect(cq.forward('abc').type).toBe('forward')
  })

  it('cq.mface 创建商城表情段', () => {
    expect(cq.mface({ emoji_id: '1' }).type).toBe('mface')
  })

  it('cq.dice 创建骰子段', () => {
    expect(cq.dice().type).toBe('dice')
  })

  it('cq.rps 创建猜拳段', () => {
    expect(cq.rps().type).toBe('rps')
  })

  it('cq.poke 创建戳一戳段', () => {
    expect(cq.poke('1', '2').type).toBe('poke')
  })

  it('cq.file 创建文件段', () => {
    expect(cq.file('doc.pdf').type).toBe('file')
  })

  it('cq.json 创建 JSON 段', () => {
    expect(cq.json('{"a":1}').type).toBe('json')
  })

  it('cq.music 创建音乐段', () => {
    expect(cq.music('qq', '123').type).toBe('music')
  })

  it('cq.customMusic 创建自定义音乐段', () => {
    expect(cq.customMusic('url', 'audio', 'title').type).toBe('music')
  })

  it('cq.node 创建节点段', () => {
    expect(cq.node([]).type).toBe('node')
  })

  it('cq.contact 创建联系人段', () => {
    expect(cq.contact('qq', '123').type).toBe('contact')
  })

  it('cq.markdown 创建 Markdown 段', () => {
    expect(cq.markdown('**b**').type).toBe('markdown')
  })

  it('cq.share 创建分享段', () => {
    expect(cq.share('url', 'title').type).toBe('share')
  })

  it('cq.location 创建位置段', () => {
    expect(cq.location(31, 121).type).toBe('location')
  })
})

describe('cq 链式构建器', () => {
  it('cq() 无初始数组返回空 value()', () => {
    expect(cq().value()).toEqual([])
  })

  it('cq([initial]) 传入初始数组', () => {
    const result = cq([cq.at(123)]).value()
    expect(result).toEqual([{ type: 'at', data: { qq: '123' } }])
  })

  it('链式追加 .text().at().value() 正确输出', () => {
    const result = cq().text('hi ').at(999).text('!').value()
    expect(result).toEqual([
      { type: 'text', data: { text: 'hi ' } },
      { type: 'at', data: { qq: '999' } },
      { type: 'text', data: { text: '!' } },
    ])
  })

  it('stringify() 正确输出 CQ 码', () => {
    const result = cq().at(123456).text(' hello!').stringify()
    expect(result).toBe('[CQ:at,qq=123456]\u0020hello!')
  })
})

describe('cq 链式构建器 极端边界', () => {
  it('cq().at("all") 链式调用正确', () => {
    const result = cq().at('all').value()
    expect(result).toEqual([{ type: 'at', data: { qq: 'all' } }])
  })

  it('cq().at(0) 正确处理零值', () => {
    const result = cq().at(0).value()
    expect(result).toEqual([{ type: 'at', data: { qq: '0' } }])
  })

  it('cq().at(Number.MAX_SAFE_INTEGER) 处理极大数字', () => {
    const result = cq().at(Number.MAX_SAFE_INTEGER).value()
    expect(result).toEqual([{ type: 'at', data: { qq: String(Number.MAX_SAFE_INTEGER) } }])
  })

  it('cq().at(NaN) NaN 转为字符串 "NaN"', () => {
    const result = cq().at(NaN).value()
    expect(result).toEqual([{ type: 'at', data: { qq: 'NaN' } }])
  })

  it('cq().face(-1) 负 id', () => {
    const result = cq().face(-1).value()
    expect(result).toEqual([{ type: 'face', data: { id: -1 } }])
  })

  it('cq().face(0) 零 id', () => {
    const result = cq().face(0).value()
    expect(result).toEqual([{ type: 'face', data: { id: 0 } }])
  })

  it('cq().reply(0) 零 id', () => {
    const result = cq().reply(0).value()
    expect(result).toEqual([{ type: 'reply', data: { id: 0 } }])
  })

  it('cq().text("") 空字符串 text 段', () => {
    const result = cq().text('').value()
    expect(result).toEqual([{ type: 'text', data: { text: '' } }])
  })

  it('cq().text("😀🎉中文\\n换行") Unicode 与转义字符', () => {
    const result = cq().text('😀🎉中文\n换行').value()
    expect(result).toEqual([{ type: 'text', data: { text: '😀🎉中文\n换行' } }])
  })

  it('cq().text 传入极长字符串不抛错', () => {
    const long = 'a'.repeat(10000)
    const result = cq().text(long).value()
    expect(result[0].data.text).toBe(long)
  })

  it('cq() 全 22 种工厂方法链式调用不抛错', () => {
    const nodes: MessageSegment[] = [cq.text('inner')]
    const result = cq()
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
    expect(result[0].type).toBe('text')
    expect(result.at(-1)!.type).toBe('text')
  })

  it('value() 多次调用返回独立副本不互相影响', () => {
    const builder = cq().text('hello')
    const a = builder.value()
    const b = builder.value()
    a.push(cq.face(1))
    b.push(cq.at(999))
    expect(builder.value()).toEqual([{ type: 'text', data: { text: 'hello' } }])
    expect(a).toEqual([
      { type: 'text', data: { text: 'hello' } },
      { type: 'face', data: { id: 1 } },
    ])
    expect(b).toEqual([
      { type: 'text', data: { text: 'hello' } },
      { type: 'at', data: { qq: '999' } },
    ])
  })

  it('cq() 与 seg() 返回独立构建器不共享内部数组', () => {
    const b1 = cq().text('a')
    const b2 = seg().text('b')
    expect(b1.value()).toEqual([{ type: 'text', data: { text: 'a' } }])
    expect(b2.value()).toEqual([{ type: 'text', data: { text: 'b' } }])
  })

  it('cq(initial) initial 被外部修改不影响构建器状态', () => {
    const initial: MessageSegment[] = [cq.text('x')]
    const builder = cq(initial)
    initial.push(cq.text('y'))
    expect(builder.value()).toEqual([{ type: 'text', data: { text: 'x' } }])
  })

  it('createBuilder 不给 stringifyFn 时 stringify() 抛出', () => {
    const builder = createBuilder()
    expect(() => builder.stringify()).toThrow('stringify not available')
  })

  it('cq().location 负经纬度', () => {
    const result = cq().location(-31, -121).value()
    expect(result).toEqual([{ type: 'location', data: { lat: -31, lon: -121 } }])
  })

  it('cq().location NaN 经纬度', () => {
    const result = cq().location(NaN, NaN).value()
    expect(result).toEqual([{ type: 'location', data: { lat: NaN, lon: NaN } }])
  })

  it('cq().location Infinity 经纬度', () => {
    const result = cq().location(Infinity, -Infinity).value()
    expect(result).toEqual([{ type: 'location', data: { lat: Infinity, lon: -Infinity } }])
  })

  it('cq().node 嵌套三层消息段', () => {
    const inner = cq().text('inner').value()
    const mid = cq().node(inner).value()
    const outer = cq().node(mid).value()
    expect(outer[0].type).toBe('node')
    expect((outer[0] as NodeSegment).data.content).toEqual(mid)
  })

  it('cq().image 全部可选参数', () => {
    const result = cq()
      .image('f', {
        name: 'n',
        summary: 's',
        subType: 1,
        fileId: 'fid',
        url: 'http://x',
        path: '/p',
        fileSize: 1024,
        fileUnique: 'u',
      })
      .value()
    expect(result[0].data.file).toBe('f')
    expect(result[0].data.fileSize).toBe(1024)
  })

  it('cq().share 全可选参数', () => {
    const result = cq().share('https://a', 'T', { content: 'C', image: 'https://i' }).value()
    expect((result[0] as ShareSegment).data.url).toBe('https://a')
    expect((result[0] as ShareSegment).data.content).toBe('C')
  })

  it('cq().customMusic 全参数', () => {
    const result = cq().customMusic('u', 'a', 't', 's', 'i').value()
    expect((result[0] as MusicSegment).data.type).toBe('custom')
    expect((result[0] as MusicSegment).data.singer).toBe('s')
  })

  it('cq().node 不传可选参数返回 null userId 和 nickname', () => {
    const result = cq().node([]).value()
    expect((result[0] as NodeSegment).data.userId).toBeNull()
    expect((result[0] as NodeSegment).data.nickname).toBeNull()
  })
})

describe('cq.parse CQ 码解析', () => {
  it('解析单个 CQ 码', () => {
    const result = cq.parse('[CQ:face,id=178]')
    expect(result).toEqual([{ type: 'face', data: { id: 178 } }])
  })

  it('解析多个 CQ 码混合文本', () => {
    const result = cq.parse('[CQ:at,qq=123456] 你好！[CQ:face,id=178]')
    expect(result).toEqual([
      { type: 'at', data: { qq: '123456' } },
      { type: 'text', data: { text: ' 你好！' } },
      { type: 'face', data: { id: 178 } },
    ])
  })

  it('解析空字符串返回空数组', () => {
    expect(cq.parse('')).toEqual([])
  })

  it('纯文本字符串解析为 text 段', () => {
    const result = cq.parse('hello world')
    expect(result).toEqual([{ type: 'text', data: { text: 'hello world' } }])
  })

  it('解析未知类型返回 UnknownSegment', () => {
    const result = cq.parse('[CQ:custom_type,key=value]')
    expect(result[0].type).toBe('custom_type')
    expect(result[0].data).toEqual({ key: 'value' })
  })

  it('转义字符还原：&amp; → &', () => {
    const result = cq.parse('a &amp; b')
    expect(result).toEqual([{ type: 'text', data: { text: 'a & b' } }])
  })

  it('转义字符还原：&#91; → [', () => {
    const result = cq.parse('text&#91;inside&#93;end')
    expect(result).toEqual([{ type: 'text', data: { text: 'text[inside]end' } }])
  })

  it('CQ 码键值中有特殊字符（&#44; 还原为 ,）', () => {
    const result = cq.parse('[CQ:image,file=hello&#44;world,summary=test]')
    expect(result).toEqual([{ type: 'image', data: { file: 'hello,world', summary: 'test' } }])
  })

  it('id 字段自动转为 number', () => {
    const result = cq.parse('[CQ:reply,id=42]')
    expect(result).toEqual([{ type: 'reply', data: { id: 42 } }])
  })

  it('location 的 lat/lon 转为 number', () => {
    const result = cq.parse('[CQ:location,lat=31.5,lon=121.3,title=sh]')
    expect(result).toEqual([{ type: 'location', data: { lat: 31.5, lon: 121.3, title: 'sh' } }])
  })

  it('node 的 user_id 解析后映射为 userId 并转为 number', () => {
    const result = cq.parse('[CQ:node,user_id=123456]')
    expect(result).toEqual([{ type: 'node', data: { userId: 123456 } }])
  })

  it('qq 保持字符串不变', () => {
    const result = cq.parse('[CQ:at,qq=123456]')
    expect(result).toEqual([{ type: 'at', data: { qq: '123456' } }])
  })

  it('qq=all 保持字符串 all', () => {
    const result = cq.parse('[CQ:at,qq=all]')
    expect(result).toEqual([{ type: 'at', data: { qq: 'all' } }])
  })

  it('无参数的 CQ 码', () => {
    const result = cq.parse('[CQ:dice]')
    expect(result).toEqual([{ type: 'dice', data: {} }])
  })
})

describe('cq.parse 极端边界', () => {
  it('仅空白字符（空格、制表符、换行）返回 text 段', () => {
    expect(cq.parse(' ')).toEqual([{ type: 'text', data: { text: ' ' } }])
    expect(cq.parse('\t')).toEqual([{ type: 'text', data: { text: '\t' } }])
    expect(cq.parse('\n')).toEqual([{ type: 'text', data: { text: '\n' } }])
  })

  it('仅 &amp; 的文本', () => {
    const result = cq.parse('&amp;')
    expect(result).toEqual([{ type: 'text', data: { text: '&' } }])
  })

  it('连续多个 CQ 码无文本分隔', () => {
    const result = cq.parse('[CQ:face,id=1][CQ:at,qq=2][CQ:dice]')
    expect(result).toEqual([
      { type: 'face', data: { id: 1 } },
      { type: 'at', data: { qq: '2' } },
      { type: 'dice', data: {} },
    ])
  })

  it('CQ 码前后有文本', () => {
    const result = cq.parse('前缀[CQ:face,id=1]后缀')
    expect(result).toEqual([
      { type: 'text', data: { text: '前缀' } },
      { type: 'face', data: { id: 1 } },
      { type: 'text', data: { text: '后缀' } },
    ])
  })

  it('后半部分无 CQ 码的尾随文本', () => {
    const result = cq.parse('[CQ:at,qq=1]trailing text')
    expect(result).toEqual([
      { type: 'at', data: { qq: '1' } },
      { type: 'text', data: { text: 'trailing text' } },
    ])
  })

  it('CQ 码类型名含连字符', () => {
    const result = cq.parse('[CQ:custom-type,key=value]')
    expect(result[0].type).toBe('custom-type')
    expect(result[0].data).toEqual({ key: 'value' })
  })

  it('CQ 码参数中缺等号（仅 key 无值）的项被忽略', () => {
    const result = cq.parse('[CQ:custom,k1=v1,orphan,k2=v2]')
    expect(result[0].data).toEqual({ k1: 'v1', k2: 'v2' })
  })

  it('CQ 码参数仅逗号无键值对', () => {
    const result = cq.parse('[CQ:custom,,]')
    expect(result[0].data).toEqual({})
  })

  it('CQ 码参数首尾有逗号', () => {
    const result = cq.parse('[CQ:custom,,k=v,]')
    expect(result[0].data).toEqual({ k: 'v' })
  })

  it('id 字段有前导零保持字符串', () => {
    const result = cq.parse('[CQ:reply,id=0042]')
    expect(result).toEqual([{ type: 'reply', data: { id: '0042' } }])
  })

  it('id 字段含字母保持字符串', () => {
    const result = cq.parse('[CQ:reply,id=abc42]')
    expect(result).toEqual([{ type: 'reply', data: { id: 'abc42' } }])
  })

  it('lat/lon 是整数时转为数字', () => {
    const result = cq.parse('[CQ:location,lat=31,lon=121]')
    expect(result).toEqual([{ type: 'location', data: { lat: 31, lon: 121 } }])
  })

  it('user_id 是数字字符串时解析后映射为 userId 并转为 number', () => {
    const result = cq.parse('[CQ:node,user_id=0]')
    expect(result).toEqual([{ type: 'node', data: { userId: 0 } }])
  })

  it('dice 的 result 字段转为 number', () => {
    const result = cq.parse('[CQ:dice,result=6]')
    expect(result).toEqual([{ type: 'dice', data: { result: 6 } }])
  })

  it('rps 的 result 字段转为 number', () => {
    const result = cq.parse('[CQ:rps,result=2]')
    expect(result).toEqual([{ type: 'rps', data: { result: 2 } }])
  })

  it('CQ 码值中的 Unicode 保持不变', () => {
    const result = cq.parse('[CQ:image,file=😀.jpg,summary=中文字]')
    expect(result[0].data).toEqual({ file: '😀.jpg', summary: '中文字' })
  })

  it('文本中的 Unicode 保持不变', () => {
    const result = cq.parse('😀你好世界')
    expect(result).toEqual([{ type: 'text', data: { text: '😀你好世界' } }])
  })

  it('多次转义 &amp;amp; 还原为 &amp;（单层还原）', () => {
    const result = cq.parse('a &amp;amp; b')
    expect(result).toEqual([{ type: 'text', data: { text: 'a &amp; b' } }])
  })

  it('值中混合转义字符', () => {
    const result = cq.parse('[CQ:custom,k=&#91;hello&#44;world&#93;&amp;end]')
    expect(result[0].data).toEqual({ k: '[hello,world]&end' })
  })

  it('极长 CQ 码字符串不抛错', () => {
    const long = `[CQ:at,qq=1]${'x'.repeat(50000)}[CQ:face,id=2]`
    const result = cq.parse(long)
    expect(result.length).toBe(3)
    expect(result[0].type).toBe('at')
    expect(result[1].type).toBe('text')
    expect((result[1] as TextSegment).data.text.length).toBe(50000)
    expect(result[2].type).toBe('face')
  })

  it('CQ 码内重复 key 后者覆盖前者', () => {
    const result = cq.parse('[CQ:custom,k=first,k=second]')
    expect(result[0].data).toEqual({ k: 'second' })
  })

  it('CQ 码空类型名不匹配 CQ 模板，解析为纯文本', () => {
    const result = cq.parse('[CQ:,k=v]')
    expect(result).toEqual([{ type: 'text', data: { text: '[CQ:,k=v]' } }])
  })

  it('CQ 码值含转义逗号后跟真实逗号', () => {
    const result = cq.parse('[CQ:image,file=a&#44;b,summary=s]')
    expect(result[0].data).toEqual({ file: 'a,b', summary: 's' })
  })
})

describe('cq.stringify CQ 码序列化', () => {
  it('纯文本转义 & [ ]', () => {
    const segs = [cq.text('a&b[c]d')]
    expect(cq.stringify(segs)).toBe('a&amp;b&#91;c&#93;d')
  })

  it('多段组合正确序列化', () => {
    const segs = [cq.at(123456), cq.text(' hello!'), cq.face(178)]
    expect(cq.stringify(segs)).toBe('[CQ:at,qq=123456]\u0020hello![CQ:face,id=178]')
  })

  it('null 值跳过', () => {
    const segs = [{ type: 'record', data: { file: 'audio.silk', url: null } } as any]
    const result = cq.stringify(segs)
    expect(result).toBe('[CQ:record,file=audio.silk]')
  })

  it('undefined 值跳过', () => {
    const segs = [{ type: 'record', data: { file: 'audio.silk', url: undefined } } as any]
    const result = cq.stringify(segs)
    expect(result).toBe('[CQ:record,file=audio.silk]')
  })

  it('UnknownSegment 直接使用 type 字段', () => {
    const segs = [{ type: 'custom_type', data: { key: 'val' } }]
    expect(cq.stringify(segs)).toBe('[CQ:custom_type,key=val]')
  })

  it('dice 无参数 CQ 码', () => {
    const segs = [cq.dice()]
    expect(cq.stringify(segs)).toBe('[CQ:dice]')
  })

  it('值中的逗号转义为 &#44;', () => {
    const segs = [{ type: 'image', data: { file: 'a,b.jpg' } }]
    expect(cq.stringify(segs)).toBe('[CQ:image,file=a&#44;b.jpg]')
  })

  it('嵌套对象 JSON.stringify', () => {
    const segs = [{ type: 'json', data: { data: { key: 'val' } } }]
    expect(cq.stringify(segs)).toBe('[CQ:json,data={"key":"val"}]')
  })

  it('嵌套对象 JSON.stringify 含逗号时正确转义', () => {
    const segs = [{ type: 'json', data: { data: { a: 'x,y' } } }]
    expect(cq.stringify(segs)).toBe('[CQ:json,data={"a":"x&#44;y"}]')
  })

  it('node 的 content 字段跳过不序列化', () => {
    const segs = [cq.node([cq.text('inner')])]
    const result = cq.stringify(segs)
    expect(result).not.toContain('content')
  })

  it('空数组返回空字符串', () => {
    expect(cq.stringify([])).toBe('')
  })
})

describe('cq.stringify 极端边界', () => {
  it('boolean true → "true"', () => {
    const segs = [{ type: 'custom', data: { flag: true } }]
    expect(cq.stringify(segs)).toBe('[CQ:custom,flag=true]')
  })

  it('boolean false → "false"', () => {
    const segs = [{ type: 'custom', data: { flag: false } }]
    expect(cq.stringify(segs)).toBe('[CQ:custom,flag=false]')
  })

  it('BigInt → 字符串', () => {
    const segs = [{ type: 'custom', data: { big: BigInt(9007199254740991) } }]
    expect(cq.stringify(segs)).toBe('[CQ:custom,big=9007199254740991]')
  })

  it('number 0 → "0"', () => {
    const segs = [{ type: 'custom', data: { zero: 0 } }]
    expect(cq.stringify(segs)).toBe('[CQ:custom,zero=0]')
  })

  it('number 负数 → 字符串', () => {
    const segs = [{ type: 'custom', data: { neg: -42 } }]
    expect(cq.stringify(segs)).toBe('[CQ:custom,neg=-42]')
  })

  it('number Infinity → "Infinity"', () => {
    const segs = [{ type: 'custom', data: { inf: Infinity } }]
    expect(cq.stringify(segs)).toBe('[CQ:custom,inf=Infinity]')
  })

  it('number NaN → "NaN"', () => {
    const segs = [{ type: 'custom', data: { nan: NaN } }]
    expect(cq.stringify(segs)).toBe('[CQ:custom,nan=NaN]')
  })

  it('空字符串值保留（不被过滤）', () => {
    const segs = [{ type: 'custom', data: { empty: '' } }]
    expect(cq.stringify(segs)).toBe('[CQ:custom,empty=]')
  })

  it('全类型 segment 序列化均不抛错', () => {
    const segs: MessageSegment[] = [
      cq.text('t'),
      cq.face(1),
      cq.image('f.jpg'),
      cq.record('a.silk'),
      cq.video('v.mp4'),
      cq.at(123),
      cq.reply(1),
      cq.forward('fwd'),
      cq.mface({ emoji_id: '1' }),
      cq.dice(),
      cq.rps(),
      cq.poke('1', '2'),
      cq.file('f.pdf'),
      cq.json('{}'),
      cq.music('qq', '1'),
      cq.customMusic('u', 'a', 't'),
      cq.contact('qq', '1'),
      cq.markdown('**b**'),
      cq.share('u', 't'),
      cq.location(31, 121),
    ]
    const result = cq.stringify(segs)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('Unicode 文本不转义', () => {
    const segs = [cq.text('😀中文')]
    expect(cq.stringify(segs)).toBe('😀中文')
  })

  it('逗号转义在 JSON 嵌套值中正确', () => {
    const segs = [{ type: 'json', data: { data: { items: ['a,b', 'c,d'] } } }]
    const result = cq.stringify(segs)
    expect(result).toContain('&#44;')
    const parsed = cq.parse(result)
    expect(parsed[0].type).toBe('json')
  })

  it('node 段 user_id 序列化（content 跳过）', () => {
    const segs = [cq.node([cq.text('inner')], 123, 'bot')]
    const result = cq.stringify(segs)
    expect(result).toContain('user_id=123')
    expect(result).toContain('nickname=bot')
    expect(result).not.toContain('content')
  })

  it('空字符串 text 不产生输出', () => {
    const segs = [cq.text('')]
    expect(cq.stringify(segs)).toBe('')
  })

  it('空字符串 text 在构建器 stringify 中也返回空', () => {
    expect(cq().text('').stringify()).toBe('')
  })

  it('text 段仅含需要转义的字符', () => {
    const segs = [cq.text('&[]')]
    expect(cq.stringify(segs)).toBe('&amp;&#91;&#93;')
  })
})

describe('互操作性', () => {
  it('seg() 构建后用 cq.stringify() 序列化', () => {
    const builder = seg().at(123456).text(' hello!')
    const segs = builder.value()
    expect(cq.stringify(segs)).toBe('[CQ:at,qq=123456]\u0020hello!')
  })

  it('cq.parse() 后用 seg() 确认', () => {
    const parsed = cq.parse('[CQ:face,id=178]')
    const rebuilt = seg(parsed).value()
    expect(rebuilt).toEqual([{ type: 'face', data: { id: 178 } }])
  })

  it('round-trip: stringify → parse → stringify 保持稳定', () => {
    const segments = [cq.at(123), cq.text(' hi '), cq.face(1)]
    const str1 = cq.stringify(segments)
    const parsed = cq.parse(str1)
    const str2 = cq.stringify(parsed)
    expect(str2).toBe(str1)
  })

  it('cq.parse() 解析出的数组可直接传入 cq() 构建器', () => {
    const cqString = '[CQ:at,qq=999][CQ:face,id=178]'
    const parsed = cq.parse(cqString)
    const rebuilt = cq(parsed).value()
    expect(rebuilt).toEqual(parsed)
  })
})

describe('互操作性 极端边界', () => {
  it('全类型 round-trip: 构建 → stringify → parse → 验证一致性', () => {
    const source: MessageSegment[] = [
      seg.text('hello'),
      seg.face(178),
      seg.image('file.jpg', { name: 'test' }),
      seg.record('audio.silk'),
      seg.video('video.mp4'),
      seg.at(123456),
      seg.at('all'),
      seg.reply(42),
      seg.forward('fwd123'),
      seg.mface({ emoji_id: 'abc' }),
      seg.dice(),
      seg.rps(),
      seg.poke('1', '2'),
      seg.file('doc.pdf'),
      seg.json('{"a":1}'),
      seg.music('qq', '456'),
      seg.customMusic('url', 'audio', 'title', 'singer', 'img'),
      seg.contact('qq', '789'),
      seg.markdown('**b**'),
      seg.share('url', 'title'),
      seg.location(31, 121),
    ]
    const str = cq.stringify(source)
    const parsed = cq.parse(str)

    for (let i = 0; i < source.length; i++) {
      expect(parsed[i].type).toBe(source[i].type)
      expect(parsed[i].data).toEqual(source[i].data)
    }
  })

  it('含转义字符的文本 round-trip 稳定', () => {
    const segments = [cq.text('a&b[c]d,e')]
    const str1 = cq.stringify(segments)
    const parsed = cq.parse(str1)
    const str2 = cq.stringify(parsed)
    expect(parsed).toEqual([{ type: 'text', data: { text: 'a&b[c]d,e' } }])
    expect(str2).toBe(str1)
  })

  it('含混合 CQ 码和转义文本的 round-trip', () => {
    const segments: MessageSegment[] = [
      cq.text('start & end'),
      cq.at(123),
      cq.text(' mid[d,x] '),
      cq.face(1),
      cq.text(' tail,'),
    ]
    const str = cq.stringify(segments)
    const parsed = cq.parse(str)
    expect(parsed.length).toBe(5)
    expect(parsed).toEqual(segments)
  })

  it('解析空字符串后再 seq 构建正常', () => {
    const parsed = cq.parse('')
    const builder = seg(parsed)
    expect(builder.value()).toEqual([])
    builder.text('x')
    expect(builder.value()).toEqual([{ type: 'text', data: { text: 'x' } }])
  })
})

describe('类型级测试 (expectTypeOf)', () => {
  it('seg/cq 工厂方法返回正确 segment 类型', () => {
    expectTypeOf(seg.text).returns.toEqualTypeOf<TextSegment>()
    expectTypeOf(seg.face).returns.toEqualTypeOf<FaceSegment>()
    expectTypeOf(seg.image).returns.toEqualTypeOf<ImageSegment>()
    expectTypeOf(seg.record).returns.toEqualTypeOf<RecordSegment>()
    expectTypeOf(seg.video).returns.toEqualTypeOf<VideoSegment>()
    expectTypeOf(seg.at).returns.toEqualTypeOf<AtSegment>()
    expectTypeOf(seg.reply).returns.toEqualTypeOf<ReplySegment>()
    expectTypeOf(seg.forward).returns.toEqualTypeOf<ForwardSegment>()
    expectTypeOf(seg.mface).returns.toEqualTypeOf<MFaceSegment>()
    expectTypeOf(seg.dice).returns.toEqualTypeOf<DiceSegment>()
    expectTypeOf(seg.rps).returns.toEqualTypeOf<RpsSegment>()
    expectTypeOf(seg.poke).returns.toEqualTypeOf<PokeSegment>()
    expectTypeOf(seg.file).returns.toEqualTypeOf<FileSegment>()
    expectTypeOf(seg.json).returns.toEqualTypeOf<JsonSegment>()
    expectTypeOf(seg.music).returns.toEqualTypeOf<MusicSegment>()
    expectTypeOf(seg.customMusic).returns.toEqualTypeOf<MusicSegment>()
    expectTypeOf(seg.node).returns.toEqualTypeOf<NodeSegment>()
    expectTypeOf(seg.contact).returns.toEqualTypeOf<ContactSegment>()
    expectTypeOf(seg.markdown).returns.toEqualTypeOf<MarkdownSegment>()
    expectTypeOf(seg.share).returns.toEqualTypeOf<ShareSegment>()
    expectTypeOf(seg.location).returns.toEqualTypeOf<LocationSegment>()

    expectTypeOf(cq.text).returns.toEqualTypeOf<TextSegment>()
    expectTypeOf(cq.at).returns.toEqualTypeOf<AtSegment>()
    expectTypeOf(cq.node).returns.toEqualTypeOf<NodeSegment>()
  })

  it('seg() / cq() 返回 MessageBuilder', () => {
    expectTypeOf(seg()).toEqualTypeOf<MessageBuilder>()
    expectTypeOf(cq()).toEqualTypeOf<MessageBuilder>()
  })

  it('builder.value() 返回 MessageSegment[]', () => {
    expectTypeOf(seg().value()).toEqualTypeOf<MessageSegment[]>()
    expectTypeOf(cq().value()).toEqualTypeOf<MessageSegment[]>()
  })

  it('builder.stringify() 返回 string', () => {
    expectTypeOf(seg().stringify()).toEqualTypeOf<string>()
    expectTypeOf(cq().stringify()).toEqualTypeOf<string>()
  })

  it('cq.parse 返回 MessageSegment[]', () => {
    expectTypeOf(cq.parse).returns.toEqualTypeOf<MessageSegment[]>()
  })

  it('cq.stringify 入参 MessageSegment[]，返回 string', () => {
    expectTypeOf(cq.stringify).parameter(0).toEqualTypeOf<MessageSegment[]>()
    expectTypeOf(cq.stringify).returns.toEqualTypeOf<string>()
  })

  it('seg/cq 工厂方法参数类型正确', () => {
    expectTypeOf(seg.at).parameter(0).toEqualTypeOf<number | 'all'>()
    expectTypeOf(cq.at).parameter(0).toEqualTypeOf<number | 'all'>()
    expectTypeOf(seg.contact).parameter(0).toEqualTypeOf<'qq' | 'group'>()
    expectTypeOf(seg.node).parameter(0).toEqualTypeOf<MessageSegment[]>()
    expectTypeOf(seg.text).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(seg.face).parameter(0).toEqualTypeOf<number>()
  })

  it('NodeSegment.data.userId 类型为 number | null | undefined', () => {
    expectTypeOf(cq.node([]).data.userId).toEqualTypeOf<number | null | undefined>()
  })
})
