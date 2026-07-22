import { describe, it, expect, vi, afterEach } from 'vitest'

import { ConnectionLifecycleManager, ReconnectPolicy } from '../../../src/transport'

describe('ConnectionLifecycleManager', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('nextConnectionId / connectionId', () => {
    it('每次调用 nextConnectionId 递增，connectionId 反映最新值', () => {
      const manager = new ConnectionLifecycleManager(null)
      expect(manager.connectionId).toBe(0)
      expect(manager.nextConnectionId()).toBe(1)
      expect(manager.connectionId).toBe(1)
      expect(manager.nextConnectionId()).toBe(2)
      expect(manager.connectionId).toBe(2)
    })
  })

  describe('armStableResetTimer / clearStableResetTimer', () => {
    it('无 reconnectPolicy 时 armStableResetTimer 是无操作', () => {
      const manager = new ConnectionLifecycleManager(null)
      expect(() => manager.armStableResetTimer()).not.toThrow()
    })

    it('维持满 stableAfterMs 后调用 policy.reset()', () => {
      vi.useFakeTimers()
      const policy = new ReconnectPolicy({ stableAfterMs: 100 })
      const resetSpy = vi.spyOn(policy, 'reset')
      const manager = new ConnectionLifecycleManager(policy)

      manager.armStableResetTimer()
      vi.advanceTimersByTime(100)

      expect(resetSpy).toHaveBeenCalledOnce()
    })

    it('clearStableResetTimer 取消尚未触发的定时器', () => {
      vi.useFakeTimers()
      const policy = new ReconnectPolicy({ stableAfterMs: 100 })
      const resetSpy = vi.spyOn(policy, 'reset')
      const manager = new ConnectionLifecycleManager(policy)

      manager.armStableResetTimer()
      manager.clearStableResetTimer()
      vi.advanceTimersByTime(200)

      expect(resetSpy).not.toHaveBeenCalled()
    })

    it('重复调用 armStableResetTimer 会取消前一个定时器（只有最后一次生效）', () => {
      vi.useFakeTimers()
      const policy = new ReconnectPolicy({ stableAfterMs: 100 })
      const resetSpy = vi.spyOn(policy, 'reset')
      const manager = new ConnectionLifecycleManager(policy)

      manager.armStableResetTimer()
      vi.advanceTimersByTime(50)
      manager.armStableResetTimer() // 重新计时
      vi.advanceTimersByTime(50) // 总共 100ms，但距第二次 arm 只过了 50ms
      expect(resetSpy).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50) // 距第二次 arm 满 100ms
      expect(resetSpy).toHaveBeenCalledOnce()
    })
  })

  describe('scheduleReconnect', () => {
    it('canRetry 为 false 且存在 policy 时调用 onGiveUp，不调度定时器', () => {
      const policy = new ReconnectPolicy({ maxRetries: 0 })
      const manager = new ConnectionLifecycleManager(policy)
      const onGiveUp = vi.fn()
      const onReconnecting = vi.fn()

      manager.scheduleReconnect({
        isExpired: () => false,
        doConnect: vi.fn().mockResolvedValue(undefined),
        onReconnecting,
        onGiveUp,
        onError: vi.fn(),
      })

      expect(onGiveUp).toHaveBeenCalledOnce()
      expect(onReconnecting).not.toHaveBeenCalled()
    })

    it('policy 为 null 时不调用 onGiveUp（无重连策略，静默不做任何事）', () => {
      const manager = new ConnectionLifecycleManager(null)
      const onGiveUp = vi.fn()

      manager.scheduleReconnect({
        isExpired: () => false,
        doConnect: vi.fn().mockResolvedValue(undefined),
        onReconnecting: vi.fn(),
        onGiveUp,
        onError: vi.fn(),
      })

      expect(onGiveUp).not.toHaveBeenCalled()
    })

    it('canRetry 为 true 时调用 onReconnecting，延迟后调用 doConnect', async () => {
      vi.useFakeTimers()
      const policy = new ReconnectPolicy({ initialDelay: 100, jitter: 0 })
      const manager = new ConnectionLifecycleManager(policy)
      const doConnect = vi.fn().mockResolvedValue(undefined)
      const onReconnecting = vi.fn()

      manager.scheduleReconnect({
        isExpired: () => false,
        doConnect,
        onReconnecting,
        onGiveUp: vi.fn(),
        onError: vi.fn(),
      })

      expect(onReconnecting).toHaveBeenCalledWith(1, 100)
      expect(doConnect).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(100)
      expect(doConnect).toHaveBeenCalledOnce()
    })

    it('定时器触发时 isExpired 返回 true，跳过 doConnect', async () => {
      vi.useFakeTimers()
      const policy = new ReconnectPolicy({ initialDelay: 100, jitter: 0 })
      const manager = new ConnectionLifecycleManager(policy)
      const doConnect = vi.fn().mockResolvedValue(undefined)

      manager.scheduleReconnect({
        isExpired: () => true,
        doConnect,
        onReconnecting: vi.fn(),
        onGiveUp: vi.fn(),
        onError: vi.fn(),
      })

      await vi.advanceTimersByTimeAsync(100)
      expect(doConnect).not.toHaveBeenCalled()
    })

    it('doConnect 拒绝时调用 onError', async () => {
      vi.useFakeTimers()
      const policy = new ReconnectPolicy({ initialDelay: 100, jitter: 0 })
      const manager = new ConnectionLifecycleManager(policy)
      const onError = vi.fn()

      manager.scheduleReconnect({
        isExpired: () => false,
        doConnect: vi.fn().mockRejectedValue(new Error('连接失败')),
        onReconnecting: vi.fn(),
        onGiveUp: vi.fn(),
        onError,
      })

      await vi.advanceTimersByTimeAsync(100)
      await vi.waitFor(() => expect(onError).toHaveBeenCalledOnce())
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })

    it('连续多次 scheduleReconnect，onReconnecting 接收递增的 attempt', () => {
      vi.useFakeTimers()
      const policy = new ReconnectPolicy({ initialDelay: 50, jitter: 0 })
      const manager = new ConnectionLifecycleManager(policy)
      const onReconnecting = vi.fn()

      manager.scheduleReconnect({
        isExpired: () => false,
        doConnect: vi.fn().mockResolvedValue(undefined),
        onReconnecting,
        onGiveUp: vi.fn(),
        onError: vi.fn(),
      })
      expect(onReconnecting).toHaveBeenCalledWith(1, 50)

      manager.scheduleReconnect({
        isExpired: () => false,
        doConnect: vi.fn().mockResolvedValue(undefined),
        onReconnecting,
        onGiveUp: vi.fn(),
        onError: vi.fn(),
      })
      expect(onReconnecting).toHaveBeenCalledWith(2, 100)

      manager.scheduleReconnect({
        isExpired: () => false,
        doConnect: vi.fn().mockResolvedValue(undefined),
        onReconnecting,
        onGiveUp: vi.fn(),
        onError: vi.fn(),
      })
      expect(onReconnecting).toHaveBeenCalledWith(3, 200)
    })

    it('scheduleReconnect 配合 jitter，延迟在 [base*(1-jitter), base*(1+jitter)] 范围内', () => {
      vi.useFakeTimers()
      const policy = new ReconnectPolicy({ initialDelay: 1000, jitter: 0.3 })
      const manager = new ConnectionLifecycleManager(policy)
      const onReconnecting = vi.fn()

      manager.scheduleReconnect({
        isExpired: () => false,
        doConnect: vi.fn().mockResolvedValue(undefined),
        onReconnecting,
        onGiveUp: vi.fn(),
        onError: vi.fn(),
      })

      const delay = onReconnecting.mock.calls[0]?.[1] as number
      expect(delay).toBeGreaterThanOrEqual(700)
      expect(delay).toBeLessThanOrEqual(1300)
    })

    it('doConnect 成功时不调用 onError 和 onGiveUp', async () => {
      vi.useFakeTimers()
      const policy = new ReconnectPolicy({ initialDelay: 50, jitter: 0 })
      const manager = new ConnectionLifecycleManager(policy)
      const onError = vi.fn()
      const onGiveUp = vi.fn()

      manager.scheduleReconnect({
        isExpired: () => false,
        doConnect: vi.fn().mockResolvedValue(undefined),
        onReconnecting: vi.fn(),
        onGiveUp,
        onError,
      })

      await vi.advanceTimersByTimeAsync(50)
      expect(onError).not.toHaveBeenCalled()
      expect(onGiveUp).not.toHaveBeenCalled()
    })

    it('nextConnectionId 快照配合 isExpired 模拟 SSE 连接身份过期判定', async () => {
      vi.useFakeTimers()
      const policy = new ReconnectPolicy({ initialDelay: 50, jitter: 0 })
      const manager = new ConnectionLifecycleManager(policy)
      const doConnect = vi.fn().mockResolvedValue(undefined)

      const snapshotId = manager.nextConnectionId()
      expect(snapshotId).toBe(1)

      manager.scheduleReconnect({
        isExpired: () => manager.connectionId !== snapshotId,
        doConnect,
        onReconnecting: vi.fn(),
        onGiveUp: vi.fn(),
        onError: vi.fn(),
      })

      manager.nextConnectionId()
      expect(manager.connectionId).toBe(2)

      await vi.advanceTimersByTimeAsync(50)
      expect(doConnect).not.toHaveBeenCalled()
    })
  })

  describe('armStableResetTimer / clearStableResetTimer 边界', () => {
    it('clearStableResetTimer 在无定时器时调用不抛异常', () => {
      const policy = new ReconnectPolicy({ stableAfterMs: 100 })
      const manager = new ConnectionLifecycleManager(policy)
      expect(() => manager.clearStableResetTimer()).not.toThrow()
    })

    it('armStableResetTimer 配合 stableAfterMs=0 立即调用 policy.reset()', () => {
      vi.useFakeTimers()
      const policy = new ReconnectPolicy({ stableAfterMs: 0 })
      const resetSpy = vi.spyOn(policy, 'reset')
      const manager = new ConnectionLifecycleManager(policy)

      manager.armStableResetTimer()
      vi.advanceTimersByTime(0)

      expect(resetSpy).toHaveBeenCalledOnce()
    })
  })

  describe('nextConnectionId / connectionId 边界', () => {
    it('初始 connectionId 为 0', () => {
      const manager = new ConnectionLifecycleManager(null)
      expect(manager.connectionId).toBe(0)
    })

    it('多次 nextConnectionId 调用保持严格递增', () => {
      const manager = new ConnectionLifecycleManager(null)
      for (let i = 1; i <= 100; i++) {
        expect(manager.nextConnectionId()).toBe(i)
      }
      expect(manager.connectionId).toBe(100)
    })
  })

  describe('无 reconnectPolicy 时的完整行为', () => {
    it('armStableResetTimer 无操作，clearStableResetTimer 无操作', () => {
      const manager = new ConnectionLifecycleManager(null)
      expect(() => manager.armStableResetTimer()).not.toThrow()
      expect(() => manager.clearStableResetTimer()).not.toThrow()
    })

    it('scheduleReconnect 静默不做任何事，不调用任何回调', () => {
      const manager = new ConnectionLifecycleManager(null)
      const onGiveUp = vi.fn()
      const onReconnecting = vi.fn()
      const onError = vi.fn()

      manager.scheduleReconnect({
        isExpired: () => false,
        doConnect: vi.fn(),
        onReconnecting,
        onGiveUp,
        onError,
      })

      expect(onGiveUp).not.toHaveBeenCalled()
      expect(onReconnecting).not.toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })
  })
})
