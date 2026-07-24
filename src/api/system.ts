import type { Result } from '../core'
import type {
  LoginInfo,
  VersionInfo,
  BotStatus,
  StrangerInfo,
  OcrResult,
  OnlineClient,
  ModelShow,
  RobotUinRange,
  PacketStatus,
  Credentials,
  ClientKey,
  UrlSafety,
} from '../types'

import { BaseApi } from './base.js'

/** 系统/账号相关 API 模块。 */
export class SystemApi extends BaseApi {
  /**
   * 获取登录号信息。
   * @returns 登录号信息。
   */
  getLoginInfo(): Promise<Result<LoginInfo>> {
    return this.invoke('get_login_info')
  }

  /**
   * 获取版本信息。
   * @returns 版本信息。
   */
  getVersionInfo(): Promise<Result<VersionInfo>> {
    return this.invoke('get_version_info')
  }

  /**
   * 获取运行状态。
   * @returns 运行状态。
   */
  getStatus(): Promise<Result<BotStatus>> {
    return this.invoke('get_status')
  }

  /**
   * 检查是否可以发送图片。
   * @returns 检查结果，包含是否可发送图片。
   */
  canSendImage(): Promise<Result<{ yes: boolean }>> {
    return this.invoke('can_send_image')
  }

  /**
   * 检查是否可以发送语音。
   * @returns 检查结果，包含是否可发送语音。
   */
  canSendRecord(): Promise<Result<{ yes: boolean }>> {
    return this.invoke('can_send_record')
  }

  /**
   * 获取陌生人信息。
   * @param userId - QQ 号。
   * @param noCache - 是否跳过缓存，默认从缓存获取。
   * @returns 陌生人信息。
   */
  getStrangerInfo(userId: number, noCache?: boolean): Promise<Result<StrangerInfo>> {
    return this.invoke('get_stranger_info', { user_id: userId, no_cache: noCache })
  }

  /**
   * 获取 Cookies。
   * @param domain - 域名，不传则获取默认域名的 Cookies。
   * @returns Cookies 信息，包含 cookies 字符串。
   */
  getCookies(domain?: string): Promise<Result<{ cookies: string }>> {
    return this.invoke('get_cookies', { domain })
  }

  /**
   * 获取 CSRF Token。
   * @returns CSRF Token 信息，包含 token 值。
   */
  getCsrfToken(): Promise<Result<{ token: number }>> {
    return this.invoke('get_csrf_token')
  }

  /**
   * 获取 QQ 相关接口凭证。
   * @param domain - 域名，不传则获取默认域名的凭证。
   * @returns QQ 接口凭证。
   */
  getCredentials(domain?: string): Promise<Result<Credentials>> {
    return this.invoke('get_credentials', { domain })
  }

  /**
   * 获取客户端密钥。
   * @returns 客户端密钥信息。
   */
  getClientkey(): Promise<Result<ClientKey>> {
    return this.invoke('get_clientkey')
  }

  /**
   * 清理缓存。
   * @returns 无返回值。
   */
  cleanCache(): Promise<Result<void>> {
    return this.invoke('clean_cache')
  }

  /**
   * 获取图片。
   * @param file - 图片文件路径或缓存标识。
   * @returns 图片文件信息，包含文件路径。
   */
  getImage(file: string): Promise<Result<{ file: string }>> {
    return this.invoke('get_image', { file })
  }

  /**
   * 获取语音。
   * @param file - 语音文件路径或缓存标识。
   * @param outFormat - 输出格式，如 'mp3'。
   * @returns 语音文件信息，包含文件路径。
   */
  getRecord(file?: string, outFormat?: string): Promise<Result<{ file: string }>> {
    return this.invoke('get_record', { file, out_format: outFormat })
  }

  /**
   * 图片 OCR 识别。
   * @param image - 图片路径或缓存标识。
   * @returns OCR 识别结果。
   */
  ocrImage(image: string): Promise<Result<OcrResult>> {
    return this.invoke('ocr_image', { image })
  }

  /**
   * 设置登录号资料。
   * @param nickname - 昵称。
   * @param personalNote - 个性签名。
   * @param sex - 性别，'male'/'female'/0/1。
   * @returns 无返回值。
   */
  setQQProfile(
    nickname: string,
    personalNote?: string,
    sex?: number | string,
  ): Promise<Result<void>> {
    return this.invoke('set_qq_profile', { nickname, personal_note: personalNote, sex })
  }

  /**
   * 设置 QQ 头像。
   * @param file - 头像文件路径。
   * @returns 无返回值。
   */
  setQQAvatar(file: string): Promise<Result<void>> {
    return this.invoke('set_qq_avatar', { file })
  }

  /**
   * 退出机器人。
   * @returns 无返回值。
   */
  botExit(): Promise<Result<void>> {
    return this.invoke('bot_exit')
  }

  /**
   * 设置个性签名。
   * @param longNick - 个性签名内容。
   * @returns 无返回值。
   */
  setSelfLongnick(longNick: string): Promise<Result<void>> {
    return this.invoke('set_self_longnick', { longNick })
  }

  /**
   * 设置自定义在线状态。
   * @param faceId - 表情 ID。
   * @param faceType - 表情类型。
   * @param wording - 状态文案。
   * @returns 无返回值。
   */
  setDiyOnlineStatus(
    faceId: number | string,
    faceType: number | string,
    wording: string,
  ): Promise<Result<void>> {
    return this.invoke('set_diy_online_status', { face_id: faceId, face_type: faceType, wording })
  }

  /**
   * 获取在线机型（兼容 go-cqhttp）。
   * @returns 在线机型信息。
   */
  getModelShow(): Promise<Result<ModelShow>> {
    return this.invoke('_get_model_show')
  }

  /**
   * 设置在线机型（兼容 go-cqhttp）。
   * @returns 无返回值。
   */
  setModelShow(): Promise<Result<void>> {
    return this.invoke('_set_model_show')
  }

  /**
   * 获取当前账号在线客户端列表。
   * @returns 在线客户端列表。
   */
  getOnlineClients(): Promise<Result<OnlineClient[]>> {
    return this.invoke('get_online_clients')
  }

  /**
   * 检查链接安全性。
   * @param url - 待检查的 URL。
   * @returns 链接安全性检查结果。
   */
  checkUrlSafely(url: string): Promise<Result<UrlSafety>> {
    return this.invoke('check_url_safely', { url })
  }

  /**
   * 获取机器人 QQ 号区间。
   * @returns 机器人 QQ 号区间信息。
   */
  getRobotUinRange(): Promise<Result<RobotUinRange>> {
    return this.invoke('get_robot_uin_range')
  }

  /**
   * 获取 PacketServer 状态（NapCat 扩展）。
   * @returns PacketServer 状态信息。
   */
  ncGetPacketStatus(): Promise<Result<PacketStatus>> {
    return this.invoke('nc_get_packet_status')
  }

  /**
   * 获取可疑好友添加请求。
   * @param count - 获取数量。
   * @returns 可疑好友添加请求列表。
   */
  getDoubtFriendsAddRequest(count?: number): Promise<Result<unknown>> {
    return this.invoke('get_doubt_friends_add_request', { count })
  }

  /**
   * 处理可疑好友添加请求。
   * @param flag - 请求标识。
   * @param approve - 是否同意。
   * @returns 无返回值。
   */
  setDoubtFriendsAddRequest(flag: string, approve: boolean): Promise<Result<void>> {
    return this.invoke('set_doubt_friends_add_request', { flag, approve })
  }

  /**
   * 重启服务。
   * @returns 无返回值。
   */
  setRestart(): Promise<Result<void>> {
    return this.invoke('set_restart')
  }
}
