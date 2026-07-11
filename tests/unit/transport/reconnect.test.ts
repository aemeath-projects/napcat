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

  it('stableAfterMs 默认值为 30000', () => {
    const policy = new ReconnectPolicy()
    expect(policy.stableAfterMs).toBe(30_000)
  })

  it('stableAfterMs 可自定义', () => {
    const policy = new ReconnectPolicy({ stableAfterMs: 5000 })
    expect(policy.stableAfterMs).toBe(5000)
  })

  it('reset() 后 canRetry() 恢复为 true（即使之前已耗尽）', () => {
    const policy = new ReconnectPolicy({ maxRetries: 2, jitter: 0 })
    policy.nextDelay()
    policy.nextDelay()
    expect(policy.canRetry()).toBe(false)
    policy.reset()
    expect(policy.canRetry()).toBe(true)
    expect(policy.attempts).toBe(0)
  })

  it('stableAfterMs = 0 为合法值', () => {
    const policy = new ReconnectPolicy({ stableAfterMs: 0 })
    expect(policy.stableAfterMs).toBe(0)
  })

  it('maxRetries = 0 时 canRetry() 立即返回 false', () => {
    const policy = new ReconnectPolicy({ maxRetries: 0, jitter: 0 })
    expect(policy.canRetry()).toBe(false)
  })

  it('maxRetries = 0 时 nextDelay 仍可调用并递增计数器', () => {
    const policy = new ReconnectPolicy({ maxRetries: 0, jitter: 0, initialDelay: 100 })
    expect(policy.attempts).toBe(0)
    const d = policy.nextDelay()
    expect(d).toBe(100)
    expect(policy.attempts).toBe(1)
    // canRetry 仍为 false（budget 已耗尽但 nextDelay 不受限 ——
    // canRetry 的职责是告诉上层"是否应该安排下一次重连"，而非阻止 nextDelay 计算）
    expect(policy.canRetry()).toBe(false)
  })

  it('jitter=0 时 nextDelay 完全确定性：多次调用返回精确的指数值', () => {
    const policy = new ReconnectPolicy({
      initialDelay: 500,
      multiplier: 2,
      maxDelay: 100_000,
      jitter: 0,
    })
    expect(policy.nextDelay()).toBe(500)
    expect(policy.nextDelay()).toBe(1000)
    expect(policy.nextDelay()).toBe(2000)
    expect(policy.nextDelay()).toBe(4000)
    expect(policy.nextDelay()).toBe(8000)
    expect(policy.nextDelay()).toBe(16000)
    expect(policy.nextDelay()).toBe(32000)
  })

  it('maxDelay 边界精确限制：指数增长到远超 maxDelay 后硬截断', () => {
    const policy = new ReconnectPolicy({
      initialDelay: 1000,
      multiplier: 10,
      maxDelay: 5000,
      jitter: 0,
    })
    // 第 1 次: base=1000≤5000 → 1000
    expect(policy.nextDelay()).toBe(1000)
    // 第 2 次: base=10000>5000 → 截断为 5000
    expect(policy.nextDelay()).toBe(5000)
    // 后续持续截断
    expect(policy.nextDelay()).toBe(5000)
    expect(policy.nextDelay()).toBe(5000)
  })

  it('multiplier 可自定义为非默认值', () => {
    const policy = new ReconnectPolicy({
      initialDelay: 100,
      multiplier: 3,
      maxDelay: 10_000,
      jitter: 0,
    })
    expect(policy.nextDelay()).toBe(100)
    expect(policy.nextDelay()).toBe(300)
    expect(policy.nextDelay()).toBe(900)
    expect(policy.nextDelay()).toBe(2700)
    expect(policy.nextDelay()).toBe(8100)
  })

  it('jitter=0.5 时多次调用均在 [base*0.5, base*1.5] 范围内', () => {
    const policy = new ReconnectPolicy({ initialDelay: 1000, jitter: 0.5, maxDelay: 30_000 })
    for (let i = 0; i < 20; i++) {
      const delay = policy.nextDelay()
      const base = Math.min(1000 * Math.pow(2, i), 30_000)
      const expectedMin = base - base * 0.5
      const expectedMax = base + base * 0.5
      expect(delay).toBeGreaterThanOrEqual(expectedMin)
      expect(delay).toBeLessThanOrEqual(expectedMax)
    }
  })

  it('连续调用 nextDelay 1000 次（maxRetries=-1），canRetry 始终为 true，attempts 线性递增', () => {
    const policy = new ReconnectPolicy({ maxRetries: -1, jitter: 0, maxDelay: 1_000_000 })
    for (let i = 0; i < 1000; i++) {
      expect(policy.canRetry()).toBe(true)
      expect(policy.attempts).toBe(i)
      policy.nextDelay()
    }
    expect(policy.attempts).toBe(1000)
    expect(policy.canRetry()).toBe(true)
  })

  it('reset 后再次调用 nextDelay 的正常递增周期与首次完全一致', () => {
    const policy = new ReconnectPolicy({
      initialDelay: 200,
      multiplier: 2,
      maxDelay: 10_000,
      jitter: 0,
    })
    // 第一轮
    policy.nextDelay()
    policy.nextDelay()
    expect(policy.attempts).toBe(2)
    // 重置
    policy.reset()
    expect(policy.attempts).toBe(0)
    // 第二轮：应与第一轮的 nextDelay 输出完全一致
    expect(policy.nextDelay()).toBe(200)
    expect(policy.nextDelay()).toBe(400)
    expect(policy.attempts).toBe(2)
  })

  it('连续 10 次 reset → nextDelay 循环，attempts 每次还原回到 1', () => {
    const policy = new ReconnectPolicy({ jitter: 0, initialDelay: 100 })
    for (let cycle = 0; cycle < 10; cycle++) {
      expect(policy.attempts).toBe(0)
      policy.nextDelay()
      expect(policy.attempts).toBe(1)
      policy.reset()
      expect(policy.attempts).toBe(0)
    }
  })

  it('并发随机穿插 canRetry/nextDelay/reset 1000 次调用不抛异常且 attempts 不越界', () => {
    const policy = new ReconnectPolicy({
      maxRetries: 5,
      jitter: 0.2,
      initialDelay: 50,
      maxDelay: 5000,
    })
    for (let i = 0; i < 1000; i++) {
      const r = Math.random()
      if (r < 0.5) {
        // 50% 概率获取 canRetry
        const can = policy.canRetry()
        expect(typeof can).toBe('boolean')
      } else if (r < 0.85) {
        // 35% 概率推进一次重试
        const delay = policy.nextDelay()
        expect(typeof delay).toBe('number')
        expect(delay).toBeGreaterThan(0)
      } else {
        // 15% 概率 reset
        policy.reset()
        expect(policy.attempts).toBe(0)
      }
      // attempts 不应超过 maxRetries 的推进限制（canRetry 由上层决策，nextDelay 本身不阻止）
      expect(policy.attempts).toBeGreaterThanOrEqual(0)
    }
    // 末态验证：reset 后的状态干净
    policy.reset()
    expect(policy.attempts).toBe(0)
    expect(policy.canRetry()).toBe(true)
  })

  it('stableAfterMs=0 时 reset 后 immediate 调用 nextDelay 返回 initialDelay', () => {
    const policy = new ReconnectPolicy({ stableAfterMs: 0, initialDelay: 300, jitter: 0 })
    policy.nextDelay()
    policy.nextDelay()
    policy.reset()
    expect(policy.nextDelay()).toBe(300)
    expect(policy.stableAfterMs).toBe(0)
  })
})
