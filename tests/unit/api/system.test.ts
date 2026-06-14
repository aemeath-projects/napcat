import { describe, it, expect, vi } from 'vitest'

import { SystemApi } from '../../../src/api/system.js'
import type { NapCatClient } from '../../../src/core/client.js'

function mockClient(data: unknown = null) {
  return {
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode: 0, data }),
  } as unknown as NapCatClient
}

describe('系统 API', () => {
  it('getLoginInfo 获取登录信息', async () => {
    const client = mockClient({ user_id: 1, nickname: 'Bot' })
    const api = new SystemApi(client)
    await api.getLoginInfo()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_login_info', {})
  })
  it('getVersionInfo 获取版本信息', async () => {
    const client = mockClient({ app_name: 'NapCat' })
    const api = new SystemApi(client)
    await api.getVersionInfo()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_version_info', {})
  })
  it('ocrImage 图片文字识别', async () => {
    const client = mockClient({ texts: [], language: 'zh' })
    const api = new SystemApi(client)
    await api.ocrImage('base64://...')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('ocr_image', {
      image: 'base64://...',
    })
  })
  it('canSendImage 检查能否发送图片', async () => {
    const client = mockClient({ yes: true })
    const api = new SystemApi(client)
    await api.canSendImage()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('can_send_image', {})
  })
  it('getCsrfToken 获取 CSRF Token', async () => {
    const client = mockClient({ token: 123456 })
    const api = new SystemApi(client)
    await api.getCsrfToken()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_csrf_token', {})
  })
  it('getStrangerInfo 获取陌生人信息', async () => {
    const client = mockClient({ user_id: 9999, nickname: 'Test' })
    const api = new SystemApi(client)
    await api.getStrangerInfo(9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_stranger_info', {
      user_id: 9999,
    })
  })
  it('cleanCache 清理缓存', async () => {
    const client = mockClient()
    const api = new SystemApi(client)
    await api.cleanCache()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('clean_cache', {})
  })
  it('getStatus 获取状态', async () => {
    const client = mockClient({ online: true, good: true })
    const api = new SystemApi(client)
    await api.getStatus()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_status', {})
  })
  it('canSendRecord 检查能否发送语音', async () => {
    const client = mockClient({ yes: true })
    const api = new SystemApi(client)
    await api.canSendRecord()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('can_send_record', {})
  })
  it('getCookies 获取 Cookies', async () => {
    const client = mockClient({ cookies: 'abc=def' })
    const api = new SystemApi(client)
    await api.getCookies('qq.com')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_cookies', {
      domain: 'qq.com',
    })
  })
  it('getImage 获取图片', async () => {
    const client = mockClient({ file: '/cache/img.png' })
    const api = new SystemApi(client)
    await api.getImage('image_hash')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_image', {
      file: 'image_hash',
    })
  })
  it('getRecord 获取语音', async () => {
    const client = mockClient({ file: '/cache/rec.silk' })
    const api = new SystemApi(client)
    await api.getRecord('record_hash', 'mp3')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_record', {
      file: 'record_hash',
      out_format: 'mp3',
    })
  })
  it('setQQProfile 设置 QQ 资料卡', async () => {
    const client = mockClient()
    const api = new SystemApi(client)
    await api.setQQProfile({ nickname: '新昵称', personal_note: '签名' })
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_qq_profile', {
      nickname: '新昵称',
      personal_note: '签名',
    })
  })
  it('setQQAvatar 设置 QQ 头像', async () => {
    const client = mockClient()
    const api = new SystemApi(client)
    await api.setQQAvatar('/path/to/avatar.png')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_qq_avatar', {
      file: '/path/to/avatar.png',
    })
  })
  it('botExit 退出机器人', async () => {
    const client = mockClient()
    const api = new SystemApi(client)
    await api.botExit()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('bot_exit', {})
  })
  it('setSelfLongnick 设置个性签名', async () => {
    const client = mockClient()
    const api = new SystemApi(client)
    await api.setSelfLongnick('个性签名')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_self_longnick', {
      longNick: '个性签名',
    })
  })
  it('getCredentials 获取凭据', async () => {
    const client = mockClient({ cookies: 'token=abc', csrf_token: 123 })
    const api = new SystemApi(client)
    await api.getCredentials('qq.com')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_credentials', {
      domain: 'qq.com',
    })
  })
  it('getClientkey 获取 Client Key', async () => {
    const client = mockClient({ client_key: 'abc123' })
    const api = new SystemApi(client)
    await api.getClientkey()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_clientkey', {})
  })
  it('setDiyOnlineStatus 设置自定义在线状态', async () => {
    const client = mockClient()
    const api = new SystemApi(client)
    await api.setDiyOnlineStatus(1, 1, '自定义状态')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_diy_online_status', {
      face_id: 1,
      face_type: 1,
      wording: '自定义状态',
    })
  })
  it('getModelShow 获取展示机型', async () => {
    const client = mockClient({ model_show: 'iPhone' })
    const api = new SystemApi(client)
    await api.getModelShow()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('_get_model_show', {})
  })
  it('setModelShow 设置展示机型', async () => {
    const client = mockClient()
    const api = new SystemApi(client)
    await api.setModelShow('iPhone 15 Pro Max')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('_set_model_show', {
      model: 'iPhone 15 Pro Max',
    })
  })
  it('getOnlineClients 获取在线客户端', async () => {
    const client = mockClient([])
    const api = new SystemApi(client)
    await api.getOnlineClients()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_online_clients', {})
  })
  it('checkUrlSafely 检查链接安全性', async () => {
    const client = mockClient({ level: 1 })
    const api = new SystemApi(client)
    await api.checkUrlSafely('https://example.com')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('check_url_safely', {
      url: 'https://example.com',
    })
  })
  it('getRobotUinRange 获取机器人 UIN 范围', async () => {
    const client = mockClient({ min_uin: 10000, max_uin: 99999 })
    const api = new SystemApi(client)
    await api.getRobotUinRange()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_robot_uin_range', {})
  })
  it('ncGetPacketStatus 获取数据包状态', async () => {
    const client = mockClient({ online: true, good: true })
    const api = new SystemApi(client)
    await api.ncGetPacketStatus()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('nc_get_packet_status', {})
  })
  it('getDoubtFriendsAddRequest 获取存疑好友请求', async () => {
    const client = mockClient({})
    const api = new SystemApi(client)
    await api.getDoubtFriendsAddRequest()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_doubt_friends_add_request',
      {},
    )
  })
  it('setDoubtFriendsAddRequest 处理存疑好友请求', async () => {
    const client = mockClient()
    const api = new SystemApi(client)
    await api.setDoubtFriendsAddRequest({ flag: 'abc', approve: true })
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'set_doubt_friends_add_request',
      {
        flag: 'abc',
        approve: true,
      },
    )
  })
})
