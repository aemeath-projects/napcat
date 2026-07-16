import { describe, it, expect, vi, afterEach } from 'vitest'

import { ConnectionLifecycleManager } from '../../../src/transport/connection-lifecycle.js'
import { ReconnectPolicy } from '../../../src/transport/reconnect.js'

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
  })
})
