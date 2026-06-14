import { describe, it, expect } from 'vitest'

import {
  isGroupMessage,
  isPrivateMessage,
  isMessageSent,
  isNoticeEvent,
  isRequestEvent,
  isMetaEvent,
} from '../../../src/utils/guards.js'

describe('Event type guards', () => {
  it('isGroupMessage identifies group message events', () => {
    const event = { post_type: 'message', message_type: 'group', time: 0, self_id: 0 }
    expect(isGroupMessage(event as any)).toBe(true)
  })

  it('isGroupMessage rejects private messages', () => {
    const event = { post_type: 'message', message_type: 'private', time: 0, self_id: 0 }
    expect(isGroupMessage(event as any)).toBe(false)
  })

  it('isPrivateMessage identifies private messages', () => {
    const event = { post_type: 'message', message_type: 'private', time: 0, self_id: 0 }
    expect(isPrivateMessage(event as any)).toBe(true)
  })

  it('isMessageSent identifies message_sent events', () => {
    const event = { post_type: 'message_sent', time: 0, self_id: 0 }
    expect(isMessageSent(event as any)).toBe(true)
  })

  it('isNoticeEvent identifies notice events', () => {
    const event = { post_type: 'notice', notice_type: 'friend_add', time: 0, self_id: 0 }
    expect(isNoticeEvent(event as any)).toBe(true)
  })

  it('isRequestEvent identifies request events', () => {
    const event = { post_type: 'request', request_type: 'friend', time: 0, self_id: 0 }
    expect(isRequestEvent(event as any)).toBe(true)
  })

  it('isMetaEvent identifies meta events', () => {
    const event = { post_type: 'meta_event', meta_event_type: 'heartbeat', time: 0, self_id: 0 }
    expect(isMetaEvent(event as any)).toBe(true)
  })
})
