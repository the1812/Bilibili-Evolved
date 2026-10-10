import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { getComponentSettings, isComponentEnabled } from '@/core/settings'
import { allVideoUrls } from '@/core/utils/urls'
import { showPlayerTip } from '../common/player-tip/player-tip'

const name = 'scrollVolume'
const displayName = '滚轮调节音量'

/** Chromium 中一行滚动对应的像素数 (`kScrollbarPixelsPerLine`) */
const pixelsPerLine = 100 / 3

const fullscreenModeClasses = [
  'player-mode-full',
  'player-mode-web',
  'player-fullscreen-fix',
  'player-full-win',
]
const isFullscreenPlayerMode = () =>
  fullscreenModeClasses.some(token => document.body.classList.contains(token))

const options = defineOptionsMetadata({
  step: {
    defaultValue: 5,
    displayName: '每次滚轮的调节幅度 (%)',
    slider: {
      min: 1,
      max: 30,
      step: 1,
    },
  },
  applyOnNormalMode: {
    defaultValue: true,
    displayName: '常规模式下也可调节',
  },
})
export type Options = OptionsOfMetadata<typeof options>

/**
 * 计算本次滚轮事件对应的格数 (正数为增大音量)
 * 像素模式下以最小的一行 (`pixelsPerLine`) 为一格, 使每格滚轮的幅度不受系统「一次滚动的行数」影响
 */
const parseNotches = (e: WheelEvent) => {
  const notches = e.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? -e.deltaY / pixelsPerLine : -e.deltaY
  return lodash.clamp(notches, -1, 1)
}

/** 在播放器中央显示当前音量 (与快捷键扩展一致) */
const showVolumeTip = (volume: number) => {
  if (volume === 0) {
    showPlayerTip('静音', 'mdi-volume-off')
  } else {
    showPlayerTip(`${volume}%`, 'mdi-volume-high')
  }
}

let cancel: () => void
const setup = () => {
  cancel?.()
  const settings = getComponentSettings<Options>(name)
  const handleWheel = (e: WheelEvent) => {
    // 已启用「禁止滚轮调音量」
    if (isComponentEnabled('disableScrollVolume')) {
      return
    }
    // 常规 / 宽屏 / 小窗模式下播放器自身不处理滚轮, 需要额外开启
    if (!isFullscreenPlayerMode() && !settings.options.applyOnNormalMode) {
      return
    }
    const videoArea = playerAgent.query.video.wrap.sync()
    if (!videoArea || !videoArea.contains(e.target as Node)) {
      return
    }
    const notches = parseNotches(e)
    if (notches === 0) {
      return
    }
    const volume = playerAgent.changeVolume(settings.options.step * notches)
    if (lodash.isNil(volume)) {
      return
    }
    showVolumeTip(volume)
    e.preventDefault()
    e.stopImmediatePropagation()
  }
  unsafeWindow.addEventListener('wheel', handleWheel, { capture: true, passive: false })
  cancel = () => unsafeWindow.removeEventListener('wheel', handleWheel, { capture: true })
}

export const component = defineComponentMetadata({
  name,
  displayName,
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  tags: [componentsTags.video],
  options,
  entry: setup,
  reload: setup,
  unload: () => cancel?.(),
  urlInclude: allVideoUrls,
})
