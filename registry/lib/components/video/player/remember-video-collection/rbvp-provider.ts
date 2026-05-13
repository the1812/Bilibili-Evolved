import { addComponentListener, getComponentSettings } from '@/core/settings'
import type { RBVPEngineContext, RBVPRuntime, RBVPResolvedAction } from '../rbvp/types'
import {
  clearRememberVideoCollectionRbvpMode,
  getRememberVideoCollectionRbvpTakeoverState,
  getRememberVideoCollectionRbvpVideoKey,
  runRememberVideoCollectionPendingApply,
  setRememberVideoCollectionRbvpMode,
  setRememberVideoCollectionRbvpTakeoverState,
} from './rbvp'

const componentName = 'rememberVideoCollection'

const parseRememberVideoCollectionMode = (value: string) => {
  const normalized = value.trim().toUpperCase()
  return normalized === 'ON' || normalized === 'OFF' ? normalized : null
}

export const rememberVideoCollectionNamespaceProvider = {
  displayName: '记忆合集',
  primaryName: componentName,
  description:
    '兼容「记忆合集」组件的恢复策略控制。ON 按原逻辑恢复并记忆合集进度，OFF 则跳过恢复且不记录当前合集记忆进度。',
  aliases: ['collection'],
  prepare: (context: RBVPEngineContext) => {
    clearRememberVideoCollectionRbvpMode(
      getRememberVideoCollectionRbvpVideoKey(context.video.aid, context.video.cid),
    )
  },
  getTakeoverState: () => getRememberVideoCollectionRbvpTakeoverState(),
  setTakeoverState: (value: boolean) => {
    setRememberVideoCollectionRbvpTakeoverState(value)
  },
  isComponentEnabled: () => getComponentSettings(componentName).enabled,
  setup: (runtime: RBVPRuntime) => {
    addComponentListener(`${componentName}.useRbvp`, () => {
      runtime.requestApplyRules()
    })
  },
  validateAction: rawValue => {
    if (parseRememberVideoCollectionMode(rawValue) === null) {
      throw new Error(`不支持的 rememberVideoCollection 动作值: ${rawValue}`)
    }
  },
  resolveAction: rawValue => {
    const mode = parseRememberVideoCollectionMode(rawValue)
    if (!mode) {
      return null
    }
    return {
      namespace: componentName,
      value: mode,
      displayValue: mode,
    }
  },
  execute: async (action: RBVPResolvedAction, context: RBVPEngineContext) => {
    const mode = action.value === 'OFF' ? 'OFF' : 'ON'
    const videoKey = getRememberVideoCollectionRbvpVideoKey(context.video.aid, context.video.cid)
    setRememberVideoCollectionRbvpMode(mode, videoKey)
    if (mode === 'ON') {
      await runRememberVideoCollectionPendingApply(videoKey)
    }
    return `${componentName} => ${mode}`
  },
}
