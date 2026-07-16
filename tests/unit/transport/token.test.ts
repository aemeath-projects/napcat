import { describe, it, expect } from 'vitest'

import { extractTokenFromRequest } from '../../../src/transport/token.js'

function makeReq(
  url: string,
  headers: Record<string, string> = {},
): { url: string; headers: Record<string, string> } {
  return { url, headers }
}

describe('extractTokenFromRequest', () => {
  describe('headerFirst: true（http.ts 场景）', () => {
    it('header 存在时优先使用 header', () => {
      const req = makeReq('/onebot/event?access_token=from-query', {
        authorization: 'Bearer from-header',
      })
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBe('from-header')
    })

    it('header 不存在时降级到 query', () => {
      const req = makeReq('/onebot/event?access_token=from-query')
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBe('from-query')
    })

    it('两者都不存在时返回 undefined', () => {
      const req = makeReq('/onebot/event')
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBeUndefined()
    })

    it('header 不是 Bearer 前缀时视为不存在，降级到 query', () => {
      const req = makeReq('/onebot/event?access_token=from-query', {
        authorization: 'Basic something',
      })
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBe('from-query')
    })

    it('query 参数为空字符串时视为不存在，降级到 header', () => {
      const req = makeReq('/onebot/event?access_token=', {
        authorization: 'Bearer from-header',
      })
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBe('from-header')
    })
  })

  describe('headerFirst: false（reverse-ws.ts 场景）', () => {
    it('query 存在时优先使用 query', () => {
      const req = makeReq('/ws?access_token=from-query', {
        authorization: 'Bearer from-header',
      })
      expect(extractTokenFromRequest(req as never, { headerFirst: false })).toBe('from-query')
    })

    it('query 不存在时降级到 header', () => {
      const req = makeReq('/ws', { authorization: 'Bearer from-header' })
      expect(extractTokenFromRequest(req as never, { headerFirst: false })).toBe('from-header')
    })

    it('query 参数为空字符串时视为不存在，降级到 header', () => {
      const req = makeReq('/ws?access_token=', { authorization: 'Bearer from-header' })
      expect(extractTokenFromRequest(req as never, { headerFirst: false })).toBe('from-header')
    })

    it('两者都不存在时返回 undefined', () => {
      const req = makeReq('/ws')
      expect(extractTokenFromRequest(req as never, { headerFirst: false })).toBeUndefined()
    })
  })
})
