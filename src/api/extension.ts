import type { Result } from '../core/result.js'
import type { AiCharacter, RkeyInfo, IgnoredRequest, MiniAppParams } from '../types/api.js'

import { BaseApi } from './base.js'

export class ExtensionApi extends BaseApi {
  friendPoke(userId: number): Promise<Result<void>> {
    return this.invoke('friend_poke', { user_id: userId })
  }
  groupPoke(groupId: number, userId: number): Promise<Result<void>> {
    return this.invoke('group_poke', { group_id: groupId, user_id: userId })
  }
  setMsgEmojiLike(messageId: number, emojiId: string): Promise<Result<void>> {
    return this.invoke('set_msg_emoji_like', { message_id: messageId, emoji_id: emojiId })
  }
  getAiCharacters(groupId?: number): Promise<Result<AiCharacter[]>> {
    return this.invoke('get_ai_characters', { group_id: groupId })
  }
  getAiRecord(character: string, text: string, groupId?: number): Promise<Result<{ url: string }>> {
    return this.invoke('get_ai_record', { character, text, group_id: groupId })
  }
  sendGroupAiRecord(groupId: number, character: string, text: string): Promise<Result<void>> {
    return this.invoke('send_group_ai_record', { group_id: groupId, character, text })
  }
  setOnlineStatus(status: number, extStatus: number): Promise<Result<void>> {
    return this.invoke('set_online_status', { status, ext_status: extStatus })
  }
  setInputStatus(eventType: number, userId: number): Promise<Result<void>> {
    return this.invoke('set_input_status', { event_type: eventType, user_id: userId })
  }
  getRkey(): Promise<Result<RkeyInfo[]>> {
    return this.invoke('get_rkey')
  }
  getGroupIgnoreAddRequest(groupId: number): Promise<Result<IgnoredRequest[]>> {
    return this.invoke('get_group_ignore_add_request', { group_id: groupId })
  }
  getMiniAppArk(params: MiniAppParams): Promise<Result<{ data: string }>> {
    return this.invoke('get_mini_app_ark', params)
  }
  translateEn2Zh(words: string[]): Promise<Result<string[]>> {
    return this.invoke('translate_en2zh', { words })
  }
}
