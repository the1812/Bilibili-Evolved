import { getHook } from '@/plugins/hook'
import { getRandomId } from '.'
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
 * ScopedConsole 配置
 */
export interface ScopedConsoleConfig {
  /** 名称 */
  name: string
  /** 背景色 */
  color?: string
  /** console 原型 */
  console?: Console
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
 * @param config 配置对象或者 scope 名称
 */
export const useScopedConsole = (config: ScopedConsoleConfig | string) => {
  const { before: beforeCreate, after: afterCreate } = getHook(ScopedConsoleCreateHook)
  const {
    name,
    color = specialPalette.default,
    console = window.console,
  } = typeof config === 'string' ? { name: config } : config
  const actualConfig: ScopedConsoleConfig = { name, color, console }
  beforeCreate(config, console)
  let groupCounter = 0
  const prependBadge = (
    target: (...args: any[]) => void,
    prependConfig: ScopedConsoleConfig,
    firstColor = prependConfig.color,
  ) => {
    const lastScopedData: ScopedData = target[ScopedConsoleSymbol]
    const backgroundColor =
      (lastScopedData ? prependConfig.color : firstColor) ?? specialPalette.default
    const textColor = '#fff'
    const leadingWhitespace = lastScopedData ? ['%c '] : ['%c']
    const currentScopedData: ScopedData = {
      badgeNames: [
        ...(lastScopedData?.badgeNames ?? []),
        ...leadingWhitespace,
        `%c${prependConfig.name}`,
      ],
      badgeValues: [
        ...(lastScopedData?.badgeValues ?? []),
        '',
        `background-color: ${backgroundColor}; color: ${textColor}; padding: 2px 4px; border-radius: 4px;`,
      ],
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
      let returnValue: any
      if (groupCounter === 0) {
        returnValue = rootTarget.apply(this, [
          currentScopedData.badgeNames.join(''),
          ...currentScopedData.badgeValues,
          ...args,
        ])
      } else {
        returnValue = rootTarget.apply(this, args)
      }
      afterCall(hookPayload)
      return returnValue
    }
    patchedLog[ScopedConsoleSymbol] = currentScopedData
    return patchedLog
  }
  const prependGroupBadge = (
    target: (...args: any[]) => void,
    groupConfig: ScopedConsoleConfig,
    firstColor = groupConfig.color,
    counter: (num: number) => number = n => n,
  ) => {
    const patch = prependBadge(target, groupConfig, firstColor)
    const patchedGroup = function patchedGroup(...args: any[]) {
      const returnValue = patch.apply(this, args)
      groupCounter = counter(groupCounter)
      return returnValue
    }
    patchedGroup[ScopedConsoleSymbol] = patch[ScopedConsoleSymbol]
    return patchedGroup
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
    ...unsafeWindow.console,
    ...console,
  }

  scopedConsole.log = prependBadge(console.log, actualConfig)
  scopedConsole.info = prependBadge(console.info, actualConfig)
  scopedConsole.warn = prependBadge(console.warn, actualConfig, specialPalette.warn)
  scopedConsole.error = prependBadge(console.error, actualConfig, specialPalette.error)

  scopedConsole.group = prependGroupBadge(
    console.group,
    actualConfig,
    specialPalette.group,
    n => n + 1,
  )
  scopedConsole.groupCollapsed = prependGroupBadge(
    console.groupCollapsed,
    actualConfig,
    specialPalette.group,
    n => n + 1,
  )
  scopedConsole.groupEnd = prependGroupBadge(
    console.groupEnd,
    actualConfig,
    specialPalette.group,
    n => n - 1,
  )
  scopedConsole.debug = (() => {
    const patch = prependBadge(console.debug, actualConfig)
    return function patchedDebug(...args: any[]) {
      if (!getGeneralSettings().devMode) {
        return undefined
      }
      return patch.apply(this, args)
    }
  })()
  afterCreate(actualConfig, scopedConsole)
  return scopedConsole
}
/**
 * 创建一个随机前缀的 ScopedConsole
 * @param config 配置对象
 */
export const randomScopedConsole = (config: Omit<ScopedConsoleConfig, 'name'>) =>
  useScopedConsole({ ...config, name: getRandomId() })
