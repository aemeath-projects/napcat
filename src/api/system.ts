import type { Result } from '../core/result.js'
import type { LoginInfo, VersionInfo, BotStatus, StrangerInfo, OcrResult } from '../types/api.js'

import { BaseApi } from './base.js'

export class SystemApi extends BaseApi {
  getLoginInfo(): Promise<Result<LoginInfo>> {
    return this.invoke('get_login_info')
  }
  getVersionInfo(): Promise<Result<VersionInfo>> {
    return this.invoke('get_version_info')
  }
  getStatus(): Promise<Result<BotStatus>> {
    return this.invoke('get_status')
  }
  canSendImage(): Promise<Result<{ yes: boolean }>> {
    return this.invoke('can_send_image')
  }
  canSendRecord(): Promise<Result<{ yes: boolean }>> {
    return this.invoke('can_send_record')
  }
  getStrangerInfo(userId: number): Promise<Result<StrangerInfo>> {
    return this.invoke('get_stranger_info', { user_id: userId })
  }
  getCookies(domain?: string): Promise<Result<{ cookies: string }>> {
    return this.invoke('get_cookies', { domain })
  }
  getCsrfToken(): Promise<Result<{ token: number }>> {
    return this.invoke('get_csrf_token')
  }
  cleanCache(): Promise<Result<void>> {
    return this.invoke('clean_cache')
  }
  getImage(file: string): Promise<Result<{ file: string }>> {
    return this.invoke('get_image', { file })
  }
  getRecord(file: string, format: string): Promise<Result<{ file: string }>> {
    return this.invoke('get_record', { file, out_format: format })
  }
  ocrImage(image: string): Promise<Result<OcrResult>> {
    return this.invoke('ocr_image', { image })
  }
}
