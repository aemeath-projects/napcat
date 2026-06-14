import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { NapCatClient, WebSocketTransport } from '../../src/index.js'

/** @live 需要真实 NapCat 实例 */
describe.skip('E2E: Connection', () => {
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

  it('connects and state is connected', () => {
    expect(client.transport.state).toBe('connected')
  })

  it('receives heartbeat event', async () => {
    const event = await new Promise((resolve) => {
      client.once('meta_event.heartbeat', resolve)
    })
    expect((event as Record<string, unknown>).meta_event_type).toBe('heartbeat')
  })
})
