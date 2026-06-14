import { EventEmitter } from 'node:events'

import type { ITransport } from '../transport/interface.js'
import type { ApiResponse, OneBotEvent } from '../types/common.js'
import type { ClientEventMap } from '../types/events.js'

import { TypedEventEmitter } from './emitter.js'

/** 需要分层分发子事件的 post_type 集合。message_sent 不在此列。 */
const HIERARCHICAL_POST_TYPES = new Set(['message', 'notice', 'request', 'meta_event'])

/** NapCat SDK 主客户端。薄壳，负责 Transport 代理和事件分发。 */
export class NapCatClient extends TypedEventEmitter<ClientEventMap> {
  constructor(public readonly transport: ITransport) {
    super()
    this._setupEventForwarding()
  }

  /** 当前连接状态，代理到 Transport。 */
  get state() {
    return this.transport.state
  }

  /** 建立与 NapCat 服务器的连接。 */
  async connect(): Promise<void> {
    await this.transport.connect()
  }

  /** 断开连接。 */
  async disconnect(): Promise<void> {
    await this.transport.disconnect()
  }

  /** 调用 OneBot API，代理到 Transport。 */
  async call(action: string, params: Record<string, unknown>): Promise<ApiResponse> {
    return this.transport.call(action, params)
  }

  /** 设置 Transport 事件转发与原始事件分发。 */
  private _setupEventForwarding(): void {
    this.transport.on('connect', () => this.emit('connect'))
    this.transport.on('close', () => this.emit('close'))
    this.transport.on('error', (err: Error) => this.emit('error', err))
    this.transport.on('reconnecting', (attempt: number, delay: number) =>
      this.emit('reconnecting', attempt, delay),
    )

    this.transport.on('event', (raw: OneBotEvent) => {
      if (HIERARCHICAL_POST_TYPES.has(raw.post_type)) {
        // 从对应字段读取子类型键
        const subKey =
          (raw.message_type as string | undefined) ??
          (raw.notice_type as string | undefined) ??
          (raw.request_type as string | undefined) ??
          (raw.meta_event_type as string | undefined)

        if (subKey) {
          // 动态事件分发无法通过静态类型检查，借助父类原型方法绕过类型约束
          EventEmitter.prototype.emit.call(this, `${raw.post_type}.${subKey}`, raw)
        }
      }

      // 始终触发顶层事件（message / notice / request / meta_event / message_sent）
      EventEmitter.prototype.emit.call(this, raw.post_type, raw)
    })
  }
}
