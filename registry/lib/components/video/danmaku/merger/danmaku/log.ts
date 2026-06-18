import { useScopedConsole } from '@/core/utils/log'

const console = useScopedConsole('弹幕合并器')

/** 合并器常规日志 */
export const dmLog = (...args: unknown[]): void => {
  console.log(...args)
}

/** 合并器警告日志 */
export const dmWarn = (...args: unknown[]): void => {
  console.warn(...args)
}