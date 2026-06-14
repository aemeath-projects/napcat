import type { Result } from '../core/result.js'
import type {
  AiCharacter,
  RkeyInfo,
  IgnoredRequest,
  MiniAppParams,
  CollectionItem,
  CreateCollectionParams,
  CustomFaceParams,
} from '../types/api.js'

import { BaseApi } from './base.js'

/** NapCat 扩展 API 模块。 */
export class ExtensionApi extends BaseApi {
  /** 私聊戳一戳。 */
  friendPoke(userId: number): Promise<Result<void>> {
    return this.invoke('friend_poke', { user_id: userId })
  }

  /** 群聊戳一戳。 */
  groupPoke(groupId: number, userId: number): Promise<Result<void>> {
    return this.invoke('group_poke', { group_id: groupId, user_id: userId })
  }

  /** 设置消息表情回应。 */
  setMsgEmojiLike(messageId: number, emojiId: string): Promise<Result<void>> {
    return this.invoke('set_msg_emoji_like', { message_id: messageId, emoji_id: emojiId })
  }

  /** 获取 AI 语音角色列表。 */
  getAiCharacters(groupId?: number): Promise<Result<AiCharacter[]>> {
    return this.invoke('get_ai_characters', { group_id: groupId })
  }

  /** 获取 AI 语音。 */
  getAiRecord(character: string, text: string, groupId?: number): Promise<Result<{ url: string }>> {
    return this.invoke('get_ai_record', { character, text, group_id: groupId })
  }

  /** 群聊发送 AI 语音。 */
  sendGroupAiRecord(groupId: number, character: string, text: string): Promise<Result<void>> {
    return this.invoke('send_group_ai_record', { group_id: groupId, character, text })
  }

  /** 设置在线状态。 */
  setOnlineStatus(status: number, extStatus: number): Promise<Result<void>> {
    return this.invoke('set_online_status', { status, ext_status: extStatus })
  }

  /** 设置输入状态。 */
  setInputStatus(eventType: number, userId: number): Promise<Result<void>> {
    return this.invoke('set_input_status', { event_type: eventType, user_id: userId })
  }

  /** 获取 Rkey（NapCat 扩展接口，action 名称为 nc_get_rkey）。 */
  getRkey(): Promise<Result<RkeyInfo[]>> {
    return this.invoke('nc_get_rkey')
  }

  /** 获取群忽略添加请求列表。 */
  getGroupIgnoreAddRequest(groupId: number): Promise<Result<IgnoredRequest[]>> {
    return this.invoke('get_group_ignore_add_request', { group_id: groupId })
  }

  /** 获取小程序 Ark 签名。 */
  getMiniAppArk(params: MiniAppParams): Promise<Result<{ data: string }>> {
    return this.invoke('get_mini_app_ark', params)
  }

  /** 英译中翻译。 */
  translateEn2Zh(words: string[]): Promise<Result<string[]>> {
    return this.invoke('translate_en2zh', { words })
  }

  /** 推荐联系人/群聊（Ark 分享）。 */
  arkSharePeer(params: Record<string, unknown>): Promise<Result<void>> {
    return this.invoke('ArkSharePeer', params)
  }

  /** 推荐群聊（Ark 分享）。 */
  arkShareGroup(params: Record<string, unknown>): Promise<Result<void>> {
    return this.invoke('ArkShareGroup', params)
  }

  /** 创建文本收藏。 */
  createCollection(params: CreateCollectionParams): Promise<Result<void>> {
    return this.invoke('create_collection', params)
  }

  /** 获取收藏列表。 */
  getCollectionList(): Promise<Result<CollectionItem[]>> {
    return this.invoke('get_collection_list')
  }

  /** 获取收藏表情。 */
  fetchCustomFace(params?: CustomFaceParams): Promise<Result<unknown>> {
    return this.invoke('fetch_custom_face', params ?? {})
  }

  /** 标记所有消息已读。 */
  markAllAsRead(): Promise<Result<void>> {
    return this.invoke('_mark_all_as_read')
  }

  /** 转发单条消息到群聊。 */
  forwardGroupSingleMsg(groupId: number, messageId: string): Promise<Result<void>> {
    return this.invoke('forward_group_single_msg', {
      group_id: groupId,
      message_id: messageId,
    })
  }
}
