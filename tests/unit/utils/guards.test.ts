import { describe, it, expect } from 'vitest'

import {
  isGroupMessage,
  isPrivateMessage,
  isMessageSent,
  isNoticeEvent,
  isRequestEvent,
  isMetaEvent,
} from '../../../src/utils'

describe('事件类型守卫', () => {
  it('isGroupMessage 识别群消息事件', () => {
    const event = { post_type: 'message', message_type: 'group', time: 0, self_id: 0 }
    expect(isGroupMessage(event as any)).toBe(true)
  })

  it('isGroupMessage 排除私聊消息', () => {
    const event = { post_type: 'message', message_type: 'private', time: 0, self_id: 0 }
    expect(isGroupMessage(event as any)).toBe(false)
  })

  it('isPrivateMessage 识别私聊消息', () => {
    const event = { post_type: 'message', message_type: 'private', time: 0, self_id: 0 }
    expect(isPrivateMessage(event as any)).toBe(true)
  })

  it('isMessageSent 识别消息发送事件', () => {
    const event = { post_type: 'message_sent', time: 0, self_id: 0 }
    expect(isMessageSent(event as any)).toBe(true)
  })

  it('isNoticeEvent 识别通知事件', () => {
    const event = { post_type: 'notice', notice_type: 'friend_add', time: 0, self_id: 0 }
    expect(isNoticeEvent(event as any)).toBe(true)
  })

  it('isRequestEvent 识别请求事件', () => {
    const event = { post_type: 'request', request_type: 'friend', time: 0, self_id: 0 }
    expect(isRequestEvent(event as any)).toBe(true)
  })

  it('isMetaEvent 识别元事件', () => {
    const event = { post_type: 'meta_event', meta_event_type: 'heartbeat', time: 0, self_id: 0 }
    expect(isMetaEvent(event as any)).toBe(true)
  })
})
