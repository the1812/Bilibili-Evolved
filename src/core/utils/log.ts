import { getHook } from '@/plugins/hook'
import { getGeneralSettings } from '../settings'

/**
 * 向 console 中输出错误消息, 并弹出 Toast 提示. 如果开启了开发者模式且传入了 Error 对象, 则会输出整个堆栈
 * @param error Error 对象或错误消息
 * @param duration Toast 展示时间
 */
export const logError = async (error: Error | string, duration?: number) => {
  let finalMessage: string
  if (typeof error === 'string') {
    finalMessage = error
    console.error(finalMessage)
  } else {
    if (getGeneralSettings().devMode) {
      finalMessage = error.stack
    } else {
      finalMessage = error.message
    }
    console.error(error)
  }
  const { Toast } = await import('../toast')
  Toast.error(finalMessage, '错误', duration)
}

/**
 * 可添加到 ScopedConsole 的前缀
 */
export interface ConsoleBadge {
  /** 名称 */
  name: string
  /** 背景色 */
  color?: string
}
interface ScopedData {
  readonly badgeNames: string[]
  readonly badgeValues: string[]
  readonly original: (...args: any[]) => void
}
const ScopedConsoleSymbol = Symbol('ScopedConsole')
const NamePatchSymbol = Symbol('NamePatch')
const specialPalette = {
  default: '#78909C',
  warn: '#CC7A00',
  error: '#BF6060',
  group: '#9575CD',
}
const functionNamePatch = (target: any, names: string[]) => {
  names.forEach(name => {
    if (!target[name][NamePatchSymbol]) {
      target[name][NamePatchSymbol] = name
    }
  })
}
/** 创建 ScopedConsole 时触发的 Hook */
export const ScopedConsoleCreateHook = 'scopedConsole.create'
/** ScopedConsole 支持的函数被调用时触发的 Hook */
export const ScopedConsoleCallHook = 'scopedConsole.call'
/**
 * 创建一个 ScopedConsole, 为输出的日志添加固定的前缀
 * @param consoleBadge 前缀信息
 * @param console 原型对象
 */
export const useScopedConsole = (consoleBadge: ConsoleBadge, console = window.console) => {
  const { before: beforeCreate, after: afterCreate } = getHook(ScopedConsoleCreateHook)
  beforeCreate(consoleBadge, console)
  let groupCounter = 0
  const prependBadge = (
    target: (...args: any[]) => void,
    badge: ConsoleBadge,
    firstColor = badge.color,
  ) => {
    const lastScopedData: ScopedData = target[ScopedConsoleSymbol]
    const backgroundColor = (lastScopedData ? badge.color : firstColor) ?? specialPalette.default
    const textColor = '#fff'
    const currentScopedData: ScopedData = {
      badgeNames: [...(lastScopedData?.badgeNames ?? []), `%c${badge.name}`],
      badgeValues: [...(lastScopedData?.badgeValues ?? []), `background-color: ${backgroundColor}; color: ${textColor}; padding: 2px 4px; border-radius: 4px; margin-left: ${lastScopedData ? 6 : 0}px`],
      original: lastScopedData?.original ?? target,
    }
    const rootTarget = currentScopedData.original
    const patchedLog = function patchedLog(...args: any[]) {
      const hookPayload = {
        type: rootTarget[NamePatchSymbol],
        args,
      }
      const { before: beforeCall, after: afterCall } = getHook(ScopedConsoleCallHook)
      beforeCall(hookPayload)
      afterCall(hookPayload)
      if (groupCounter === 0) {
        return rootTarget.apply(this, [
          currentScopedData.badgeNames.join(''),
          ...currentScopedData.badgeValues,
          ...args,
        ])
      }
      return rootTarget.apply(this, args)
    }
    patchedLog[ScopedConsoleSymbol] = currentScopedData
    return patchedLog
  }
  const prependGroupBadge = (
    target: (...args: any[]) => void,
    badge: ConsoleBadge,
    firstColor = badge.color,
    counter: (num: number) => number = n => n,
  ) => {
    const patch = prependBadge(target, badge, firstColor)
    return function patchedGroup(...args: any[]) {
      const returnValue = patch.apply(this, args)
      groupCounter = counter(groupCounter)
      return returnValue
    }
  }

  // 为各个函数补充名称, 方便 Hook 拿到被调用的函数类型
  functionNamePatch(console, [
    'log',
    'info',
    'warn',
    'error',
    'group',
    'groupCollapsed',
    'groupEnd',
    'debug',
  ])

  const scopedConsole = {
    ...console,
  }

  scopedConsole.log = prependBadge(console.log, consoleBadge)
  scopedConsole.info = prependBadge(console.info, consoleBadge)
  scopedConsole.warn = prependBadge(console.warn, consoleBadge, specialPalette.warn)
  scopedConsole.error = prependBadge(console.error, consoleBadge, specialPalette.error)

  scopedConsole.group = prependGroupBadge(
    console.group, consoleBadge, specialPalette.group, n => n + 1,
  )
  scopedConsole.groupCollapsed = prependGroupBadge(
    console.groupCollapsed, consoleBadge, specialPalette.group, n => n + 1,
  )
  scopedConsole.groupEnd = prependGroupBadge(
    console.groupEnd, consoleBadge, specialPalette.group, n => n - 1,
  )
  scopedConsole.debug = (() => {
    const patch = prependBadge(console.debug, consoleBadge)
    return function patchedDebug(...args: any[]) {
      if (!getGeneralSettings().devMode) {
        return undefined
      }
      return patch.apply(this, args)
    }
  })()
  afterCreate(consoleBadge, scopedConsole)
  return scopedConsole
}
