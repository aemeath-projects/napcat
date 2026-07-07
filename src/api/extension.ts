import type { Result } from '../core'
import type { AiCharacter, RkeyInfo, CollectionItem } from '../types'

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
  getAiCharacters(groupId: number, chatType?: number): Promise<Result<AiCharacter[]>> {
    return this.invoke('get_ai_characters', { group_id: groupId, chat_type: chatType })
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
  setOnlineStatus(
    status: number,
    extStatus: number,
    batteryStatus?: number,
  ): Promise<Result<void>> {
    return this.invoke('set_online_status', {
      status,
      ext_status: extStatus,
      battery_status: batteryStatus,
    })
  }

  /** 设置输入状态。 */
  setInputStatus(userId: number, eventType: number): Promise<Result<void>> {
    return this.invoke('set_input_status', { user_id: userId, event_type: eventType })
  }

  /** 获取 Rkey（NapCat 扩展接口）。 */
  getRkey(): Promise<Result<RkeyInfo[]>> {
    return this.invoke('nc_get_rkey')
  }

  /** 获取群忽略添加请求列表。 */
  getGroupIgnoreAddRequest(): Promise<Result<unknown[]>> {
    return this.invoke('get_group_ignore_add_request')
  }

  /** 获取小程序 Ark 签名。 */
  getMiniAppArk(params: Record<string, unknown>): Promise<Result<{ data: string }>> {
    return this.invoke('get_mini_app_ark', params)
  }

  /** 英译中翻译。 */
  translateEn2Zh(words: string[]): Promise<Result<string[]>> {
    return this.invoke('translate_en2zh', { words })
  }

  /** 推荐联系人/群聊（Ark 分享）。 */
  arkSharePeer(phoneNumber: string, userId?: number, groupId?: number): Promise<Result<void>> {
    return this.invoke('ArkSharePeer', {
      phone_number: phoneNumber,
      user_id: userId,
      group_id: groupId,
    })
  }

  /** 推荐群聊（Ark 分享）。 */
  arkShareGroup(groupId: number): Promise<Result<void>> {
    return this.invoke('ArkShareGroup', { group_id: groupId })
  }

  /** 创建收藏。 */
  createCollection(rawData: string, brief: string): Promise<Result<void>> {
    return this.invoke('create_collection', { rawData, brief })
  }

  /** 获取收藏列表。 */
  getCollectionList(category?: string, count?: number): Promise<Result<CollectionItem[]>> {
    return this.invoke('get_collection_list', { category, count })
  }

  /** 获取收藏表情。 */
  fetchCustomFace(count?: number): Promise<Result<unknown>> {
    return this.invoke('fetch_custom_face', { count })
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

  /* 4.18.8+ 扩展端点 */

  /** 添加自定义表情。 */
  addCustomFace(
    file: string,
    params?: {
      emojiId?: string
      packageId?: string
      fileName?: string
      fileSize?: number
      md5?: string
      isMarkFace?: boolean
      isOrigin?: boolean
    },
  ): Promise<Result<void>> {
    return this.invoke('add_custom_face', { file, ...params })
  }

  /** 删除自定义表情。 */
  deleteCustomFace(params?: {
    resId?: string
    id?: string
    ids?: string[]
    md5?: string
  }): Promise<Result<void>> {
    return this.invoke('delete_custom_face', params ?? {})
  }

  /** 获取自定义表情详情。 */
  fetchCustomFaceDetail(count?: number): Promise<Result<unknown>> {
    return this.invoke('fetch_custom_face_detail', { count })
  }

  /** 修改自定义表情描述。 */
  setCustomFaceDesc(
    emojiId: string,
    resId: string,
    md5: string,
    desc: string,
  ): Promise<Result<void>> {
    return this.invoke('set_custom_face_desc', { emoji_id: emojiId, res_id: resId, md5, desc })
  }

  /** 发送闪传消息。 */
  sendFlashMsg(filesetId: string, userId?: number, groupId?: number): Promise<Result<void>> {
    return this.invoke('send_flash_msg', {
      fileset_id: filesetId,
      user_id: userId,
      group_id: groupId,
    })
  }

  /** 获取消息表情点赞列表。 */
  getEmojiLikes(
    groupId: number,
    messageId: string,
    emojiId: string,
    count: number,
    emojiType?: number,
  ): Promise<Result<unknown>> {
    return this.invoke('get_emoji_likes', {
      group_id: groupId,
      message_id: messageId,
      emoji_id: emojiId,
      count,
      emoji_type: emojiType,
    })
  }

  /** 获取语音转文字结果。 */
  fetchPttText(messageId: string): Promise<Result<{ text: string }>> {
    return this.invoke('fetch_ptt_text', { message_id: messageId })
  }

  /** 获取频道列表。 */
  getGuildList(): Promise<Result<unknown[]>> {
    return this.invoke('get_guild_list')
  }

  /** 获取频道个人信息。 */
  getGuildServiceProfile(): Promise<Result<unknown>> {
    return this.invoke('get_guild_service_profile')
  }

  /** 获取扩展 RKey。 */
  getRkeyV2(): Promise<Result<RkeyInfo[]>> {
    return this.invoke('get_rkey')
  }

  /** 获取 RKey 服务器。 */
  getRkeyServer(): Promise<Result<unknown>> {
    return this.invoke('get_rkey_server')
  }

  /** 发送原始数据包。 */
  sendPacket(cmd: string, data: string, rsp?: string): Promise<Result<unknown>> {
    return this.invoke('send_packet', { cmd, data, rsp })
  }

  /** 分享用户（Ark 新接口）。 */
  sendArkShare(phoneNumber: string, userId?: number, groupId?: number): Promise<Result<void>> {
    return this.invoke('send_ark_share', {
      phone_number: phoneNumber,
      user_id: userId,
      group_id: groupId,
    })
  }

  /** 分享群（Ark 新接口）。 */
  sendGroupArkShare(groupId: number): Promise<Result<void>> {
    return this.invoke('send_group_ark_share', { group_id: groupId })
  }
}
