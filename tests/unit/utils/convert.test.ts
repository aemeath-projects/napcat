import { describe, it, expect } from 'vitest'

import { snakeToCamel } from '../../../src/utils/convert.js'

describe('snakeToCamel', () => {
  it('converts snake_case keys to camelCase', () => {
    const input = { user_id: 1, group_id: 2, raw_message: 'hello' }
    const result = snakeToCamel(input)
    expect(result).toEqual({ userId: 1, groupId: 2, rawMessage: 'hello' })
  })

  it('is idempotent — camelCase stays camelCase', () => {
    const once = snakeToCamel({ user_id: 1, message_id: 2 })
    const twice = snakeToCamel(once)
    expect(twice).toEqual({ userId: 1, messageId: 2 })
  })

  it('handles nested objects', () => {
    const input = { sender: { user_id: 1, group_id: 2 }, message_id: 100 }
    const result = snakeToCamel(input)
    expect(result).toEqual({ sender: { userId: 1, groupId: 2 }, messageId: 100 })
  })

  it('handles arrays', () => {
    const input = [{ message_id: 1 }, { message_id: 2 }]
    const result = snakeToCamel(input)
    expect(result).toEqual([{ messageId: 1 }, { messageId: 2 }])
  })

  it('handles null and undefined', () => {
    expect(snakeToCamel(null)).toBeNull()
    expect(snakeToCamel(undefined)).toBeUndefined()
  })

  it('preserves primitive values', () => {
    expect(snakeToCamel(42)).toBe(42)
    expect(snakeToCamel('hello')).toBe('hello')
    expect(snakeToCamel(true)).toBe(true)
  })

  it('preserves keys starting with underscore', () => {
    const input = { _internal_key: 'keep', normal_key: 'convert' }
    const result = snakeToCamel(input)
    expect(result).toEqual({ _internal_key: 'keep', normalKey: 'convert' })
  })

  it('handles empty objects', () => {
    expect(snakeToCamel({})).toEqual({})
  })

  it('handles empty arrays', () => {
    expect(snakeToCamel([])).toEqual([])
  })

  it('handles deeply nested structures', () => {
    const input = {
      message_id: 1,
      sender: {
        user_id: 99,
        group_role: 'admin',
        inner_data: { extra_field: true },
      },
      likes: [{ emoji_id: 'abc', click_count: 5 }],
    }
    const result = snakeToCamel(input)
    expect(result).toEqual({
      messageId: 1,
      sender: {
        userId: 99,
        groupRole: 'admin',
        innerData: { extraField: true },
      },
      likes: [{ emojiId: 'abc', clickCount: 5 }],
    })
  })
})
