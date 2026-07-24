/**
 * 连接生命周期编排器 —— 封装稳定期计时器 + 连接身份计数器 + 重连调度骨架，
 * 供多个 Transport 实现（WebSocketTransport / SseTransport）复用。
 *
 * 宿主 Transport 通过 `isExpired` 回调告知"定时器触发时这次重连是否已经过期"，
 * 因为各 Transport 判定过期的方式不同（WebSocket 用连接状态，SSE 用连接身份
 * 快照对比），本类不强行统一判定方式，只统一"计算延迟 → emit reconnecting →
 * 延迟后检查是否过期 → 调用 doConnect"这套骨架。
 */

import type { ReconnectPolicy } from './reconnect.js'

/** `scheduleReconnect` 所需的宿主回调集合。 */
export interface ScheduleReconnectOptions {
  /** 定时器触发时调用，返回 true 则跳过本次重连（由宿主决定"过期"判定方式）。 */
  isExpired: () => boolean
  /** 实际执行重连的函数（宿主 Transport 的 connect()）。 */
  doConnect: () => Promise<void>
  /** 进入退避等待窗口时的回调（宿主用于 emit('reconnecting', attempt, delay) 与设置 state）。 */
  onReconnecting: (attempt: number, delay: number) => void
  /** 重试预算耗尽时的回调（宿主用于 emit('giveUp')）。 */
  onGiveUp: () => void
  /** 重连本身失败（doConnect 拒绝）时的回调（宿主用于 emit('error', ...)）。 */
  onError: (err: unknown) => void
}

export class ConnectionLifecycleManager {
  private _connectionId = 0
  private _stableResetTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 创建 ConnectionLifecycleManager 实例。
   * @param _reconnectPolicy 重连策略实例，null 表示不启用自动重连
   */
  constructor(private readonly _reconnectPolicy: ReconnectPolicy | null) {}

  /**
   * 递增并返回新的连接身份 ID。
   * @returns 新的连接 ID
   */
  nextConnectionId(): number {
    return ++this._connectionId
  }

  /**
   * 当前连接身份 ID。
   * @returns 当前连接 ID
   */
  get connectionId(): number {
    return this._connectionId
  }

  /**
   * 连接成功后调用：等待连接维持满 `reconnectPolicy.stableAfterMs` 才清零重连计数器；
   * 期间若再次断开（宿主调用 clearStableResetTimer）则取消。
   * @returns void
   */
  armStableResetTimer(): void {
    if (!this._reconnectPolicy) return
    this.clearStableResetTimer()
    this._stableResetTimer = setTimeout(() => {
      this._reconnectPolicy?.reset()
      this._stableResetTimer = null
    }, this._reconnectPolicy.stableAfterMs)
  }

  /**
   * 取消待触发的稳定期清零定时器（若有）。
   * @returns void
   */
  clearStableResetTimer(): void {
    if (this._stableResetTimer) {
      clearTimeout(this._stableResetTimer)
      this._stableResetTimer = null
    }
  }

  /**
   * 安排一次重连尝试。无 reconnectPolicy 时静默不做任何事。
   * @param opts 宿主提供的回调集合，含 isExpired / doConnect / onReconnecting / onGiveUp / onError
   * @returns void
   */
  scheduleReconnect(opts: ScheduleReconnectOptions): void {
    if (!this._reconnectPolicy?.canRetry()) {
      if (this._reconnectPolicy) opts.onGiveUp()
      return
    }

    const attempt = this._reconnectPolicy.attempts + 1
    const delay = this._reconnectPolicy.nextDelay()
    opts.onReconnecting(attempt, delay)

    setTimeout(() => {
      if (opts.isExpired()) return
      opts.doConnect().catch((err: unknown) => {
        opts.onError(err)
      })
    }, delay)
  }
}
