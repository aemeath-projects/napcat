/**
 * 核心模块 - 提供客户端、事件发射器、错误处理等基础设施。
 */

export {
  NapCatError,
  ConnectionError,
  TransportError,
  TimeoutError,
  AuthenticationError,
} from './errors.js'
export type { Result } from './result.js'
export { TypedEventEmitter } from './emitter.js'
export { NapCatClient } from './client.js'
