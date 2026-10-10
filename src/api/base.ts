import type { NapCatClient } from '../core/client.js'
import type { Result } from '../core/result.js'
import type { ApiResponse } from '../types'
import { snakeToCamel, camelToSnake } from '../utils'

/** 所有 API 模块的基类。 */
export abstract class BaseApi {
  constructor(protected readonly client: NapCatClient) {}

  /**
   * 调用 API 并将响应包装为 Result。Transport 层异常直接向上抛。
   * @param action - API 动作名称。
   * @param params - 请求参数。
   * @param options - 调用选项。`raw` 为真时跳过 camelCase→snake_case 转换，
   * 参数按原样发送；此时 `params` 的键必须已是线上格式（snake_case）。
   * 仅用于 openapi 契约本身即为 camelCase 的接口（如 `validitySeconds`）。
   * @returns API 响应数据。
   * @throws {ApiError} 当 API 调用失败时抛出。
   */
  protected async invoke<T>(
    action: string,
    params?: object,
    options?: { raw?: boolean },
  ): Promise<Result<T>> {
    const payload = options?.raw ? (params ?? {}) : camelToSnake(params ?? {})
    const resp: ApiResponse = await this.client.call(action, payload as Record<string, unknown>)
    if (resp.status === 'ok' && resp.retcode === 0) {
      return { ok: true, data: snakeToCamel(resp.data) as T }
    }
    return { ok: false, error: { code: resp.retcode, message: resp.message ?? 'unknown error' } }
  }
}
