/** API 调用结果类型。 */
export type Result<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: { readonly code: number; readonly message: string } }
