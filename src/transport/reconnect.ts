/** 指数退避重连策略配置。 */
export interface ReconnectOptions {
  /** 初始延迟（ms），默认 1000 */
  initialDelay?: number
  /** 最大延迟（ms），默认 30000 */
  maxDelay?: number
  /** 退避倍数，默认 2 */
  multiplier?: number
  /** 抖动因子 0~1，默认 0.1 */
  jitter?: number
  /** 最大重试次数，-1 为无限，默认 -1 */
  maxRetries?: number
  /**
   * 连接需要维持满这么久（ms）才视为"稳定"，届时才清零重连计数器，默认 30000（30 秒）。
   * 避免两个极端：连接一成功就立即清零会让疯狂闪断（从未真正稳定过）的连接永远重试、
   * 永远不会耗尽预算触发 giveUp；完全不清零又会让偶发的短暂抖动（每次都能稳定连上很久）
   * 在长期运行后错误地累积耗尽预算、被误判为需要放弃重连。设为 0 等价于连接成功立即清零。
   */
  stableAfterMs?: number
}

/** 指数退避重连策略，支持 jitter 抖动和最大重试次数限制。 */
export class ReconnectPolicy {
  private readonly _initialDelay: number
  private readonly _maxDelay: number
  private readonly _multiplier: number
  private readonly _jitter: number
  private readonly _maxRetries: number
  private readonly _stableAfterMs: number
  private _attempts: number

  constructor(opts: ReconnectOptions = {}) {
    this._initialDelay = opts.initialDelay ?? 1000
    this._maxDelay = opts.maxDelay ?? 30000
    this._multiplier = opts.multiplier ?? 2
    this._jitter = opts.jitter ?? 0.1
    this._maxRetries = opts.maxRetries ?? -1
    this._stableAfterMs = opts.stableAfterMs ?? 30_000
    this._attempts = 0
  }

  /** 是否还可以继续重试。 */
  canRetry(): boolean {
    if (this._maxRetries === -1) return true
    return this._attempts < this._maxRetries
  }

  /** 计算下次延迟（ms），并递增计数器。 */
  nextDelay(): number {
    const base = Math.min(
      this._initialDelay * Math.pow(this._multiplier, this._attempts),
      this._maxDelay,
    )
    this._attempts++

    if (this._jitter === 0) return base

    const jitterRange = base * this._jitter
    return base + (Math.random() * 2 - 1) * jitterRange
  }

  /** 重置计数器（连接维持满 stableAfterMs 后调用）。 */
  reset(): void {
    this._attempts = 0
  }

  /** 当前重试次数（已调用 nextDelay 的次数）。 */
  get attempts(): number {
    return this._attempts
  }

  /** 连接需要维持满这么久（ms）才清零重连计数器。 */
  get stableAfterMs(): number {
    return this._stableAfterMs
  }
}
