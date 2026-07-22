import { describe, it, expect } from 'vitest'

import { extractTokenFromRequest } from '../../../src/transport'

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

  describe('边界与特殊输入', () => {
    it('authorization header 为 string[] 时不识别（仅处理 string 类型）', () => {
      const req = makeReq('/onebot/event', {
        authorization: ['Bearer from-array'] as unknown as string,
      })
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBeUndefined()
    })

    it("req.url 为 null 时的 ??'' 兜底", () => {
      const req = makeReq(null as unknown as string)
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBeUndefined()
    })

    it('Authorization: Bearer 后无空格无 token 值时返回 undefined', () => {
      const req = makeReq('/onebot/event', { authorization: 'Bearer' })
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBeUndefined()
    })

    it('Bearer 后仅跟空格无 token 值时返回空字符串', () => {
      const req = makeReq('/onebot/event', { authorization: 'Bearer ' })
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBe('')
    })

    it('access_token 在 query 中间位置（非首尾）', () => {
      const req = makeReq('/onebot/event?a=1&access_token=mytoken&b=2&c=3')
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBe('mytoken')
    })

    it('access_token 位于 query 末尾', () => {
      const req = makeReq('/onebot/event?a=1&b=2&access_token=endtoken')
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBe('endtoken')
    })

    it('access_token 位于 query 起始', () => {
      const req = makeReq('/onebot/event?access_token=starttoken&a=1&b=2')
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBe('starttoken')
    })

    it('URL 仅含 query string 无路径', () => {
      const req = makeReq('?access_token=barequery')
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBe('barequery')
    })

    it('authorization header 的 Bearer 前缀大小写敏感（小写 bearer 不识别）', () => {
      const req = makeReq('/onebot/event', { authorization: 'bearer lowercasetoken' })
      expect(extractTokenFromRequest(req as never, { headerFirst: true })).toBeUndefined()
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
