import { describe, it, expect } from 'vitest'

import { Seg, extractPlaintext } from '../../../src/utils/segment.js'

describe('Seg factory', () => {
  it('Seg.text creates TextSegment', () => {
    expect(Seg.text('hello')).toEqual({ type: 'text', data: { text: 'hello' } })
  })

  it('Seg.at creates AtSegment with string qq from number', () => {
    expect(Seg.at(123)).toEqual({ type: 'at', data: { qq: '123' } })
  })

  it('Seg.at creates AtSegment with "all"', () => {
    expect(Seg.at('all')).toEqual({ type: 'at', data: { qq: 'all' } })
  })

  it('Seg.image creates ImageSegment', () => {
    const seg = Seg.image('http://example.com/a.png')
    expect(seg.type).toBe('image')
    expect(seg.data.file).toBe('http://example.com/a.png')
  })

  it('Seg.image accepts options', () => {
    const seg = Seg.image('file.png', { name: 'test.png' })
    expect(seg.data.name).toBe('test.png')
  })

  it('Seg.reply creates ReplySegment', () => {
    expect(Seg.reply(12345)).toEqual({ type: 'reply', data: { id: 12345 } })
  })

  it('Seg.face creates FaceSegment', () => {
    expect(Seg.face(1)).toEqual({ type: 'face', data: { id: 1 } })
  })

  it('Seg.record creates RecordSegment', () => {
    expect(Seg.record('audio.silk')).toEqual({ type: 'record', data: { file: 'audio.silk' } })
  })

  it('Seg.video creates VideoSegment', () => {
    expect(Seg.video('video.mp4')).toEqual({ type: 'video', data: { file: 'video.mp4' } })
  })

  it('Seg.json creates JsonSegment', () => {
    const seg = Seg.json('{"key":"val"}')
    expect(seg.type).toBe('json')
    expect(seg.data.data).toBe('{"key":"val"}')
  })
  it('Seg.forward creates ForwardSegment', () => {
    expect(Seg.forward('fwd123')).toEqual({ type: 'forward', data: { id: 'fwd123' } })
  })
  it('Seg.dice creates DiceSegment', () => {
    expect(Seg.dice().type).toBe('dice')
  })
  it('Seg.rps creates RpsSegment', () => {
    expect(Seg.rps().type).toBe('rps')
  })
  it('Seg.poke creates PokeSegment', () => {
    const seg = Seg.poke('1', '2')
    expect(seg.type).toBe('poke')
    expect(seg.data.type).toBe('1')
  })
  it('Seg.node creates NodeSegment', () => {
    const seg = Seg.node([], 123, 'user')
    expect(seg.type).toBe('node')
  })
  it('Seg.music creates MusicSegment', () => {
    const seg = Seg.music('qq', '12345')
    expect(seg.type).toBe('music')
    expect(seg.data.type).toBe('qq')
  })
  it('Seg.markdown creates MarkdownSegment', () => {
    const seg = Seg.markdown('**bold**')
    expect(seg.type).toBe('markdown')
  })
  it('Seg.location creates LocationSegment', () => {
    const seg = Seg.location(31.0, 121.0, { title: 'Shanghai' })
    expect(seg.type).toBe('location')
    expect(seg.data.title).toBe('Shanghai')
  })
})

describe('extractPlaintext', () => {
  it('extracts text from segments', () => {
    const segs = [Seg.text('hello '), Seg.at(123), Seg.text('world')]
    expect(extractPlaintext(segs)).toBe('hello  world')
  })

  it('returns empty string when no text segments', () => {
    const segs = [Seg.at(123), Seg.face(1)]
    expect(extractPlaintext(segs)).toBe('')
  })

  it('trims whitespace', () => {
    const segs = [Seg.text('  hello  ')]
    expect(extractPlaintext(segs)).toBe('hello')
  })
})
