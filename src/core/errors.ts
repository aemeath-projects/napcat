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
  readonly action: string
  readonly timeout: number

  constructor(action: string, timeout: number) {
    super(`API call "${action}" timed out after ${timeout.toString()}ms`)
    this.action = action
    this.timeout = timeout
  }
}

/** token 校验失败。 */
export class AuthenticationError extends ConnectionError {}
