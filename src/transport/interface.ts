import type { TypedEventEmitter } from '../core'
import type { ApiResponse, TransportEventMap } from '../types'

/** Transport 连接状态。 */
export type TransportState = 'disconnected' | 'connecting' | 'connected'

/** Transport 统一接口，继承 TypedEventEmitter 以获得类型安全的事件机制。 */
export interface ITransport extends TypedEventEmitter<TransportEventMap> {
  readonly state: TransportState
  connect(): Promise<void>
  disconnect(): Promise<void>
  call(action: string, params: Record<string, unknown>): Promise<ApiResponse>
}
