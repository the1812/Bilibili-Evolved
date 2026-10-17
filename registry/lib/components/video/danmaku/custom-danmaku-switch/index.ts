import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import type { PlayerAgentDanmakuSwitchState } from '@/components/video/player-agent'
import { getComponentSettings, isComponentEnabled } from '@/core/settings'
import { isTyping } from '@/core/utils'
import { playerUrls } from '@/core/utils/urls'
import { addData } from '@/plugins/data'
import type { KeyBindingAction } from '../../../utils/keymap/bindings'
import { showDanmakuStateTip } from '../../player/common/player-tip/player-tip'

const name = 'customDanmakuSwitch'
const displayName = '自定义弹幕切换行为'

/** 各循环设置对应的状态序列, 键为设置中显示的名称, 首个为默认值 */
const cycleStatesMap: Record<string, PlayerAgentDanmakuSwitchState[]> = {
  '开启 / 关闭': ['on', 'off'],
  '开启 / 精简 / 关闭': ['on', 'concise', 'off'],
  '开启 / 精简': ['on', 'concise'],
  '精简 / 关闭': ['concise', 'off'],
}
const cycleStateOptions = Object.keys(cycleStatesMap)

const options = defineOptionsMetadata({
  cycleStates: {
    defaultValue: cycleStateOptions[0],
    displayName: '循环状态',
    dropdownEnum: cycleStateOptions,
  },
})
export type Options = OptionsOfMetadata<typeof options>

const switchDanmakuByCycle = (current: PlayerAgentDanmakuSwitchState | null) => {
  if (lodash.isNil(current)) {
    return null
  }
  const supported = playerAgent.getSupportedDanmakuStates()
  const { cycleStates } = getComponentSettings<Options>(name).options
  const selected = cycleStatesMap[cycleStates].filter(state => supported.includes(state))
  const cycle = selected.length >= 2 ? selected : supported
  const target = cycle[(cycle.indexOf(current) + 1) % cycle.length]
  for (let i = 0; i < supported.length && playerAgent.getDanmakuState() !== target; i++) {
    playerAgent.toggleDanmaku()
  }
  return target
}

const runCustomDanmakuSwitch = () => {
  const state = switchDanmakuByCycle(playerAgent.getDanmakuState())
  if (lodash.isNil(state)) {
    return null
  }
  showDanmakuStateTip(state)
  return true
}

/** 被覆盖前的 keymap「弹幕开关」动作, 用于还原 */
let originalDanmakuRun: KeyBindingAction['run'] | null = null
/** 覆盖 / 还原 keymap 的「弹幕开关」动作 */
const setKeymapOverride = (override: boolean) => {
  addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
    const { danmaku } = actions
    if (override) {
      // 只记录首次覆盖前的动作
      originalDanmakuRun ??= danmaku.run
      danmaku.run = runCustomDanmakuSwitch
    } else if (originalDanmakuRun) {
      danmaku.run = originalDanmakuRun
      originalDanmakuRun = null
    }
  })
}

const isDanmakuSwitchTarget = (target: EventTarget | null) =>
  target instanceof Element && !!target.closest('.bpx-player-dm-switch')

/** 点击前的状态: 点击会改变开关, 之后读不到切换前的状态了 */
let preClickState: PlayerAgentDanmakuSwitchState | null = null
const handleDanmakuSwitchPointerdown = (e: PointerEvent) => {
  if (e.button === 0 && isDanmakuSwitchTarget(e.target)) {
    preClickState = playerAgent.getDanmakuState()
  }
}

/** 点击播放器弹幕按钮: 等原生切换生效后, 再把开关调整到目标状态 */
const handleDanmakuSwitchClick = (e: MouseEvent) => {
  if (!isDanmakuSwitchTarget(e.target)) {
    return
  }
  const from = preClickState
  preClickState = null
  window.setTimeout(() => switchDanmakuByCycle(from), 0)
}

/**
 * 接管播放器原生的 `d` 快捷键.
 * 快捷键扩展启用时不生效.
 */
const handleDanmakuSwitchKeydown = (e: KeyboardEvent) => {
  if (isComponentEnabled('keymap')) {
    return
  }
  const isDKey = e.key.toLowerCase() === 'd' || e.code.toLowerCase() === 'keyd'
  const hasModifier = e.ctrlKey || e.altKey || e.metaKey || e.shiftKey
  if (!isDKey || hasModifier || e.repeat || isTyping()) {
    return
  }
  if (lodash.isNil(playerAgent.getDanmakuState())) {
    return
  }
  e.preventDefault()
  e.stopImmediatePropagation()
  runCustomDanmakuSwitch()
}

const enable = () => {
  setKeymapOverride(true)
  document.addEventListener('pointerdown', handleDanmakuSwitchPointerdown, true)
  document.addEventListener('click', handleDanmakuSwitchClick, true)
  document.addEventListener('keydown', handleDanmakuSwitchKeydown, true)
}
const disable = () => {
  setKeymapOverride(false)
  document.removeEventListener('pointerdown', handleDanmakuSwitchPointerdown, true)
  document.removeEventListener('click', handleDanmakuSwitchClick, true)
  document.removeEventListener('keydown', handleDanmakuSwitchKeydown, true)
}

export const component = defineComponentMetadata({
  name,
  displayName,
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  tags: [componentsTags.video, componentsTags.utils],
  urlInclude: playerUrls,
  options,
  entry: enable,
  reload: enable,
  unload: disable,
})
