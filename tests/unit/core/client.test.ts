import { describe, it, expect, vi } from 'vitest'

import { NapCatClient } from '../../../src/core'
import type { Transport } from '../../../src/transport/interface.js'
import type { TransportEventMap } from '../../../src/types'

function createMockTransport(overrides: Partial<Transport> = {}): Transport {
  return {
    state: 'disconnected',
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode: 0, data: null }),
    on: vi.fn(),
    once: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    removeAllListeners: vi.fn(),
    ...overrides,
  } as Transport & TransportEventMap
}

describe('NapCatClient 客户端', () => {
  it('state getter 代理到 transport.state', () => {
    const transport = createMockTransport({ state: 'connected' })
    const client = new NapCatClient(transport)
    expect(client.state).toBe('connected')
  })

  it('state 变化后 getter 反映最新值', () => {
    const transport = createMockTransport({ state: 'disconnected' })
    const client = new NapCatClient(transport)
    expect(client.state).toBe('disconnected')
    ;(transport as { state: string }).state = 'connecting'
    expect(client.state).toBe('connecting')
  })

  it('call() 代理到 transport.call()', async () => {
    const transport = createMockTransport()
    const client = new NapCatClient(transport)
    await client.call('send_msg', { group_id: 123 })
    expect(transport.call).toHaveBeenCalledWith('send_msg', { group_id: 123 })
  })
})
