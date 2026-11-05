import { describe, it, expect, vi, expectTypeOf } from 'vitest'

import { QzoneApi } from '../../../src/api'
import type { NapCatClient } from '../../../src/core'
import type {
  QzoneFeedsParams,
  QzoneLikeParams,
  QzoneMsgDetailParams,
  QzoneMsgListParams,
  QzoneSetMsgRightParams,
  QzoneSetProfileParams,
} from '../../../src/types'

function mockClient(data: unknown = null) {
  return {
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode: 0, data }),
  } as unknown as NapCatClient
}

describe('QQ 空间 API', () => {
  describe('说说与好友动态', () => {
    it('sendQzoneMsg 发表说说并返回 tid 与 time', async () => {
      const client = mockClient({ tid: 'tid_123', time: 1700000000 })
      const api = new QzoneApi(client)
      const result = await api.sendQzoneMsg('今天天气不错', {
        images: ['https://example.com/a.jpg'],
        ugcRight: 1,
        targetUins: [9999],
      })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_qzone_msg', {
        content: '今天天气不错',
        images: ['https://example.com/a.jpg'],
        ugc_right: 1,
        target_uins: [9999],
      })
      expect(result.ok).toBe(true)
      if (result.ok) expect(result.data.time).toBe(1700000000)
    })

    it('sendQzoneMsg 省略可选参数', async () => {
      const client = mockClient({ tid: 'tid_123', time: 0 })
      const api = new QzoneApi(client)
      await api.sendQzoneMsg('仅文字')
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_qzone_msg', {
        content: '仅文字',
        images: undefined,
        ugc_right: undefined,
        target_uins: undefined,
      })
    })

    it('deleteQzoneMsg 删除说说', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.deleteQzoneMsg('tid_123')
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('delete_qzone_msg', {
        tid: 'tid_123',
      })
    })

    it('getQzoneFeeds 使用 SnowLuma 分页', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzoneFeeds({ pageNum: 2, count: 10, cursor: 'c1' })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_qzone_feeds', {
        format: undefined,
        page_num: 2,
        count: 10,
        cursor: 'c1',
      })
    })

    it('getQzoneFeeds native 模式不传页码', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzoneFeeds({ format: 'native', cursor: 'c1' })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_qzone_feeds', {
        format: 'native',
        page_num: undefined,
        count: undefined,
        cursor: 'c1',
      })
    })

    it('getQzoneMsgList 使用偏移分页', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzoneMsgList({ targetUin: 10001, pos: 0, num: 20 })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_qzone_msg_list', {
        format: undefined,
        target_uin: 10001,
        pos: 0,
        num: 20,
        cursor: undefined,
      })
    })

    it('getQzoneMsgList 使用 native 游标', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzoneMsgList({ format: 'native', cursor: 'c1' })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_qzone_msg_list', {
        format: 'native',
        target_uin: undefined,
        pos: undefined,
        num: undefined,
        cursor: 'c1',
      })
    })

    it('getQzoneMsgList 仅传旧游标', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzoneMsgList({ cursor: 'legacy' })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_qzone_msg_list', {
        format: undefined,
        target_uin: undefined,
        pos: undefined,
        num: undefined,
        cursor: 'legacy',
      })
    })

    it('getQzoneMsgDetail 使用 tid 定位', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzoneMsgDetail({ tid: 'tid_1', targetUin: 10001, pos: 0, num: 20 })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_qzone_msg_detail', {
        feed_ref: undefined,
        tid: 'tid_1',
        target_uin: 10001,
        pos: 0,
        num: 20,
      })
    })

    it('getQzoneMsgDetail 使用 feed_ref 定位并递归转换键名', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzoneMsgDetail({ feedRef: { unionId: 'u1', ufKey: 'k1' } })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_qzone_msg_detail', {
        feed_ref: { union_id: 'u1', uf_key: 'k1' },
        tid: undefined,
        target_uin: undefined,
        pos: undefined,
        num: undefined,
      })
    })

    it('getQzoneCommentList 获取首批评论', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzoneCommentList({ feedRef: { unionId: 'u1' } })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'get_qzone_comment_list',
        { feed_ref: { union_id: 'u1' }, cursor: undefined },
      )
    })

    it('getQzoneCommentReplies 保留 id 为 0 的评论', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzoneCommentReplies({
        feedRef: { unionId: 'u1' },
        comment: { id: 0, like: { id: 'l1' } },
        cursor: 'c1',
      })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'get_qzone_comment_replies',
        {
          feed_ref: { union_id: 'u1' },
          comment: { id: 0, like: { id: 'l1' } },
          cursor: 'c1',
        },
      )
    })

    it('likeQzone 使用 tid 定位', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.likeQzone({ tid: 'tid_1', targetUin: 10001, abstime: 0 })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('like_qzone', {
        feed_ref: undefined,
        tid: 'tid_1',
        target_uin: 10001,
        abstime: 0,
      })
    })

    it('unlikeQzone 使用 feed_ref 定位', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.unlikeQzone({ feedRef: { unionId: 'u1' } })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('unlike_qzone', {
        feed_ref: { union_id: 'u1' },
        tid: undefined,
        target_uin: undefined,
        abstime: undefined,
      })
    })

    it('commentQzone 发表一级评论', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.commentQzone({ tid: 'tid_1', content: '好看', images: ['a.jpg'] })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('comment_qzone', {
        feed_ref: undefined,
        tid: 'tid_1',
        target_uin: undefined,
        content: '好看',
        comment: undefined,
        reply_user: undefined,
        comment_id: undefined,
        comment_uin: undefined,
        reply_uin: undefined,
        reply_name: undefined,
        images: ['a.jpg'],
      })
    })

    it('commentQzone 发表楼中楼回复', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.commentQzone({
        tid: 'tid_1',
        content: '同意',
        commentId: 'c1',
        commentUin: 10001,
        replyUin: 10002,
        replyName: '昵称',
      })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('comment_qzone', {
        feed_ref: undefined,
        tid: 'tid_1',
        target_uin: undefined,
        content: '同意',
        comment: undefined,
        reply_user: undefined,
        comment_id: 'c1',
        comment_uin: 10001,
        reply_uin: 10002,
        reply_name: '昵称',
        images: undefined,
      })
    })

    it('commentQzone 使用 feed_ref 模式', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.commentQzone({
        feedRef: { unionId: 'u1' },
        content: '好看',
        comment: { id: 0 },
      })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('comment_qzone', {
        feed_ref: { union_id: 'u1' },
        tid: undefined,
        target_uin: undefined,
        content: '好看',
        comment: { id: 0 },
        reply_user: undefined,
        comment_id: undefined,
        comment_uin: undefined,
        reply_uin: undefined,
        reply_name: undefined,
        images: undefined,
      })
    })

    it('getQzoneProfile 读取当前账号资料', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzoneProfile()
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_qzone_profile', {
        target_uin: undefined,
      })
    })

    it('setQzoneProfile 仅修改名称', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.setQzoneProfile({ name: '' })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_qzone_profile', {
        name: '',
        description: undefined,
      })
    })

    it('setQzoneMsgRight 部分好友可见需传目标列表', async () => {
      const client = mockClient({ ugc_right: 16 })
      const api = new QzoneApi(client)
      await api.setQzoneMsgRight({ tid: 'tid_1', ugcRight: 16, targetUins: [10001] })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_qzone_msg_right', {
        tid: 'tid_1',
        ugc_right: 16,
        target_uins: [10001],
      })
    })

    it('setQzoneMsgRight 公开权限不传目标列表', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.setQzoneMsgRight({ tid: 'tid_1', ugcRight: 1 })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_qzone_msg_right', {
        tid: 'tid_1',
        ugc_right: 1,
        target_uins: undefined,
      })
    })

    it('setQzoneBan 保留 false', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.setQzoneBan(10001, false)
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('set_qzone_ban', {
        user_id: 10001,
        enable: false,
      })
    })
  })

  describe('空友爱看', () => {
    it('getQzonePublicCapabilities 无参数', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzonePublicCapabilities()
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'get_qzone_public_capabilities',
        {},
      )
    })

    it('getQzonePublicFeeds 携带游标', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzonePublicFeeds({ cursor: 'c1' })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'get_qzone_public_feeds',
        { cursor: 'c1' },
      )
    })

    it('getQzonePublicFeedDetail 原样透传并递归转换嵌套键', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzonePublicFeedDetail({
        cellCommon: { unionId: 'u1' },
        extIds: [{ feedId: 'f1' }],
      })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'get_qzone_public_feed_detail',
        { feed: { cell_common: { union_id: 'u1' }, ext_ids: [{ feed_id: 'f1' }] } },
      )
    })

    it('getQzonePublicComments 必须携带游标', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzonePublicComments({}, 'attach')
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'get_qzone_public_comments',
        { feed: {}, cursor: 'attach' },
      )
    })

    it('getQzonePublicReplies 携带分页参数', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.getQzonePublicReplies({}, {}, { pageSize: 20 })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'get_qzone_public_replies',
        { feed: {}, comment: {}, cursor: undefined, page_size: 20 },
      )
    })

    it('setQzonePublicUpvote 保留 false', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.setQzonePublicUpvote({}, false)
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'set_qzone_public_upvote',
        { feed: {}, enable: false },
      )
    })

    it('setQzonePublicLike 省略 enable', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.setQzonePublicLike({})
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'set_qzone_public_like',
        { feed: {}, enable: undefined },
      )
    })

    it('setQzonePublicFollow 保留 false', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.setQzonePublicFollow({}, false)
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'set_qzone_public_follow',
        { feed: {}, enable: false },
      )
    })

    it('setQzonePublicCommentLike 操作回复', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.setQzonePublicCommentLike({}, {}, { reply: { id: 0 } })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'set_qzone_public_comment_like',
        { feed: {}, comment: {}, reply: { id: 0 }, enable: undefined },
      )
    })

    it('commentQzonePublicFeed 支持富文本数组', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.commentQzonePublicFeed({}, [{ text: '好看', color: 1 }])
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'comment_qzone_public_feed',
        { feed: {}, content: [{ text: '好看', color: 1 }] },
      )
    })

    it('replyQzonePublicFeed 回复已有回复', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.replyQzonePublicFeed({}, {}, '同意', { id: 0 })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'reply_qzone_public_feed',
        { feed: {}, comment: {}, content: '同意', reply: { id: 0 } },
      )
    })

    it('deleteQzonePublicComment 删除评论', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.deleteQzonePublicComment({}, {})
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'delete_qzone_public_comment',
        { feed: {}, comment: {} },
      )
    })

    it('deleteQzonePublicReply 删除回复', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.deleteQzonePublicReply({}, {}, { id: 0 })
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'delete_qzone_public_reply',
        { feed: {}, comment: {}, reply: { id: 0 } },
      )
    })

    it('forwardQzonePublicFeed 携带转发附言', async () => {
      const client = mockClient()
      const api = new QzoneApi(client)
      await api.forwardQzonePublicFeed({}, '转发')
      expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'forward_qzone_public_feed',
        { feed: {}, reason: '转发' },
      )
    })
  })

  describe('响应与错误', () => {
    it('响应键名转换为 camelCase', async () => {
      const client = mockClient({ like_count: 3, next_cursor: 'c1' })
      const api = new QzoneApi(client)
      const result = await api.getQzoneFeeds()
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data).toEqual({ likeCount: 3, nextCursor: 'c1' })
      }
    })

    it('失败时返回错误码', async () => {
      const client = {
        call: vi.fn().mockResolvedValue({ status: 'failed', retcode: 100, data: null }),
      } as unknown as NapCatClient
      const api = new QzoneApi(client)
      const result = await api.getQzoneProfile()
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.code).toBe(100)
    })
  })

  describe('类型约束', () => {
    it('互斥定位与分页参数', () => {
      expectTypeOf<{ format: 'native'; pageNum: number }>().not.toExtend<QzoneFeedsParams>()
      expectTypeOf<{ format: 'native'; pos: number }>().not.toExtend<QzoneMsgListParams>()
      expectTypeOf<{ format: 'snowluma'; cursor: string }>().not.toExtend<QzoneMsgListParams>()
      expectTypeOf<{ tid: string; feedRef: object }>().not.toExtend<QzoneMsgDetailParams>()
      expectTypeOf<{ tid: string; feedRef: object }>().not.toExtend<QzoneLikeParams>()
      expectTypeOf<{
        name?: undefined
        description?: undefined
      }>().not.toExtend<QzoneSetProfileParams>()
      expectTypeOf<{ tid: string; ugcRight: 16 }>().not.toExtend<QzoneSetMsgRightParams>()
    })
  })
})
