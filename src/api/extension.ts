import type { Result } from '../core'
import type { AiCharacter, RkeyInfo, CollectionItem } from '../types'

import { BaseApi } from './base.js'

/** NapCat 扩展 API 模块。 */
export class ExtensionApi extends BaseApi {
  /**
   * 设置消息表情回应。
   * @param messageId - 消息 ID。
   * @param emojiId - 表情 ID。
   * @returns 无返回值。
   */
  setMsgEmojiLike(messageId: number, emojiId: string): Promise<Result<void>> {
    return this.invoke('set_msg_emoji_like', { message_id: messageId, emoji_id: emojiId })
  }

  /**
   * 获取 AI 语音角色列表。
   * @param groupId - 群号。
   * @param chatType - 聊天类型。
   * @returns AI 语音角色列表。
   */
  getAiCharacters(groupId: number, chatType?: number): Promise<Result<AiCharacter[]>> {
    return this.invoke('get_ai_characters', { group_id: groupId, chat_type: chatType })
  }

  /**
   * 获取 AI 语音。
   * @param character - 角色名。
   * @param text - 文本内容。
   * @param groupId - 群号。
   * @returns AI 语音 URL。
   */
  getAiRecord(character: string, text: string, groupId?: number): Promise<Result<{ url: string }>> {
    return this.invoke('get_ai_record', { character, text, group_id: groupId })
  }

  /**
   * 群聊发送 AI 语音。
   * @param groupId - 群号。
   * @param character - 角色名。
   * @param text - 文本内容。
   * @returns 无返回值。
   */
  sendGroupAiRecord(groupId: number, character: string, text: string): Promise<Result<void>> {
    return this.invoke('send_group_ai_record', { group_id: groupId, character, text })
  }

  /**
   * 设置在线状态。
   * @param status - 在线状态值。
   * @param extStatus - 扩展状态值。
   * @param batteryStatus - 电量状态。
   * @returns 无返回值。
   */
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

  /**
   * 设置输入状态。
   * @param userId - 目标 QQ 号。
   * @param eventType - 输入状态事件类型。
   * @returns 无返回值。
   */
  setInputStatus(userId: number, eventType: number): Promise<Result<void>> {
    return this.invoke('set_input_status', { user_id: userId, event_type: eventType })
  }

  /**
   * 获取 Rkey（NapCat 扩展接口）。
   * @returns Rkey 信息列表。
   */
  getRkey(): Promise<Result<RkeyInfo[]>> {
    return this.invoke('nc_get_rkey')
  }

  /**
   * 获取群忽略添加请求列表。
   * @returns 群忽略添加请求列表。
   */
  getGroupIgnoreAddRequest(): Promise<Result<unknown[]>> {
    return this.invoke('get_group_ignore_add_request')
  }

  /**
   * 获取小程序 Ark 签名。
   * @param params - Ark 签名参数。
   * @returns 小程序 Ark 签名数据。
   */
  getMiniAppArk(params: Record<string, unknown>): Promise<Result<{ data: string }>> {
    return this.invoke('get_mini_app_ark', params)
  }

  /**
   * 英译中翻译。
   * @param words - 待翻译的单词数组。
   * @returns 翻译结果数组。
   */
  translateEn2Zh(words: string[]): Promise<Result<string[]>> {
    return this.invoke('translate_en2zh', { words })
  }

  /**
   * 推荐联系人/群聊（Ark 分享）。
   * @param phoneNumber - 手机号。
   * @param userId - 推荐联系人的 QQ 号。
   * @param groupId - 推荐群的群号。
   * @returns 无返回值。
   */
  arkSharePeer(phoneNumber: string, userId?: number, groupId?: number): Promise<Result<void>> {
    return this.invoke('ArkSharePeer', {
      phone_number: phoneNumber,
      user_id: userId,
      group_id: groupId,
    })
  }

  /**
   * 推荐群聊（Ark 分享）。
   * @param groupId - 群号。
   * @returns 无返回值。
   */
  arkShareGroup(groupId: number): Promise<Result<void>> {
    return this.invoke('ArkShareGroup', { group_id: groupId })
  }

  /**
   * 创建收藏。
   * @param rawData - 收藏原始数据。
   * @param brief - 收藏摘要。
   * @returns 无返回值。
   */
  createCollection(rawData: string, brief: string): Promise<Result<void>> {
    return this.invoke('create_collection', { rawData, brief })
  }

  /**
   * 获取收藏列表。
   * @param category - 收藏分类。
   * @param count - 获取数量。
   * @returns 收藏列表。
   */
  getCollectionList(category?: string, count?: number): Promise<Result<CollectionItem[]>> {
    return this.invoke('get_collection_list', { category, count })
  }

  /**
   * 获取收藏表情。
   * @param count - 获取数量。
   * @returns 收藏表情数据。
   */
  fetchCustomFace(count?: number): Promise<Result<unknown>> {
    return this.invoke('fetch_custom_face', { count })
  }

  // === 4.18.9+ 扩展端点 ===

  /**
   * 添加自定义表情。
   * @param file - 表情文件路径。
   * @param params - 表情参数，包含表情 ID、包 ID、文件名、MD5 等。
   * @returns 无返回值。
   */
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

  /**
   * 删除自定义表情。
   * @param params - 删除参数，包含 resId、id、ids、md5 等。
   * @returns 无返回值。
   */
  deleteCustomFace(params?: {
    resId?: string
    id?: string
    ids?: string[]
    md5?: string
  }): Promise<Result<void>> {
    return this.invoke('delete_custom_face', params ?? {})
  }

  /**
   * 获取自定义表情详情。
   * @param count - 获取数量。
   * @returns 自定义表情详情。
   */
  fetchCustomFaceDetail(count?: number): Promise<Result<unknown>> {
    return this.invoke('fetch_custom_face_detail', { count })
  }

  /**
   * 修改自定义表情描述。
   * @param emojiId - 表情 ID。
   * @param resId - 资源 ID。
   * @param md5 - 文件 MD5。
   * @param desc - 描述内容。
   * @returns 无返回值。
   */
  setCustomFaceDesc(
    emojiId: string,
    resId: string,
    md5: string,
    desc: string,
  ): Promise<Result<void>> {
    return this.invoke('set_custom_face_desc', { emoji_id: emojiId, res_id: resId, md5, desc })
  }

  /**
   * 发送闪传消息。
   * @param filesetId - 文件集 ID。
   * @param userId - 目标 QQ 号（私聊时使用）。
   * @param groupId - 目标群号（群聊时使用）。
   * @returns 无返回值。
   */
  sendFlashMsg(filesetId: string, userId?: number, groupId?: number): Promise<Result<void>> {
    return this.invoke('send_flash_msg', {
      fileset_id: filesetId,
      user_id: userId,
      group_id: groupId,
    })
  }

  /**
   * 获取消息表情点赞列表。
   * @param groupId - 群号。
   * @param messageId - 消息 ID。
   * @param emojiId - 表情 ID。
   * @param count - 获取数量。
   * @param emojiType - 表情类型。
   * @returns 消息表情点赞列表。
   */
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

  /**
   * 获取语音转文字结果。
   * @param messageId - 消息 ID。
   * @returns 语音转文字结果。
   */
  fetchPttText(messageId: string): Promise<Result<{ text: string }>> {
    return this.invoke('fetch_ptt_text', { message_id: messageId })
  }

  /**
   * 获取频道列表。
   * @returns 频道列表。
   */
  getGuildList(): Promise<Result<unknown[]>> {
    return this.invoke('get_guild_list')
  }

  /**
   * 获取频道个人信息。
   * @returns 频道个人信息。
   */
  getGuildServiceProfile(): Promise<Result<unknown>> {
    return this.invoke('get_guild_service_profile')
  }

  /**
   * 获取扩展 RKey。
   * @returns RKey 信息列表。
   */
  getRkeyV2(): Promise<Result<RkeyInfo[]>> {
    return this.invoke('get_rkey')
  }

  /**
   * 获取 RKey 服务器。
   * @returns RKey 服务器信息。
   */
  getRkeyServer(): Promise<Result<unknown>> {
    return this.invoke('get_rkey_server')
  }

  /**
   * 发送原始数据包。
   * @param cmd - 命令名。
   * @param data - 数据内容。
   * @param rsp - 响应类型。
   * @returns 原始数据包响应。
   */
  sendPacket(cmd: string, data: string, rsp?: string): Promise<Result<unknown>> {
    return this.invoke('send_packet', { cmd, data, rsp })
  }

  /**
   * 分享用户（Ark 新接口）。
   * @param phoneNumber - 手机号。
   * @param userId - 推荐联系人的 QQ 号。
   * @param groupId - 推荐群的群号。
   * @returns 无返回值。
   */
  sendArkShare(phoneNumber: string, userId?: number, groupId?: number): Promise<Result<void>> {
    return this.invoke('send_ark_share', {
      phone_number: phoneNumber,
      user_id: userId,
      group_id: groupId,
    })
  }

  /**
   * 分享群（Ark 新接口）。
   * @param groupId - 群号。
   * @returns 无返回值。
   */
  sendGroupArkShare(groupId: number): Promise<Result<void>> {
    return this.invoke('send_group_ark_share', { group_id: groupId })
  }
}
