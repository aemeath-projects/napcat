import { EventEmitter } from 'node:events'

/** 类型安全的 EventEmitter 包装。通过 declare 声明覆盖原生方法签名，不改变运行时行为。 */
export class TypedEventEmitter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, (...args: any[]) => void>,
> extends EventEmitter {
  declare on: <K extends keyof T & string>(event: K, listener: T[K]) => this
  declare once: <K extends keyof T & string>(event: K, listener: T[K]) => this
  declare off: <K extends keyof T & string>(event: K, listener: T[K]) => this
  declare emit: <K extends keyof T & string>(event: K, ...args: Parameters<T[K]>) => boolean
  declare removeAllListeners: (event?: keyof T & string) => this
}
