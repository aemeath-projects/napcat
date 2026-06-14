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
}

/** 指数退避重连策略，支持 jitter 抖动和最大重试次数限制。 */
export class ReconnectPolicy {
  private readonly _initialDelay: number
  private readonly _maxDelay: number
  private readonly _multiplier: number
  private readonly _jitter: number
  private readonly _maxRetries: number
  private _attempts: number

  constructor(opts: ReconnectOptions = {}) {
    this._initialDelay = opts.initialDelay ?? 1000
    this._maxDelay = opts.maxDelay ?? 30000
    this._multiplier = opts.multiplier ?? 2
    this._jitter = opts.jitter ?? 0.1
    this._maxRetries = opts.maxRetries ?? -1
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

  /** 重置计数器（连接成功后调用）。 */
  reset(): void {
    this._attempts = 0
  }

  /** 当前重试次数（已调用 nextDelay 的次数）。 */
  get attempts(): number {
    return this._attempts
  }
}
