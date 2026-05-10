import { addComponentListener, getComponentSettings } from '@/core/settings'
import { getSpeedContext } from '../common/speed/context'
import type { RBVPEngineContext, RBVPRuntime, RBVPResolvedAction } from '../rbvp/types'
import { getRememberSpeedRbvpApi, readRememberSpeedGlobal, readRememberSpeedLocal } from './api'
import type { Options } from './component'

const getRememberSpeedOptions = () => getComponentSettings<Options>('rememberVideoSpeed').options
const rememberVideoSpeedGuard = 'rememberVideoSpeed:execute'

const parseNamedSpeed = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'max') {
    return 'MAX'
  }
  if (normalized === 'min') {
    return 'MIN'
  }
  if (normalized === 'memory_local') {
    return 'MEMORY_LOCAL'
  }
  if (normalized === 'memory_global') {
    return 'MEMORY_GLOBAL'
  }
  const speed = parseFloat(value)
  return Number.isFinite(speed) ? speed : null
}

export const rememberVideoSpeedNamespaceProvider = {
  displayName: '记忆倍速',
  primaryName: 'rememberVideoSpeed',
  description:
    '兼容「记忆倍速」组件的存储与执行能力。可用动作值：填写倍速数值（如 1.5、2）、MAX（最高可用倍速）、MIN（最低可用倍速）、MEMORY_LOCAL（当前视频记忆的倍速）、MEMORY_GLOBAL（全局记忆的倍速）。',
  aliases: ['speed'],
  getTakeoverState: () => getRememberSpeedOptions().useRbvp,
  setTakeoverState: (value: boolean) => {
    getRememberSpeedOptions().useRbvp = value
  },
  setup: async (runtime: RBVPRuntime) => {
    const speedContext = await getSpeedContext()
    speedContext.videoSpeedChange$.subscribe(value => {
      const api = getRememberSpeedRbvpApi()
      if (!api || runtime.hasGuard(rememberVideoSpeedGuard)) {
        return
      }
      api.rememberGlobalSpeed(value)
      api.rememberLocalSpeed(value)
    })
    addComponentListener('rememberVideoSpeed.useRbvp', () => {
      runtime.requestApplyRules()
    })
  },
  validateAction: rawValue => {
    if (parseNamedSpeed(rawValue) === null) {
      throw new Error(`不支持的 rememberVideoSpeed 动作值: ${rawValue}`)
    }
  },
  resolveAction: async (rawValue, context) => {
    const parsed = parseNamedSpeed(rawValue)
    if (parsed === null) {
      return null
    }
    if (parsed === 'MEMORY_LOCAL') {
      const speed = readRememberSpeedLocal(context.video.aid) ?? readRememberSpeedGlobal()
      return {
        namespace: 'rememberVideoSpeed',
        value: speed,
        displayValue: `${speed}x`,
      }
    }
    if (parsed === 'MEMORY_GLOBAL') {
      const speed = readRememberSpeedGlobal()
      return {
        namespace: 'rememberVideoSpeed',
        value: speed,
        displayValue: `${speed}x`,
      }
    }
    if (parsed === 'MAX' || parsed === 'MIN') {
      const speedContext = await getSpeedContext()
      const speedValues = speedContext.getAvailableSpeedValues()
      const speed = parsed === 'MAX' ? speedValues.slice(-1)[0] : speedValues[0]
      return speed
        ? {
            namespace: 'rememberVideoSpeed',
            value: speed,
            displayValue: `${speed}x`,
          }
        : null
    }
    return {
      namespace: 'rememberVideoSpeed',
      value: parsed,
      displayValue: `${parsed}x`,
    }
  },
  execute: async (action: RBVPResolvedAction, context: RBVPEngineContext) => {
    if (context.runtime.hasGuard(rememberVideoSpeedGuard)) {
      return undefined
    }
    const speed = Number(action.value)
    context.runtime.enterGuard(rememberVideoSpeedGuard)
    try {
      const speedContext = await getSpeedContext()
      await speedContext.set(speed, 1000)
      return `rememberVideoSpeed => ${action.displayValue}`
    } finally {
      window.setTimeout(() => {
        context.runtime.leaveGuard(rememberVideoSpeedGuard)
      }, 300)
    }
  },
}
