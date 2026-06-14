import { describe, it, expect, vi } from 'vitest'

import { SystemApi } from '../../../src/api/system.js'
import type { NapCatClient } from '../../../src/core/client.js'

function mockClient(data: unknown = null) {
  return {
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode: 0, data }),
  } as unknown as NapCatClient
}

describe('SystemApi', () => {
  it('getLoginInfo', async () => {
    const client = mockClient({ user_id: 1, nickname: 'Bot' })
    const api = new SystemApi(client)
    await api.getLoginInfo()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_login_info', {})
  })
  it('getVersionInfo', async () => {
    const client = mockClient({ app_name: 'NapCat' })
    const api = new SystemApi(client)
    await api.getVersionInfo()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_version_info', {})
  })
  it('ocrImage', async () => {
    const client = mockClient({ texts: [], language: 'zh' })
    const api = new SystemApi(client)
    await api.ocrImage('base64://...')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('ocr_image', {
      image: 'base64://...',
    })
  })
  it('canSendImage', async () => {
    const client = mockClient({ yes: true })
    const api = new SystemApi(client)
    await api.canSendImage()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('can_send_image', {})
  })
  it('getCsrfToken', async () => {
    const client = mockClient({ token: 123456 })
    const api = new SystemApi(client)
    await api.getCsrfToken()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_csrf_token', {})
  })
  it('getStrangerInfo', async () => {
    const client = mockClient({ user_id: 9999, nickname: 'Test' })
    const api = new SystemApi(client)
    await api.getStrangerInfo(9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_stranger_info', {
      user_id: 9999,
    })
  })
  it('cleanCache', async () => {
    const client = mockClient()
    const api = new SystemApi(client)
    await api.cleanCache()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('clean_cache', {})
  })
  it('getStatus', async () => {
    const client = mockClient({ online: true, good: true })
    const api = new SystemApi(client)
    await api.getStatus()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_status', {})
  })
  it('canSendRecord', async () => {
    const client = mockClient({ yes: true })
    const api = new SystemApi(client)
    await api.canSendRecord()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('can_send_record', {})
  })
  it('getCookies', async () => {
    const client = mockClient({ cookies: 'abc=def' })
    const api = new SystemApi(client)
    await api.getCookies('qq.com')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_cookies', {
      domain: 'qq.com',
    })
  })
  it('getImage', async () => {
    const client = mockClient({ file: '/cache/img.png' })
    const api = new SystemApi(client)
    await api.getImage('image_hash')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_image', {
      file: 'image_hash',
    })
  })
  it('getRecord', async () => {
    const client = mockClient({ file: '/cache/rec.silk' })
    const api = new SystemApi(client)
    await api.getRecord('record_hash', 'mp3')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_record', {
      file: 'record_hash',
      out_format: 'mp3',
    })
  })
})
