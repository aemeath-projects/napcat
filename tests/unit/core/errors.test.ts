import { describe, it, expect } from 'vitest'

import {
  NapCatError,
  ConnectionError,
  TransportError,
  TimeoutError,
  AuthenticationError,
} from '../../../src/core'

describe('错误层级', () => {
  it('NapCatError 正确设置 name 为类名', () => {
    const err = new NapCatError('test')
    expect(err.name).toBe('NapCatError')
    expect(err.message).toBe('test')
  })

  it('TimeoutError 包含 action 和 timeout 属性', () => {
    const err = new TimeoutError('send_msg', 30000)
    expect(err).toBeInstanceOf(NapCatError)
    expect(err.action).toBe('send_msg')
    expect(err.timeout).toBe(30000)
    expect(err.message).toContain('send_msg')
    expect(err.message).toContain('30000')
  })

  it('ConnectionError 继承自 NapCatError', () => {
    const err = new ConnectionError('conn failed')
    expect(err).toBeInstanceOf(NapCatError)
    expect(err).toBeInstanceOf(Error)
  })

  it('TransportError 继承自 NapCatError', () => {
    const err = new TransportError('transport error')
    expect(err).toBeInstanceOf(NapCatError)
  })

  it('AuthenticationError 继承自 ConnectionError', () => {
    const err = new AuthenticationError('invalid token')
    expect(err).toBeInstanceOf(ConnectionError)
    expect(err).toBeInstanceOf(NapCatError)
    expect(err.name).toBe('AuthenticationError')
  })
})
