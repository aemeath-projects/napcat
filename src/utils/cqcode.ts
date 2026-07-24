/**
 * CQ 码解析、序列化，以及 cq 命名空间。
 */

import type { MessageSegment, TextSegment } from '../types'

import { createBuilder, factories } from './builder.js'

const NUMERIC_FIELDS_BY_TYPE: Partial<Record<string, ReadonlySet<string>>> = {
  face: new Set(['id']),
  reply: new Set(['id']),
  dice: new Set(['result']),
  rps: new Set(['result']),
  location: new Set(['lat', 'lon']),
  node: new Set(['user_id']),
}

const CQ_TO_TS_KEY_MAP: Record<string, string> = {
  user_id: 'userId',
}

const TS_TO_CQ_KEY_MAP: Record<string, string> = {
  userId: 'user_id',
}

/** 反转义 CQ 码中的特殊字符。
 * @param val - 含转义字符的字符串。
 * @returns 反转义后的字符串。 */
function unescapeCqValue(val: string): string {
  return val
    .replace(/&#91;/g, '[')
    .replace(/&#93;/g, ']')
    .replace(/&#44;/g, ',')
    .replace(/&amp;/g, '&')
}

/** 转义普通文本中的 CQ 码特殊字符。
 * @param text - 原始文本。
 * @returns 转义后的文本。 */
function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/\[/g, '&#91;').replace(/\]/g, '&#93;')
}

/** 转义 CQ 码参数值中的特殊字符。
 * @param val - 原始值。
 * @returns 转义后的值。 */
function escapeCqValue(val: string): string {
  return val
    .replace(/&/g, '&amp;')
    .replace(/\[/g, '&#91;')
    .replace(/\]/g, '&#93;')
    .replace(/,/g, '&#44;')
}

/** 将参数字段中的数字字符串转为数字类型。
 * @param type - CQ 码类型。
 * @param data - 原始参数对象。 */
function convertNumericFields(type: string, data: Record<string, unknown>): void {
  const numFields = NUMERIC_FIELDS_BY_TYPE[type]
  if (!numFields) return

  for (const key of Object.keys(data)) {
    if (numFields.has(key)) {
      const val = data[key]
      if (typeof val === 'string') {
        const num = Number(val)
        if (!Number.isNaN(num) && String(num) === val) {
          data[key] = num
        }
      }
    }
  }
}

/**
 * 将 CQ 码字符串解析为消息段数组。
 *
 * 解析规则：
 * - `[CQ:type,key1=val1]` → `{ type, data: { key1: val1 } }`
 * - 段间纯文本 → `TextSegment`
 * - 转义还原：`&amp;` → `&`，`&#91;` → `[`，`&#93;` → `]`，`&#44;` → `,`
 * - 已知数字字段（id, result, lat, lon, user_id）自动转为 number
 * - CQ 协议键名映射到 TS 接口键名（如 user_id → userId）
 * - qq 字段保持字符串（与 AtSegment 类型一致）
 * @param cqString - CQ 码字符串。
 * @returns 解析后的 CQ 码消息段数组。 */
export function parseCqCode(cqString: string): MessageSegment[] {
  const result: MessageSegment[] = []

  const pattern = /\[CQ:([^,\]]+)(?:,([^\]]*))?\]/g
  let lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = pattern.exec(cqString)) !== null) {
    if (match.index > lastIndex) {
      const text = cqString.slice(lastIndex, match.index)
      const unescapedText = unescapeCqValue(text)
      if (unescapedText.length > 0) {
        result.push({ type: 'text', data: { text: unescapedText } })
      }
    }

    const type = match[1]
    const paramsStr = match[2] || ''

    const rawData: Record<string, unknown> = {}

    if (paramsStr.length > 0) {
      const COMMA_PLACEHOLDER = '\u0000__CQ_COMMA__\u0000'
      const processed = paramsStr.replace(/&#44;/g, COMMA_PLACEHOLDER)
      const pairs = processed.split(',')

      for (const pair of pairs) {
        const eqIndex = pair.indexOf('=')
        if (eqIndex === -1) continue
        const key = pair.slice(0, eqIndex)
        const val = pair
          .slice(eqIndex + 1)
          .replace(new RegExp(COMMA_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ',')
        rawData[key] = unescapeCqValue(val)
      }
    }

    convertNumericFields(type, rawData)

    const data: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(rawData)) {
      data[CQ_TO_TS_KEY_MAP[key] ?? key] = value
    }

    result.push({ type, data })

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < cqString.length) {
    const text = unescapeCqValue(cqString.slice(lastIndex))
    if (text.length > 0) {
      result.push({ type: 'text', data: { text } })
    }
  }

  return result
}

const SKIPPABLE_FIELDS: Partial<Record<string, ReadonlySet<string>>> = {
  node: new Set(['content']),
}

/** 判断 CQ 码参数是否可跳过输出。
 * @param segType - 消息段类型。
 * @param key - 参数名。
 * @returns 是否可跳过。 */
function isSkippable(segType: string, key: string): boolean {
  const skipSet = SKIPPABLE_FIELDS[segType]
  return skipSet?.has(key) ?? false
}

/** 将参数值转为字符串表示。
 * @param value - 参数值。
 * @returns 字符串形式。 */
function valueToString(value: unknown): string {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }
  return ''
}

/** 将消息段数组序列化为 CQ 码字符串。
 * @param segments - CQ 码消息段数组。
 * @returns 序列化后的 CQ 码字符串。 */
export function stringifyCqCode(segments: MessageSegment[]): string {
  return segments
    .map((seg) => {
      if (seg.type === 'text') {
        const text = (seg as TextSegment).data.text
        if (!text) return ''
        return escapeText(text)
      }

      const entries = Object.entries(seg.data)
        .filter(([_, v]) => v !== null && v !== undefined)
        .filter(([key]) => !isSkippable(seg.type, key))

      if (entries.length === 0) {
        return `[CQ:${seg.type}]`
      }

      const params = entries
        .map(([key, value]) => {
          const outKey = TS_TO_CQ_KEY_MAP[key] ?? key
          return `${outKey}=${escapeCqValue(valueToString(value))}`
        })
        .join(',')

      return `[CQ:${seg.type},${params}]`
    })
    .join('')
}

/** CQ 码工具集。提供 {@link parseCqCode parse}、{@link stringifyCqCode stringify} 及各类工厂方法。
 * @example cq.parse("[CQ:at,qq=123]") */
export const cq = Object.assign(
  (initial?: MessageSegment[]) => createBuilder(initial, stringifyCqCode),
  factories,
  {
    parse: parseCqCode,
    stringify: stringifyCqCode,
  },
)
