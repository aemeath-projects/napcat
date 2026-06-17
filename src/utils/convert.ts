/**
 * snake_case ↔ camelCase 键名转换工具。
 *
 * 两个函数都是幂等的：
 * - `snakeToCamel`：已为 camelCase 的键（不含下划线）会被原样保留。
 * - `camelToSnake`：已为 snake_case 的键（无大写字母）会被原样保留。
 * 因此对同一数据多次调用不会产生错误结果。
 */

/** 将单个 snake_case 字符串转为 camelCase，不含下划线或以下划线开头的键原样返回。 */
function toCamelKey(key: string): string {
  if (!key.includes('_') || key.startsWith('_')) return key
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())
}

/** 将单个 camelCase 字符串转为 snake_case，已为 snake_case 的键原样返回。 */
function toSnakeKey(key: string): string {
  return key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())
}

/** 深递归将对象/数组中所有键名从 snake_case 转为 camelCase。 */
export function snakeToCamel<T>(data: T): T {
  if (data === null || data === undefined) return data
  if (Array.isArray(data)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data.map((item) => snakeToCamel(item)) as unknown as T
  }
  if (typeof data === 'object' && data.constructor === Object) {
    const converted: Record<string, unknown> = {}
    for (const key of Object.keys(data)) {
      const camelKey = toCamelKey(key)
      converted[camelKey] = snakeToCamel((data as Record<string, unknown>)[key])
    }
    return converted as unknown as T
  }
  return data
}

/** 深递归将对象/数组中所有键名从 camelCase 转为 snake_case。 */
export function camelToSnake<T>(data: T): T {
  if (data === null || data === undefined) return data
  if (Array.isArray(data)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data.map((item) => camelToSnake(item)) as unknown as T
  }
  if (typeof data === 'object' && data.constructor === Object) {
    const converted: Record<string, unknown> = {}
    for (const key of Object.keys(data)) {
      const snakeKey = toSnakeKey(key)
      converted[snakeKey] = camelToSnake((data as Record<string, unknown>)[key])
    }
    return converted as unknown as T
  }
  return data
}
