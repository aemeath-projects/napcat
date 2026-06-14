import type { Result } from '../core/result.js'
import type {
  LoginInfo,
  VersionInfo,
  BotStatus,
  StrangerInfo,
  OcrResult,
  QQProfile,
  OnlineClient,
  ModelShow,
  RobotUinRange,
  PacketStatus,
  Credentials,
  ClientKey,
  UrlSafety,
} from '../types/api.js'

import { BaseApi } from './base.js'

/** 系统/账号相关 API 模块。 */
export class SystemApi extends BaseApi {
  /** 获取登录号信息。 */
  getLoginInfo(): Promise<Result<LoginInfo>> {
    return this.invoke('get_login_info')
  }

  /** 获取版本信息。 */
  getVersionInfo(): Promise<Result<VersionInfo>> {
    return this.invoke('get_version_info')
  }

  /** 获取运行状态。 */
  getStatus(): Promise<Result<BotStatus>> {
    return this.invoke('get_status')
  }

  /** 检查是否可以发送图片。 */
  canSendImage(): Promise<Result<{ yes: boolean }>> {
    return this.invoke('can_send_image')
  }

  /** 检查是否可以发送语音。 */
  canSendRecord(): Promise<Result<{ yes: boolean }>> {
    return this.invoke('can_send_record')
  }

  /** 获取陌生人信息。 */
  getStrangerInfo(userId: number): Promise<Result<StrangerInfo>> {
    return this.invoke('get_stranger_info', { user_id: userId })
  }

  /** 获取 Cookies。 */
  getCookies(domain?: string): Promise<Result<{ cookies: string }>> {
    return this.invoke('get_cookies', { domain })
  }

  /** 获取 CSRF Token。 */
  getCsrfToken(): Promise<Result<{ token: number }>> {
    return this.invoke('get_csrf_token')
  }

  /** 获取 QQ 相关接口凭证。 */
  getCredentials(domain?: string): Promise<Result<Credentials>> {
    return this.invoke('get_credentials', { domain })
  }

  /** 获取客户端密钥。 */
  getClientkey(): Promise<Result<ClientKey>> {
    return this.invoke('get_clientkey')
  }

  /** 清理缓存。 */
  cleanCache(): Promise<Result<void>> {
    return this.invoke('clean_cache')
  }

  /** 获取图片。 */
  getImage(file: string): Promise<Result<{ file: string }>> {
    return this.invoke('get_image', { file })
  }

  /** 获取语音。 */
  getRecord(file: string, format: string): Promise<Result<{ file: string }>> {
    return this.invoke('get_record', { file, out_format: format })
  }

  /** 图片 OCR 识别。 */
  ocrImage(image: string): Promise<Result<OcrResult>> {
    return this.invoke('ocr_image', { image })
  }

  /** 设置登录号资料。 */
  setQQProfile(profile: QQProfile): Promise<Result<void>> {
    return this.invoke('set_qq_profile', profile)
  }

  /** 设置 QQ 头像。 */
  setQQAvatar(file: string): Promise<Result<void>> {
    return this.invoke('set_qq_avatar', { file })
  }

  /** 退出机器人。 */
  botExit(): Promise<Result<void>> {
    return this.invoke('bot_exit')
  }

  /** 设置个性签名。 */
  setSelfLongnick(longNick: string): Promise<Result<void>> {
    return this.invoke('set_self_longnick', { longNick })
  }

  /** 设置自定义在线状态。 */
  setDiyOnlineStatus(
    faceId: number | string,
    faceType: number | string,
    wording: string,
  ): Promise<Result<void>> {
    return this.invoke('set_diy_online_status', { face_id: faceId, face_type: faceType, wording })
  }

  /** 获取在线机型（兼容 go-cqhttp）。 */
  getModelShow(): Promise<Result<ModelShow>> {
    return this.invoke('_get_model_show')
  }

  /** 设置在线机型（兼容 go-cqhttp）。 */
  setModelShow(model: string): Promise<Result<void>> {
    return this.invoke('_set_model_show', { model })
  }

  /** 获取当前账号在线客户端列表。 */
  getOnlineClients(): Promise<Result<OnlineClient[]>> {
    return this.invoke('get_online_clients')
  }

  /** 检查链接安全性。 */
  checkUrlSafely(url: string): Promise<Result<UrlSafety>> {
    return this.invoke('check_url_safely', { url })
  }

  /** 获取机器人 QQ 号区间。 */
  getRobotUinRange(): Promise<Result<RobotUinRange>> {
    return this.invoke('get_robot_uin_range')
  }

  /** 获取 PacketServer 状态（NapCat 扩展）。 */
  ncGetPacketStatus(): Promise<Result<PacketStatus>> {
    return this.invoke('nc_get_packet_status')
  }

  /** 获取可疑好友添加请求。 */
  getDoubtFriendsAddRequest(): Promise<Result<unknown>> {
    return this.invoke('get_doubt_friends_add_request')
  }

  /** 处理可疑好友添加请求。 */
  setDoubtFriendsAddRequest(params: Record<string, unknown>): Promise<Result<void>> {
    return this.invoke('set_doubt_friends_add_request', params)
  }
}
