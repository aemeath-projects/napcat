/**
 * 传输模块 - 提供 HTTP、WebSocket、SSE、反向 WebSocket 等多种通信方式。
 */

export type { Transport, TransportState } from './interface.js'
export type { PendingCall } from './message.js'
export { ReconnectPolicy, type ReconnectOptions } from './reconnect.js'
export {
  ConnectionLifecycleManager,
  type ScheduleReconnectOptions,
} from './connection-lifecycle.js'
export { extractTokenFromRequest } from './token.js'
export {
  WebSocketTransport,
  type WebSocketTransportOptions,
  type WsTransportEventMap,
} from './ws.js'
export { ReverseWebSocketTransport, type ReverseWebSocketTransportOptions } from './reverse-ws.js'
export { HttpTransport, type HttpTransportOptions, type HttpEventServerOptions } from './http.js'
export { SseTransport, type SseTransportOptions, type SseTransportEventMap } from './sse.js'
