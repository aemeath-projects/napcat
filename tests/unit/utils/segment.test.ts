import { describe, it, expect } from 'vitest'

import { seg, extractPlaintext } from '../../../src/utils'

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
    expect(result.data.user_id).toBe(123)
    expect(result.data.nickname).toBe('user')
  })

  it('seg.node 不传可选参数时填充 null', () => {
    const result = seg.node([])
    expect(result.type).toBe('node')
    expect(result.data.user_id).toBeNull()
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
