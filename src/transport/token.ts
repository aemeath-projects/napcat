/** 从 HTTP/WS 升级请求中提取鉴权 token —— header 与 query 两种来源，宿主指定优先级。 */

import type { IncomingMessage } from 'node:http'

/**
 * 从 `Authorization: Bearer <token>` header 提取 token，不存在则返回 undefined。
 * @param req HTTP 请求对象
 * @returns 提取到的 token 字符串，未找到则返回 undefined
 */
function extractFromHeader(req: IncomingMessage): string | undefined {
  const authHeader = req.headers.authorization
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return undefined
}

/**
 * 从 URL query string 的 `access_token` 参数提取 token，不存在或为空字符串则返回 undefined。
 * @param req HTTP 请求对象
 * @returns 提取到的 token 字符串，未找到则返回 undefined
 */
function extractFromQuery(req: IncomingMessage): string | undefined {
  const url = req.url ?? ''
  const queryStart = url.indexOf('?')
  if (queryStart === -1) return undefined
  const qs = new URLSearchParams(url.slice(queryStart + 1))
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  return qs.get('access_token') || undefined
}

/**
 * 从请求中提取鉴权 token，按 `headerFirst` 指定的优先级依次尝试 header/query，
 * 两者都取不到时返回 undefined。
 * @param req HTTP 请求对象
 * @param opts 提取选项，指定 header 优先还是 query 优先
 * @returns 提取到的 token 字符串，未找到则返回 undefined
 */
export function extractTokenFromRequest(
  req: IncomingMessage,
  opts: { headerFirst: boolean },
): string | undefined {
  const [first, second] = opts.headerFirst
    ? [extractFromHeader, extractFromQuery]
    : [extractFromQuery, extractFromHeader]
  return first(req) ?? second(req)
}
