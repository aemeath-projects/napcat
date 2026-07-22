import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { NapCatClient } from '../../src/core'
import { WebSocketTransport } from '../../src/transport'

/** @live 需要真实 NapCat 实例 */
describe.skip('E2E：连接', () => {
  let client: NapCatClient

  beforeAll(async () => {
    const { WS_URL, TOKEN } = await import('./setup.js')
    const transport = new WebSocketTransport({ url: WS_URL, token: TOKEN })
    client = new NapCatClient(transport)
    await client.connect()
  })

  afterAll(async () => {
    await client?.disconnect()
  })

  it('连接成功且状态为 connected', () => {
    expect(client.transport.state).toBe('connected')
  })

  it('接收到心跳事件', async () => {
    const event = await new Promise((resolve) => {
      client.once('meta_event.heartbeat', resolve)
    })
    expect((event as Record<string, unknown>).meta_event_type).toBe('heartbeat')
  })
})
