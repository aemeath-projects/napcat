/** SDK 基础错误类。 */
export class NapCatError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

/** 连接失败。 */
export class ConnectionError extends NapCatError {}

/** 传输异常。 */
export class TransportError extends NapCatError {}

/** API 调用超时。 */
export class TimeoutError extends NapCatError {
  /** API 动作名称。 */
  readonly action: string
  /** 超时时间（毫秒）。 */
  readonly timeout: number

  constructor(action: string, timeout: number) {
    super(`API 调用 "${action}" 超时，超时时间 ${timeout.toString()}ms`)
    this.action = action
    this.timeout = timeout
  }
}

/** token 校验失败。 */
export class AuthenticationError extends ConnectionError {}
