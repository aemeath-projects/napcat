import type { ApiResponse, OneBotEvent } from '../types'
import { snakeToCamel } from '../utils'

/** 等待中的 API 调用信息，供 Transport 实现复用。 */
export interface PendingCall {
  resolve: (resp: ApiResponse) => void
  reject: (err: Error) => void
  timer: ReturnType<typeof setTimeout>
}

/**
 * 处理收到的 WebSocket 消息 — 区分 API 响应（echo）和事件推送（post_type）。
 * 供 WebSocketTransport 和 ReverseWebSocketTransport 复用。
 */
export function handleIncomingMessage(
  raw: string,
  pending: Map<string, PendingCall>,
  emit: (event: string, data: OneBotEvent) => void,
): void {
  let data: Record<string, unknown>
  try {
    data = JSON.parse(raw) as Record<string, unknown>
  } catch {
    return
  }

  // 含 echo 且无 post_type → API 响应
  if (typeof data.echo === 'string' && data.post_type === undefined) {
    const entry = pending.get(data.echo)
    if (entry) {
      clearTimeout(entry.timer)
      pending.delete(data.echo)
      entry.resolve(data as unknown as ApiResponse)
    }
    return
  }

  // 有 post_type → OneBot 事件推送（先判断 wire 字段，再转 camelCase 后 emit）
  if (typeof data.post_type === 'string') {
    emit('event', snakeToCamel(data) as unknown as OneBotEvent)
  }
}
