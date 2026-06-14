import { describe, it, expect, vi } from 'vitest'

import { TypedEventEmitter } from '../../../src/core'

interface TestEvents {
  data: (value: string) => void
  error: (err: Error) => void
  count: (n: number) => void
}

describe('TypedEventEmitter 类型化事件发射器', () => {
  it('on/emit 对类型化事件正常工作', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const listener = vi.fn()
    emitter.on('data', listener)
    emitter.emit('data', 'hello')
    expect(listener).toHaveBeenCalledWith('hello')
  })

  it('once 只触发一次', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const listener = vi.fn()
    emitter.once('count', listener)
    emitter.emit('count', 1)
    emitter.emit('count', 2)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(1)
  })

  it('off 移除监听器', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const listener = vi.fn()
    emitter.on('data', listener)
    emitter.off('data', listener)
    emitter.emit('data', 'test')
    expect(listener).not.toHaveBeenCalled()
  })

  it('removeAllListeners 清除所有监听器', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const l1 = vi.fn()
    const l2 = vi.fn()
    emitter.on('data', l1)
    emitter.on('data', l2)
    emitter.removeAllListeners('data')
    emitter.emit('data', 'x')
    expect(l1).not.toHaveBeenCalled()
    expect(l2).not.toHaveBeenCalled()
  })
})
