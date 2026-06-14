import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { NapCatClient, WebSocketTransport, SystemApi } from '../../src/index.js'

/** @live 需要真实 NapCat 实例 */
describe.skip('E2E: API calls', () => {
  let client: NapCatClient
  let systemApi: SystemApi

  beforeAll(async () => {
    const { WS_URL, TOKEN } = await import('./setup.js')
    const transport = new WebSocketTransport({ url: WS_URL, token: TOKEN })
    client = new NapCatClient(transport)
    systemApi = new SystemApi(client)
    await client.connect()
  })

  afterAll(async () => {
    await client?.disconnect()
  })

  it('getLoginInfo returns valid login info', async () => {
    const result = await systemApi.getLoginInfo()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(typeof result.data.user_id).toBe('number')
      expect(typeof result.data.nickname).toBe('string')
    }
  })

  it('getVersionInfo returns version', async () => {
    const result = await systemApi.getVersionInfo()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.app_name).toBeTruthy()
    }
  })
})
