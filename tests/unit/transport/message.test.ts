import { describe, it, expect, vi } from 'vitest'

import { handleIncomingMessage } from '../../../src/transport/message.js'

describe('handleIncomingMessage 消息处理', () => {
  it('JSON 解析失败时静默返回，不触发 emit', () => {
    const pending = new Map()
    const emit = vi.fn()

    handleIncomingMessage('not valid json {{{', pending, emit)

    expect(emit).not.toHaveBeenCalled()
    expect(pending.size).toBe(0)
  })

  it('正常解析 API 响应（含 echo 无 post_type）', () => {
    const pending = new Map()
    const resolve = vi.fn()
    const reject = vi.fn()
    pending.set('echo-123', {
      resolve,
      reject,
      timer: undefined as unknown as ReturnType<typeof setTimeout>,
    })
    const emit = vi.fn()

    handleIncomingMessage(
      '{"echo":"echo-123","status":"ok","retcode":0,"data":null}',
      pending,
      emit,
    )

    expect(resolve).toHaveBeenCalled()
    expect(emit).not.toHaveBeenCalled()
  })

  it('正常解析事件推送（含 post_type）', () => {
    const pending = new Map()
    const emit = vi.fn()

    handleIncomingMessage(
      '{"post_type":"meta_event","meta_event_type":"heartbeat","time":1,"self_id":0}',
      pending,
      emit,
    )

    expect(emit).toHaveBeenCalledWith('event', expect.objectContaining({ post_type: 'meta_event' }))
  })

  it('echo 存在但 pending 中无对应条目时静默返回（过时响应）', () => {
    const pending = new Map()
    const emit = vi.fn()

    // echo 匹配不到任何 pending 条目
    handleIncomingMessage(
      '{"echo":"stale-echo","status":"ok","retcode":0,"data":null}',
      pending,
      emit,
    )

    expect(emit).not.toHaveBeenCalled()
    expect(pending.size).toBe(0)
  })
})
