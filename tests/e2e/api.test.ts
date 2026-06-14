import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { NapCatClient, WebSocketTransport, SystemApi } from '../../src/main.js'

/** @live 需要真实 NapCat 实例 */
describe.skip('E2E：API 调用', () => {
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

  it('getLoginInfo 返回有效的登录信息', async () => {
    const result = await systemApi.getLoginInfo()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(typeof result.data.user_id).toBe('number')
      expect(typeof result.data.nickname).toBe('string')
    }
  })

  it('getVersionInfo 返回版本信息', async () => {
    const result = await systemApi.getVersionInfo()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.app_name).toBeTruthy()
    }
  })
})
