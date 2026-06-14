/** @aemeath-projects/napcat — NapCat / OneBot 11 TypeScript SDK */

// 核心
export { NapCatClient } from './core/client.js'
export { TypedEventEmitter } from './core/emitter.js'
export {
  NapCatError,
  ConnectionError,
  TransportError,
  TimeoutError,
  AuthenticationError,
} from './core/errors.js'
export type { Result } from './core/result.js'

// Transport
export { WebSocketTransport } from './transport/ws.js'
export { ReverseWebSocketTransport } from './transport/reverse-ws.js'
export { HttpTransport } from './transport/http.js'
export { SseTransport } from './transport/sse.js'
export { ReconnectPolicy } from './transport/reconnect.js'
export type { ITransport, TransportState } from './transport/interface.js'
export type { ReconnectOptions } from './transport/reconnect.js'
export type { WebSocketTransportOptions } from './transport/ws.js'
export type { ReverseWebSocketTransportOptions } from './transport/reverse-ws.js'
export type { HttpTransportOptions, HttpEventServerOptions } from './transport/http.js'
export type { SseTransportOptions } from './transport/sse.js'

// API
export { BaseApi } from './api/base.js'
export { MessageApi } from './api/message.js'
export { GroupApi } from './api/group.js'
export { FriendApi } from './api/friend.js'
export { FileApi } from './api/file.js'
export { SystemApi } from './api/system.js'
export { ExtensionApi } from './api/extension.js'

// Utils
export { Seg, extractPlaintext } from './utils/segment.js'
export * from './utils/guards.js'
