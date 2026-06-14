import type { NapCatClient } from '../core/client.js'
import type { Result } from '../core/result.js'
import type { ApiResponse } from '../types/common.js'

/** 所有 API 模块的基类。 */
export abstract class BaseApi {
  constructor(protected readonly client: NapCatClient) {}

  /** 调用 API 并将响应包装为 Result。Transport 层异常直接向上抛。 */
  protected async invoke<T>(action: string, params?: Record<string, unknown>): Promise<Result<T>> {
    const resp: ApiResponse = await this.client.call(action, params ?? {})
    if (resp.status === 'ok' && resp.retcode === 0) {
      return { ok: true, data: resp.data as T }
    }
    return { ok: false, error: { code: resp.retcode, message: resp.message ?? 'unknown error' } }
  }
}
