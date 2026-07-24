/**
 * 消息段构建工厂 Seg 及相关工具函数。
 */

import type { MessageSegment, TextSegment } from '../types'

import { createBuilder, factories } from './builder.js'
import { stringifyCqCode } from './cqcode.js'

/** 消息段工厂集合与构造器快捷入口。既可直接调用工厂方法创建消息段，也可链式构建消息数组。
 * @example seg.text("hello") // 创建文本消息段
 * @example seg.at(123).text("hi").done // 链式构建消息数组 */
export const seg = Object.assign(
  (initial?: MessageSegment[]) => createBuilder(initial, stringifyCqCode),
  factories,
)

/** 从消息段数组中提取纯文本内容。非文本段以空格占位，结果 trim 首尾空白。 */
export function extractPlaintext(segments: MessageSegment[]): string {
  return segments
    .map((seg) => (seg.type === 'text' ? (seg as TextSegment).data.text : ' '))
    .join('')
    .trim()
}
