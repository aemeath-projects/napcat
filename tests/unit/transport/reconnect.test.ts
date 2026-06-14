import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { ReconnectPolicy } from '../../../src/transport'

describe('重连策略', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('第一次延迟等于 initialDelay（无 jitter）', () => {
    const policy = new ReconnectPolicy({
      initialDelay: 1000,
      multiplier: 2,
      maxDelay: 30000,
      jitter: 0,
    })
    expect(policy.nextDelay()).toBe(1000)
  })

  it('延迟按指数递增', () => {
    const policy = new ReconnectPolicy({
      initialDelay: 1000,
      multiplier: 2,
      maxDelay: 10000,
      jitter: 0,
    })
    expect(policy.nextDelay()).toBe(1000)
    expect(policy.nextDelay()).toBe(2000)
    expect(policy.nextDelay()).toBe(4000)
    expect(policy.nextDelay()).toBe(8000)
    expect(policy.nextDelay()).toBe(10000) // 限制到 maxDelay
  })

  it('reset 后从初始值重新开始', () => {
    const policy = new ReconnectPolicy({
      initialDelay: 1000,
      multiplier: 2,
      maxDelay: 30000,
      jitter: 0,
    })
    policy.nextDelay()
    policy.nextDelay()
    policy.reset()
    expect(policy.nextDelay()).toBe(1000)
    expect(policy.attempts).toBe(1)
  })

  it('maxRetries=-1 时 canRetry 始终返回 true', () => {
    const policy = new ReconnectPolicy({ maxRetries: -1, jitter: 0 })
    for (let i = 0; i < 100; i++) {
      expect(policy.canRetry()).toBe(true)
      policy.nextDelay()
    }
  })

  it('超出 maxRetries 时 canRetry 返回 false', () => {
    const policy = new ReconnectPolicy({ initialDelay: 100, maxRetries: 2, jitter: 0 })
    expect(policy.canRetry()).toBe(true) // 0 attempts
    policy.nextDelay()
    expect(policy.canRetry()).toBe(true) // 1 attempt
    policy.nextDelay()
    expect(policy.canRetry()).toBe(false) // 2 attempts = maxRetries
  })

  it('jitter 在期望范围内', () => {
    const policy = new ReconnectPolicy({ initialDelay: 1000, jitter: 0.5, maxDelay: 30000 })
    // 第一次: base=1000, jitterRange=500 → 范围 [500, 1500]
    const delay = policy.nextDelay()
    expect(delay).toBeGreaterThanOrEqual(500)
    expect(delay).toBeLessThanOrEqual(1500)
  })

  it('默认值：initialDelay=1000, maxDelay=30000, multiplier=2, jitter=0.1, maxRetries=-1', () => {
    const policy = new ReconnectPolicy()
    expect(policy.canRetry()).toBe(true)
    const delay = policy.nextDelay()
    // 第一次 base=1000, jitter=0.1 → 范围 [900, 1100]
    expect(delay).toBeGreaterThanOrEqual(900)
    expect(delay).toBeLessThanOrEqual(1100)
  })
})
