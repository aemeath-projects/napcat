import type { Result } from '../core'
import type {
  QzoneCommentByFeedRefParams,
  QzoneCommentListParams,
  QzoneCommentPage,
  QzoneCommentParams,
  QzoneCommentRepliesParams,
  QzoneCommentReplyPage,
  QzoneCommentResult,
  QzoneCommentResultByFeedRef,
  QzoneCommentResultByTid,
  QzoneFeedPage,
  QzoneFeedsNativeParams,
  QzoneFeedsParams,
  QzoneFeedsSnowlumaParams,
  QzoneId,
  QzoneLikeParams,
  QzoneMsgDetail,
  QzoneMsgDetailByFeedRefParams,
  QzoneMsgDetailByTidParams,
  QzoneMsgDetailParams,
  QzoneMsgListNativeParams,
  QzoneMsgListPage,
  QzoneMsgListParams,
  QzoneMsgListSnowlumaParams,
  QzoneMsgRightResult,
  QzoneNativeFeedPage,
  QzoneNativeMsgDetail,
  QzoneNativeMsgListPage,
  QzoneProfileInfo,
  QzonePublicCapabilities,
  QzonePublicComment,
  QzonePublicCommentLikeParams,
  QzonePublicFeed,
  QzonePublicFeedPage,
  QzonePublicFeedsParams,
  QzonePublicRepliesParams,
  QzonePublicResult,
  QzonePublicReply,
  QzoneReplyByTidParams,
  QzoneRichText,
  QzoneSendMsgParams,
  QzoneSendMsgResult,
  QzoneSetMsgRightParams,
  QzoneSetProfileParams,
  QzoneTopLevelCommentByTidParams,
} from '../types'

import { BaseApi } from './base.js'

/**
 * QQ 空间 API 模块（NapCat 4.18.42+）。
 *
 * `feedRef`、`feed`、`comment`、`reply` 均为不透明对象，必须传回本 SDK
 * 返回的完整对象，不能拆字段重建或由 tid 拼造。
 */
export class QzoneApi extends BaseApi {
  /**
   * 发表 QQ 空间说说，支持纯文字或带图，可设置查看权限。
   * @param content - 说说正文。
   * @param params - 可选参数：图片数组、查看权限、权限作用的 QQ 号数组。
   * @returns 说说 tid 与发表时间。
   */
  sendQzoneMsg(content: string, params?: QzoneSendMsgParams): Promise<Result<QzoneSendMsgResult>> {
    return this.invoke('send_qzone_msg', {
      content,
      images: params?.images,
      ugc_right: params?.ugcRight,
      target_uins: params?.targetUins,
    })
  }

  /**
   * 删除 QQ 空间说说。
   * @param tid - 说说 tid。
   * @returns 无返回值。
   */
  deleteQzoneMsg(tid: QzoneId): Promise<Result<void>> {
    return this.invoke('delete_qzone_msg', { tid })
  }

  /**
   * 获取 QQ 空间好友动态。
   * @param params - native 模式参数；default 返回 SnowLuma 格式。
   * @returns native 模式返回 H5 Feed 列表，其余返回 SnowLuma 列表。
   */
  getQzoneFeeds(params: QzoneFeedsNativeParams): Promise<Result<QzoneNativeFeedPage>>
  getQzoneFeeds(params?: QzoneFeedsSnowlumaParams): Promise<Result<QzoneFeedPage>>
  getQzoneFeeds(params?: QzoneFeedsParams): Promise<Result<QzoneFeedPage | QzoneNativeFeedPage>>
  getQzoneFeeds(params?: QzoneFeedsParams): Promise<Result<QzoneFeedPage | QzoneNativeFeedPage>> {
    return this.invoke('get_qzone_feeds', {
      format: params?.format,
      page_num: params?.pageNum,
      count: params?.count,
      cursor: params?.cursor,
    })
  }

  /**
   * 获取 QQ 空间说说列表。
   *
   * cursor 分页与 pos/num 偏移分页不能混用；仅传旧 cursor 时上游自动选择 native。
   * @param params - 分页参数。
   * @returns native 模式返回 H5 列表，其余返回 SnowLuma 列表。
   */
  getQzoneMsgList(
    params: QzoneMsgListNativeParams | (QzoneMsgListParams & { cursor: string }),
  ): Promise<Result<QzoneNativeMsgListPage>>
  getQzoneMsgList(params?: QzoneMsgListSnowlumaParams): Promise<Result<QzoneMsgListPage>>
  getQzoneMsgList(
    params?: QzoneMsgListParams,
  ): Promise<Result<QzoneMsgListPage | QzoneNativeMsgListPage>>
  getQzoneMsgList(
    params?: QzoneMsgListParams,
  ): Promise<Result<QzoneMsgListPage | QzoneNativeMsgListPage>> {
    return this.invoke('get_qzone_msg_list', {
      format: params?.format,
      target_uin: params?.targetUin,
      pos: params?.pos,
      num: params?.num,
      cursor: params?.cursor,
    })
  }

  /**
   * 获取 QQ 空间说说详情。
   *
   * tid 定位与 feed_ref 定位不能混用。
   * @param params - tid 或 feed_ref 定位参数。
   * @returns 对应定位方式的详情。
   */
  getQzoneMsgDetail(params: QzoneMsgDetailByFeedRefParams): Promise<Result<QzoneNativeMsgDetail>>
  getQzoneMsgDetail(params: QzoneMsgDetailByTidParams): Promise<Result<QzoneMsgDetail>>
  getQzoneMsgDetail(
    params: QzoneMsgDetailParams,
  ): Promise<Result<QzoneMsgDetail | QzoneNativeMsgDetail>>
  getQzoneMsgDetail(
    params: QzoneMsgDetailParams,
  ): Promise<Result<QzoneMsgDetail | QzoneNativeMsgDetail>> {
    return this.invoke('get_qzone_msg_detail', {
      feed_ref: params.feedRef,
      tid: params.tid,
      target_uin: params.targetUin,
      pos: params.pos,
      num: params.num,
    })
  }

  /**
   * 获取 QQ 空间说说评论。
   *
   * 不传 cursor 时读取首批评论，之后用返回的 feedRef 与 nextCursor 续页。
   * @param params - 动态引用与可选游标。
   * @returns 评论分页结果。
   */
  getQzoneCommentList(params: QzoneCommentListParams): Promise<Result<QzoneCommentPage>> {
    return this.invoke('get_qzone_comment_list', {
      feed_ref: params.feedRef,
      cursor: params.cursor,
    })
  }

  /**
   * 获取 QQ 空间评论的楼中楼回复。
   * @param params - 动态引用、完整父评论与可选游标。
   * @returns 回复分页结果。
   */
  getQzoneCommentReplies(
    params: QzoneCommentRepliesParams,
  ): Promise<Result<QzoneCommentReplyPage>> {
    return this.invoke('get_qzone_comment_replies', {
      feed_ref: params.feedRef,
      comment: params.comment,
      cursor: params.cursor,
    })
  }

  /**
   * 点赞 QQ 空间说说。
   *
   * tid 定位与 feed_ref 定位不能混用；写入失败不会自动切换定位方式重试。
   * @param params - tid 或 feed_ref 定位参数。
   * @returns 无返回值。
   */
  likeQzone(params: QzoneLikeParams): Promise<Result<void>> {
    return this.invoke('like_qzone', {
      feed_ref: params.feedRef,
      tid: params.tid,
      target_uin: params.targetUin,
      abstime: params.abstime,
    })
  }

  /**
   * 取消点赞 QQ 空间说说。
   *
   * tid 定位与 feed_ref 定位不能混用；写入失败不会自动切换定位方式重试。
   * @param params - tid 或 feed_ref 定位参数。
   * @returns 无返回值。
   */
  unlikeQzone(params: QzoneLikeParams): Promise<Result<void>> {
    return this.invoke('unlike_qzone', {
      feed_ref: params.feedRef,
      tid: params.tid,
      target_uin: params.targetUin,
      abstime: params.abstime,
    })
  }

  /**
   * 评论 QQ 空间说说。
   *
   * 一级评论支持图片；回复须成对提供父评论 ID 与作者 QQ 号，楼中楼仅文字。
   * tid 参数族与 feed_ref 参数族不能混用。
   * @param params - 评论或回复参数。
   * @returns 新评论 ID 与上游返回对象。
   */
  commentQzone(params: QzoneCommentByFeedRefParams): Promise<Result<QzoneCommentResultByFeedRef>>
  commentQzone(
    params: QzoneTopLevelCommentByTidParams | QzoneReplyByTidParams,
  ): Promise<Result<QzoneCommentResultByTid>>
  commentQzone(params: QzoneCommentParams): Promise<Result<QzoneCommentResult>>
  commentQzone(params: QzoneCommentParams): Promise<Result<QzoneCommentResult>> {
    return this.invoke('comment_qzone', {
      feed_ref: params.feedRef,
      tid: params.tid,
      target_uin: params.targetUin,
      content: params.content,
      comment: params.comment,
      reply_user: params.replyUser,
      comment_id: params.commentId,
      comment_uin: params.commentUin,
      reply_uin: params.replyUin,
      reply_name: params.replyName,
      images: params.images,
    })
  }

  /**
   * 获取 QQ 空间资料。
   * @param targetUin - 空间所属 QQ 号；不传时为当前账号。
   * @returns 空间名称与说明。
   */
  getQzoneProfile(targetUin?: QzoneId): Promise<Result<QzoneProfileInfo>> {
    return this.invoke('get_qzone_profile', { target_uin: targetUin })
  }

  /**
   * 修改当前账号的 QQ 空间资料。
   *
   * name 与 description 至少提供一项；省略字段保持不变，空字符串表示清空。
   * @param params - 空间名称与说明。
   * @returns 无返回值。
   */
  setQzoneProfile(params: QzoneSetProfileParams): Promise<Result<void>> {
    return this.invoke('set_qzone_profile', {
      name: params.name,
      description: params.description,
    })
  }

  /**
   * 修改当前账号发表的说说权限。
   * @param params - 说说 tid、查看权限与目标 QQ 号列表。
   * @returns 设置成功的查看权限。
   */
  setQzoneMsgRight(params: QzoneSetMsgRightParams): Promise<Result<QzoneMsgRightResult>> {
    return this.invoke('set_qzone_msg_right', {
      tid: params.tid,
      ugc_right: params.ugcRight,
      target_uins: params.targetUins,
    })
  }

  /**
   * 设置指定用户访问当前账号空间的限制。
   * @param userId - 需要设置访问限制的 QQ 号。
   * @param enable - 是否禁止访问，默认 true；传 false 取消禁止。
   * @returns 无返回值。
   */
  setQzoneBan(userId: QzoneId, enable?: boolean): Promise<Result<void>> {
    return this.invoke('set_qzone_ban', { user_id: userId, enable })
  }

  /**
   * 获取空友爱看接口能力，不会执行写操作。
   * @returns 当前 QQ 版本与账号可用的能力。
   */
  getQzonePublicCapabilities(): Promise<Result<QzonePublicCapabilities>> {
    return this.invoke('get_qzone_public_capabilities')
  }

  /**
   * 获取空友爱看动态列表。
   * @param params - 上一页返回的 nextCursor；首次请求可省略。
   * @returns 完整动态对象列表与下一页游标。
   */
  getQzonePublicFeeds(params?: QzonePublicFeedsParams): Promise<Result<QzonePublicFeedPage>> {
    return this.invoke('get_qzone_public_feeds', { cursor: params?.cursor })
  }

  /**
   * 获取空友爱看动态详情。
   *
   * 继续读取评论时，将详情返回的 attachInfo 作为 cursor。
   * @param feed - 列表返回的完整动态对象。
   * @returns 动态详情。
   */
  getQzonePublicFeedDetail(feed: QzonePublicFeed): Promise<Result<QzonePublicResult>> {
    return this.invoke('get_qzone_public_feed_detail', { feed })
  }

  /**
   * 获取空友爱看动态的后续评论。
   * @param feed - 列表返回的完整动态对象。
   * @param cursor - 动态详情或上一评论页返回的 attachInfo。
   * @returns 评论分页结果。
   */
  getQzonePublicComments(
    feed: QzonePublicFeed,
    cursor: string,
  ): Promise<Result<QzonePublicResult>> {
    return this.invoke('get_qzone_public_comments', { feed, cursor })
  }

  /**
   * 获取空友爱看评论的回复分页。
   * @param feed - 完整动态对象。
   * @param comment - 详情或评论列表返回的完整评论对象。
   * @param params - 可选游标与每页数量；省略游标时使用父评论的回复游标。
   * @returns 回复分页结果。
   */
  getQzonePublicReplies(
    feed: QzonePublicFeed,
    comment: QzonePublicComment,
    params?: QzonePublicRepliesParams,
  ): Promise<Result<QzonePublicResult>> {
    return this.invoke('get_qzone_public_replies', {
      feed,
      comment,
      cursor: params?.cursor,
      page_size: params?.pageSize,
    })
  }

  /**
   * 推或取消推空友爱看动态。
   *
   * 与普通点赞分别处理。
   * @param feed - 完整动态对象。
   * @param enable - 是否启用，默认 true。
   * @returns 上游操作结果。
   */
  setQzonePublicUpvote(
    feed: QzonePublicFeed,
    enable?: boolean,
  ): Promise<Result<QzonePublicResult>> {
    return this.invoke('set_qzone_public_upvote', { feed, enable })
  }

  /**
   * 设置空友爱看动态的普通赞。
   *
   * 与推分别处理。
   * @param feed - 完整动态对象。
   * @param enable - 是否启用，默认 true。
   * @returns 上游操作结果。
   */
  setQzonePublicLike(feed: QzonePublicFeed, enable?: boolean): Promise<Result<QzonePublicResult>> {
    return this.invoke('set_qzone_public_like', { feed, enable })
  }

  /**
   * 蹲或取消蹲空友爱看动态作者。
   * @param feed - 完整动态对象。
   * @param enable - 是否启用，默认 true。
   * @returns 上游操作结果。
   */
  setQzonePublicFollow(
    feed: QzonePublicFeed,
    enable?: boolean,
  ): Promise<Result<QzonePublicResult>> {
    return this.invoke('set_qzone_public_follow', { feed, enable })
  }

  /**
   * 设置空友爱看评论或回复的赞。
   * @param feed - 完整动态对象。
   * @param comment - 完整评论对象，需保留 like.id 等字段。
   * @param params - 可选完整回复对象与是否启用；传 reply 时操作该回复。
   * @returns 上游操作结果。
   */
  setQzonePublicCommentLike(
    feed: QzonePublicFeed,
    comment: QzonePublicComment,
    params?: QzonePublicCommentLikeParams,
  ): Promise<Result<QzonePublicResult>> {
    return this.invoke('set_qzone_public_comment_like', {
      feed,
      comment,
      reply: params?.reply,
      enable: params?.enable,
    })
  }

  /**
   * 评论空友爱看动态。
   * @param feed - 完整动态对象。
   * @param content - 非空文本或非空富文本对象数组。
   * @returns 上游操作结果。
   */
  commentQzonePublicFeed(
    feed: QzonePublicFeed,
    content: string | QzoneRichText[],
  ): Promise<Result<QzonePublicResult>> {
    return this.invoke('comment_qzone_public_feed', { feed, content })
  }

  /**
   * 回复空友爱看评论。
   * @param feed - 完整动态对象。
   * @param comment - 完整父评论对象。
   * @param content - 非空文本或非空富文本对象数组。
   * @param reply - 需要回复已有回复时传入完整回复对象。
   * @returns 上游操作结果。
   */
  replyQzonePublicFeed(
    feed: QzonePublicFeed,
    comment: QzonePublicComment,
    content: string | QzoneRichText[],
    reply?: QzonePublicReply,
  ): Promise<Result<QzonePublicResult>> {
    return this.invoke('reply_qzone_public_feed', { feed, comment, content, reply })
  }

  /**
   * 删除空友爱看评论，操作权限由上游校验。
   * @param feed - 完整动态对象。
   * @param comment - 完整评论对象。
   * @returns 上游操作结果。
   */
  deleteQzonePublicComment(
    feed: QzonePublicFeed,
    comment: QzonePublicComment,
  ): Promise<Result<QzonePublicResult>> {
    return this.invoke('delete_qzone_public_comment', { feed, comment })
  }

  /**
   * 删除空友爱看回复，操作权限由上游校验。
   * @param feed - 完整动态对象。
   * @param comment - 完整父评论对象。
   * @param reply - 完整目标回复对象。
   * @returns 上游操作结果。
   */
  deleteQzonePublicReply(
    feed: QzonePublicFeed,
    comment: QzonePublicComment,
    reply: QzonePublicReply,
  ): Promise<Result<QzonePublicResult>> {
    return this.invoke('delete_qzone_public_reply', { feed, comment, reply })
  }

  /**
   * 转发空友爱看动态到自己的空间。
   * @param feed - 完整动态对象。
   * @param reason - 转发附言，默认空字符串。
   * @returns 上游操作结果。
   */
  forwardQzonePublicFeed(
    feed: QzonePublicFeed,
    reason?: string,
  ): Promise<Result<QzonePublicResult>> {
    return this.invoke('forward_qzone_public_feed', { feed, reason })
  }
}
