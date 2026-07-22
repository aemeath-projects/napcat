/** Aemeath NapCat SDK */

// 核心
export {
  NapCatClient,
  TypedEventEmitter,
  NapCatError,
  ConnectionError,
  TransportError,
  TimeoutError,
  AuthenticationError,
  type Result,
} from './core'

// 传输层
export { HttpTransport, type HttpTransportOptions, type HttpEventServerOptions } from './transport'
export type { Transport, TransportState } from './transport'
export { ReconnectPolicy, type ReconnectOptions } from './transport'
export { ReverseWebSocketTransport, type ReverseWebSocketTransportOptions } from './transport'
export { SseTransport, type SseTransportOptions } from './transport'
export { WebSocketTransport, type WebSocketTransportOptions } from './transport'

// API
export { BaseApi } from './api'
export { MessageApi } from './api'
export { GroupApi } from './api'
export { FriendApi } from './api'
export { FileApi } from './api'
export { SystemApi } from './api'
export { ExtensionApi } from './api'

// 工具函数
export { seg, extractPlaintext } from './utils'
export { cq } from './utils'
export * from './utils'
export { snakeToCamel, camelToSnake } from './utils'
