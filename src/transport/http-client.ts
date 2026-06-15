/** 共享 HTTP 客户端封装（基于 axios）。 */
import axios, { type AxiosInstance } from 'axios'

import { TransportError } from '../core'
import type { ApiResponse } from '../types'

/** axios 实例：不抛非 2xx（与之前 fetch 行为一致），30 秒超时。 */
export const httpClient: AxiosInstance = axios.create({
  timeout: 30_000,
  validateStatus: () => true,
})

/**
 * 统一的 API 调用封装。
 * 向 `/baseUrl/action` 发 POST JSON 请求，返回解析后的 ApiResponse。
 */
export async function apiCall(
  baseUrl: string,
  action: string,
  params: Record<string, unknown>,
  token?: string,
): Promise<ApiResponse> {
  const url = `${baseUrl}/${action}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const resp = await httpClient.post<ApiResponse>(url, params, { headers })
    return resp.data
  } catch (err) {
    throw new TransportError(
      `HTTP 请求失败 [${action}]：${err instanceof Error ? err.message : String(err)}`,
    )
  }
}
