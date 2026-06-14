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
export {
  HttpTransport,
  type HttpTransportOptions,
  type HttpEventServerOptions,
} from './transport/http.js'
export type { ITransport, TransportState } from './transport/interface.js'
export { ReconnectPolicy, type ReconnectOptions } from './transport/reconnect.js'
export {
  ReverseWebSocketTransport,
  type ReverseWebSocketTransportOptions,
} from './transport/reverse-ws.js'
export { SseTransport, type SseTransportOptions } from './transport/sse.js'
export { WebSocketTransport, type WebSocketTransportOptions } from './transport/ws.js'

// API
export { BaseApi } from './api/base.js'
export { MessageApi } from './api/message.js'
export { GroupApi } from './api/group.js'
export { FriendApi } from './api/friend.js'
export { FileApi } from './api/file.js'
export { SystemApi } from './api/system.js'
export { ExtensionApi } from './api/extension.js'

// 工具函数
export { Seg, extractPlaintext } from './utils/segment.js'
export * from './utils/guards.js'
