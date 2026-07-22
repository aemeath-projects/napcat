import type { NapCatClient, Result } from '../core'
import type { ApiResponse } from '../types'
import { snakeToCamel, camelToSnake } from '../utils'

/** 所有 API 模块的基类。 */
export abstract class BaseApi {
  constructor(protected readonly client: NapCatClient) {}

  /** 调用 API 并将响应包装为 Result。Transport 层异常直接向上抛。 */
  protected async invoke<T>(action: string, params?: object): Promise<Result<T>> {
    const resp: ApiResponse = await this.client.call(
      action,
      camelToSnake(params ?? {}) as Record<string, unknown>,
    )
    if (resp.status === 'ok' && resp.retcode === 0) {
      return { ok: true, data: snakeToCamel(resp.data) as T }
    }
    return { ok: false, error: { code: resp.retcode, message: resp.message ?? 'unknown error' } }
  }
}
