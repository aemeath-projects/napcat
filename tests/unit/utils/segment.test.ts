import { describe, it, expect } from 'vitest'

import { Seg, extractPlaintext } from '../../../src/utils/segment.js'

describe('Seg 工厂函数', () => {
  it('Seg.text 创建文本段', () => {
    expect(Seg.text('hello')).toEqual({ type: 'text', data: { text: 'hello' } })
  })

  it('Seg.at 从数字创建包含字符串 qq 的 AtSegment', () => {
    expect(Seg.at(123)).toEqual({ type: 'at', data: { qq: '123' } })
  })

  it('Seg.at 创建包含 "all" 的 AtSegment', () => {
    expect(Seg.at('all')).toEqual({ type: 'at', data: { qq: 'all' } })
  })

  it('Seg.image 创建图片段', () => {
    const seg = Seg.image('http://example.com/a.png')
    expect(seg.type).toBe('image')
    expect(seg.data.file).toBe('http://example.com/a.png')
  })

  it('Seg.image 接受选项参数', () => {
    const seg = Seg.image('file.png', { name: 'test.png' })
    expect(seg.data.name).toBe('test.png')
  })

  it('Seg.reply 创建回复段', () => {
    expect(Seg.reply(12345)).toEqual({ type: 'reply', data: { id: 12345 } })
  })

  it('Seg.face 创建表情段', () => {
    expect(Seg.face(1)).toEqual({ type: 'face', data: { id: 1 } })
  })

  it('Seg.record 创建语音段', () => {
    expect(Seg.record('audio.silk')).toEqual({ type: 'record', data: { file: 'audio.silk' } })
  })

  it('Seg.video 创建视频段', () => {
    expect(Seg.video('video.mp4')).toEqual({ type: 'video', data: { file: 'video.mp4' } })
  })

  it('Seg.json 创建 JSON 段', () => {
    const seg = Seg.json('{"key":"val"}')
    expect(seg.type).toBe('json')
    expect(seg.data.data).toBe('{"key":"val"}')
  })
  it('Seg.forward 创建转发段', () => {
    expect(Seg.forward('fwd123')).toEqual({ type: 'forward', data: { id: 'fwd123' } })
  })
  it('Seg.dice 创建骰子段', () => {
    expect(Seg.dice().type).toBe('dice')
  })
  it('Seg.rps 创建猜拳段', () => {
    expect(Seg.rps().type).toBe('rps')
  })
  it('Seg.poke 创建戳一戳段', () => {
    const seg = Seg.poke('1', '2')
    expect(seg.type).toBe('poke')
    expect(seg.data.type).toBe('1')
  })
  it('Seg.node 创建节点段', () => {
    const seg = Seg.node([], 123, 'user')
    expect(seg.type).toBe('node')
  })
  it('Seg.music 创建音乐段', () => {
    const seg = Seg.music('qq', '12345')
    expect(seg.type).toBe('music')
    expect(seg.data.type).toBe('qq')
  })
  it('Seg.markdown 创建 Markdown 段', () => {
    const seg = Seg.markdown('**bold**')
    expect(seg.type).toBe('markdown')
  })
  it('Seg.location 创建位置段', () => {
    const seg = Seg.location(31.0, 121.0, { title: 'Shanghai' })
    expect(seg.type).toBe('location')
    expect(seg.data.title).toBe('Shanghai')
  })
})

describe('提取纯文本', () => {
  it('从段中提取纯文本', () => {
    const segs = [Seg.text('hello '), Seg.at(123), Seg.text('world')]
    expect(extractPlaintext(segs)).toBe('hello  world')
  })

  it('无文本段时返回空字符串', () => {
    const segs = [Seg.at(123), Seg.face(1)]
    expect(extractPlaintext(segs)).toBe('')
  })

  it('去除首尾空白', () => {
    const segs = [Seg.text('  hello  ')]
    expect(extractPlaintext(segs)).toBe('hello')
  })
})
