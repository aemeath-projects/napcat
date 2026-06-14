import { describe, it, expect, vi } from 'vitest'

import { TypedEventEmitter } from '../../../src/core/emitter.js'

interface TestEvents {
  data: (value: string) => void
  error: (err: Error) => void
  count: (n: number) => void
}

describe('TypedEventEmitter', () => {
  it('on/emit works with typed events', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const listener = vi.fn()
    emitter.on('data', listener)
    emitter.emit('data', 'hello')
    expect(listener).toHaveBeenCalledWith('hello')
  })

  it('once fires only once', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const listener = vi.fn()
    emitter.once('count', listener)
    emitter.emit('count', 1)
    emitter.emit('count', 2)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(1)
  })

  it('off removes listener', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const listener = vi.fn()
    emitter.on('data', listener)
    emitter.off('data', listener)
    emitter.emit('data', 'test')
    expect(listener).not.toHaveBeenCalled()
  })

  it('removeAllListeners clears all', () => {
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
