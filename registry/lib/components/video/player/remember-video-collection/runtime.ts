import { getComponentSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import type { VideoInfo } from '@/components/video/video-info'
import {
  clearHistoryInScope,
  getClearHistoryDescription,
  getHistoryInScope,
  getHistoryScopeLabel,
} from './history'
import { jumpToInstruction, type JumpInstruction } from './navigation'
import {
  SectionMode,
  type ComponentMemory,
  type ComponentOptions,
  type HistoryScope,
  type MarkingInstruction,
} from './types'

const componentName = 'rememberVideoCollection'
const componentDisplayName = '记忆合集进度'

type RuntimeContext = {
  currentDetail?: VideoInfo
  currentMemory?: ComponentMemory | null
  currentInstructions: MarkingInstruction[]
  historyScope: HistoryScope | null
  pendingJumpTargets?: PendingJumpTargets
  sectionMode: SectionMode
}

type PendingJumpTargets = Pick<
  RememberVideoCollectionRuntimeState,
  | 'canJumpLast'
  | 'canJumpNext'
  | 'lastPlayedInstruction'
  | 'lastPlayedLabel'
  | 'nextInstruction'
  | 'nextLabel'
>

export type RememberVideoCollectionRuntimeState = {
  available: boolean
  canJumpLast: boolean
  canJumpNext: boolean
  canClear: boolean
  canClearAll: boolean
  clearDescription: string
  clearScopeButtonText: string
  scopeLabel: string
  scopeTitle?: string
  scopedHistoryCount: number
  totalHistoryCount: number
  lastPlayedInstruction?: MarkingInstruction
  lastPlayedLabel?: string
  nextInstruction?: JumpInstruction
  nextLabel?: string
}

const listeners = new Set<(state: RememberVideoCollectionRuntimeState) => void>()
const runtimeContext: RuntimeContext = {
  currentDetail: undefined,
  currentMemory: undefined,
  currentInstructions: [],
  historyScope: null,
  pendingJumpTargets: undefined,
  sectionMode: SectionMode.Split,
}
let runtimeState: RememberVideoCollectionRuntimeState = {
  available: false,
  canJumpLast: false,
  canJumpNext: false,
  canClear: false,
  canClearAll: false,
  clearDescription: '当前页面没有可管理的播放记忆',
  clearScopeButtonText: '清除当前作用域记忆',
  scopeLabel: '当前作用域',
  scopeTitle: undefined,
  scopedHistoryCount: 0,
  totalHistoryCount: 0,
}

const notify = () => {
  listeners.forEach(listener => listener({ ...runtimeState }))
}

const getClearScopeButtonText = (
  historyScope: HistoryScope | null,
  sectionMode: SectionMode,
  currentMemory?: Pick<ComponentMemory, 'sectionId'> | null,
) => {
  if (
    sectionMode === SectionMode.Split &&
    historyScope?.type === 'multi-sections' &&
    currentMemory?.sectionId !== undefined
  ) {
    return '清除当前 TAB 记忆'
  }
  if (historyScope?.type === 'multi-p') {
    return '清除当前视频记忆'
  }
  if (historyScope?.type === 'sections') {
    return '清除当前合集记忆'
  }
  return '清除当前作用域记忆'
}

const deriveRuntimeState = (): RememberVideoCollectionRuntimeState => {
  const { currentDetail, currentMemory, historyScope, pendingJumpTargets, sectionMode } =
    runtimeContext
  const available = Boolean(currentDetail && currentMemory && historyScope)
  const currentHistory = getComponentSettings<ComponentOptions>(componentName).options.history
  const scopedHistory = getHistoryInScope(currentHistory, historyScope, sectionMode, currentMemory)
  const jumpTargets = pendingJumpTargets ?? {
    lastPlayedInstruction: undefined,
    lastPlayedLabel: undefined,
    nextInstruction: undefined,
    nextLabel: undefined,
    canJumpLast: false,
    canJumpNext: false,
  }

  return {
    available,
    canJumpLast: jumpTargets.canJumpLast,
    canJumpNext: jumpTargets.canJumpNext,
    canClear: scopedHistory.length > 0,
    canClearAll: currentHistory.length > 0,
    clearDescription: getClearHistoryDescription(historyScope, sectionMode, currentMemory),
    clearScopeButtonText: getClearScopeButtonText(historyScope, sectionMode, currentMemory),
    scopeLabel:
      sectionMode === SectionMode.Split &&
      historyScope?.type === 'multi-sections' &&
      currentMemory?.sectionId !== undefined
        ? '当前 TAB'
        : '当前作用域',
    scopeTitle: getHistoryScopeLabel(currentDetail, historyScope, sectionMode, currentMemory),
    scopedHistoryCount: scopedHistory.length,
    totalHistoryCount: currentHistory.length,
    lastPlayedInstruction: jumpTargets.lastPlayedInstruction,
    lastPlayedLabel: jumpTargets.lastPlayedLabel,
    nextInstruction: jumpTargets.nextInstruction,
    nextLabel: jumpTargets.nextLabel,
  }
}

export const updateRememberVideoCollectionRuntime = (context: Partial<RuntimeContext>) => {
  Object.assign(runtimeContext, context)
  runtimeState = deriveRuntimeState()
  notify()
}

export const resetRememberVideoCollectionRuntime = () => {
  runtimeContext.currentDetail = undefined
  runtimeContext.currentMemory = undefined
  runtimeContext.currentInstructions = []
  runtimeContext.historyScope = null
  runtimeContext.pendingJumpTargets = undefined
  runtimeContext.sectionMode = SectionMode.Split
  runtimeState = deriveRuntimeState()
  notify()
}

export const getRememberVideoCollectionRuntimeState = () => ({ ...runtimeState })

export const subscribeRememberVideoCollectionRuntimeState = (
  listener: (state: RememberVideoCollectionRuntimeState) => void,
) => {
  listeners.add(listener)
  listener({ ...runtimeState })
  return () => listeners.delete(listener)
}

export const setRememberVideoCollectionPendingJumpTargets = (
  pendingJumpTargets?: PendingJumpTargets,
) => {
  runtimeContext.pendingJumpTargets = pendingJumpTargets
  runtimeState = deriveRuntimeState()
  notify()
}

export const clearRememberVideoCollectionPendingJumpTargets = () => {
  setRememberVideoCollectionPendingJumpTargets(undefined)
}

const runJump = (instruction?: JumpInstruction) => {
  if (!instruction) {
    return false
  }
  const jumpSucceeded = jumpToInstruction(instruction)
  if (!jumpSucceeded) {
    Toast.error('跳转失败', componentDisplayName, 3e3)
    return false
  }
  clearRememberVideoCollectionPendingJumpTargets()
  return true
}

export const jumpToRememberedVideo = () => runJump(runtimeState.lastPlayedInstruction)

export const jumpToRememberedNextVideo = () => runJump(runtimeState.nextInstruction)

export const clearRememberedHistory = () => {
  const { historyScope, currentMemory, sectionMode } = runtimeContext
  if (!historyScope) {
    return false
  }
  const settings = getComponentSettings<ComponentOptions>(componentName)
  const nextHistory = clearHistoryInScope(
    settings.options.history,
    historyScope,
    sectionMode,
    currentMemory,
  )
  if (nextHistory.length === settings.options.history.length) {
    return false
  }
  settings.options.history = nextHistory
  clearRememberVideoCollectionPendingJumpTargets()
  Toast.success('已清除当前作用域的播放记忆', componentDisplayName, 3e3)
  return true
}

export const clearAllRememberedHistory = () => {
  const settings = getComponentSettings<ComponentOptions>(componentName)
  if (settings.options.history.length === 0) {
    return false
  }
  settings.options.history = []
  clearRememberVideoCollectionPendingJumpTargets()
  Toast.success('已清除全部播放记忆', componentDisplayName, 3e3)
  return true
}
