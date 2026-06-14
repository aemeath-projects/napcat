import { describe, it, expect } from 'vitest'

import {
  NapCatError,
  ConnectionError,
  TransportError,
  TimeoutError,
  AuthenticationError,
} from '../../../src/core/errors.js'

describe('Error hierarchy', () => {
  it('NapCatError sets name to class name', () => {
    const err = new NapCatError('test')
    expect(err.name).toBe('NapCatError')
    expect(err.message).toBe('test')
  })

  it('TimeoutError contains action and timeout', () => {
    const err = new TimeoutError('send_msg', 30000)
    expect(err).toBeInstanceOf(NapCatError)
    expect(err.action).toBe('send_msg')
    expect(err.timeout).toBe(30000)
    expect(err.message).toContain('send_msg')
    expect(err.message).toContain('30000')
  })

  it('ConnectionError extends NapCatError', () => {
    const err = new ConnectionError('conn failed')
    expect(err).toBeInstanceOf(NapCatError)
    expect(err).toBeInstanceOf(Error)
  })

  it('TransportError extends NapCatError', () => {
    const err = new TransportError('transport error')
    expect(err).toBeInstanceOf(NapCatError)
  })

  it('AuthenticationError extends ConnectionError', () => {
    const err = new AuthenticationError('invalid token')
    expect(err).toBeInstanceOf(ConnectionError)
    expect(err).toBeInstanceOf(NapCatError)
    expect(err.name).toBe('AuthenticationError')
  })
})
