import { defineComponentMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { addControlBarButton, removeControlBarButton } from '@/components/video/video-control-bar'
import { videoChange } from '@/core/observer'
import { getComponentSettings } from '@/core/settings'
import { formatDuration } from '@/core/utils/formatters'
import { playerUrls } from '@/core/utils/urls'
import { addData } from '@/plugins/data'
import { KeyBindingAction } from '../../../utils/keymap/bindings'
import { showPlayerTip } from '../common/player-tip/player-tip'
import abLoopIcon from './ab-loop.svg'

const name = 'abLoop'
const displayName = 'AB 区段循环播放'
/** A / B 点最小间隔 (秒) */
const minLoopDuration = 0.5
const progressSelector = '.bpx-player-progress'
const markerClass = 'be-ab-loop-marker'
const buttonActiveClass = 'be-ab-loop-active'
const buttonSelector = `.be-video-control-bar-extend [data-name="${name}"]`

type TriggerSource = 'button' | 'keyboard'

/** A / B 点 (秒); seekedPastB: 手动 seek 越过 B 点后暂不循环 */
const loop = { a: null as number | null, b: null as number | null, seekedPastB: false }
let watchingVideo: HTMLVideoElement | null = null
let frameCallbackId: number | null = null

const getVideo = () => playerAgent.query.video.element.sync() as HTMLVideoElement | null

/** 跳转到指定时间, 保持播放 / 暂停状态 */
const seekTo = (time: number) => {
  const video = getVideo()
  if (!video) {
    return
  }
  const { nativeApi } = playerAgent
  if (nativeApi?.seek) {
    nativeApi.seek(time, video.paused)
  } else {
    video.currentTime = time
  }
}

/** 播放经过 B 点跳回 A 点; 手动 seek 越过不触发 (与 mpv 一致) */
const checkLoop = () => {
  const video = watchingVideo
  if (!video || loop.a === null || loop.b === null) {
    return
  }
  if (video.currentTime < loop.b) {
    loop.seekedPastB = false
  } else if (!loop.seekedPastB) {
    seekTo(loop.a)
  }
}

const handleSeeking = () => {
  const video = watchingVideo
  if (video && loop.b !== null) {
    loop.seekedPastB = video.currentTime >= loop.b
  }
}

const stopWatching = () => {
  const video = watchingVideo
  watchingVideo = null
  loop.seekedPastB = false
  if (!video) {
    return
  }
  if (frameCallbackId !== null) {
    video.cancelVideoFrameCallback(frameCallbackId)
    frameCallbackId = null
  }
  video.removeEventListener('timeupdate', checkLoop)
  video.removeEventListener('seeking', handleSeeking)
}

const startWatching = () => {
  stopWatching()
  const video = getVideo()
  if (!video) {
    return
  }
  watchingVideo = video
  // 逐帧检查保证循环点准确, `timeupdate` 兜底后台标签页
  video.addEventListener('timeupdate', checkLoop)
  video.addEventListener('seeking', handleSeeking)
  if (video.requestVideoFrameCallback) {
    const tick = () => {
      checkLoop()
      frameCallbackId = video.requestVideoFrameCallback(tick)
    }
    frameCallbackId = video.requestVideoFrameCallback(tick)
  }
}

const updateMarkers = () => {
  const area = dq(progressSelector)
  area?.querySelectorAll(`.${markerClass}`).forEach(marker => marker.remove())
  const duration = getVideo()?.duration
  if (!area || !duration || !Number.isFinite(duration)) {
    return
  }
  const addMarker = (point: number | null) => {
    if (point === null) {
      return
    }
    const marker = document.createElement('div')
    marker.className = markerClass
    marker.style.left = `${(point / duration) * 100}%`
    area.appendChild(marker)
  }
  addMarker(loop.a)
  addMarker(loop.b)
}

const refreshButtonState = () => {
  dq(buttonSelector)?.classList.toggle(buttonActiveClass, loop.b !== null)
}

const resetPoints = () => {
  loop.a = null
  loop.b = null
  stopWatching()
  updateMarkers()
  refreshButtonState()
}

const setPointA = (source: TriggerSource) => {
  const video = getVideo()
  if (!video) {
    return undefined
  }
  const time = video.currentTime
  loop.a = time
  // 循环中移动 A 点, 只要仍有效就不中断循环
  if (loop.b !== null && loop.b - time >= minLoopDuration) {
    showPlayerTip(`A-B 循环 ${formatDuration(time)} - ${formatDuration(loop.b)}`, 'mdi-repeat')
  } else {
    loop.b = null
    stopWatching()
    const hint = source === 'button' ? ', 再次点击设置 B 点' : ''
    showPlayerTip(`A 点 ${formatDuration(time)}${hint}`, 'mdi-alpha-a-box')
  }
  updateMarkers()
  refreshButtonState()
  return true
}

const setPointB = () => {
  const video = getVideo()
  if (!video) {
    return undefined
  }
  if (loop.a === null) {
    showPlayerTip('请先设置 A 点', 'mdi-alert-circle-outline')
    return true
  }
  if (video.currentTime - loop.a < minLoopDuration) {
    showPlayerTip('B 点需在 A 点之后', 'mdi-alert-circle-outline')
    return true
  }
  loop.b = video.currentTime
  startWatching()
  updateMarkers()
  refreshButtonState()
  seekTo(loop.a)
  showPlayerTip(`A-B 循环 ${formatDuration(loop.a)} - ${formatDuration(loop.b)}`, 'mdi-repeat')
  return true
}

const clearLoop = () => {
  if (loop.a === null && loop.b === null) {
    return undefined
  }
  resetPoints()
  showPlayerTip('已退出 A-B 循环', 'mdi-repeat-off')
  return true
}

const handleButtonClick = () => {
  const video = getVideo()
  if (!video) {
    return
  }
  if (loop.a === null) {
    setPointA('button')
    return
  }
  if (loop.b !== null) {
    clearLoop()
    return
  }
  // 太靠近 A 点视为重设 A
  if (video.currentTime - loop.a < minLoopDuration) {
    setPointA('button')
    return
  }
  setPointB()
}

const enable = async () => {
  videoChange(resetPoints)
  addData('ui.icons', (icons: Record<string, string>) => {
    icons['ab-loop'] = abLoopIcon
  })
  await addControlBarButton({
    name,
    displayName,
    icon: 'ab-loop',
    order: 3,
    action: handleButtonClick,
  })
}

export const component = defineComponentMetadata({
  author: { name: 'WhiteTeal55', link: 'https://github.com/WhiteTeal55' },
  name,
  displayName,
  tags: [componentsTags.video],
  instantStyles: [{ name, style: () => import('./ab-loop.scss') }],
  entry: enable,
  reload: enable,
  unload: async () => {
    resetPoints()
    await removeControlBarButton(name)
  },
  urlInclude: playerUrls,
  plugin: {
    displayName: `${displayName} - 快捷键支持`,
    setup: () => {
      const settings = getComponentSettings(component)
      const action = (label: string, callback: () => unknown): KeyBindingAction => ({
        displayName: label,
        run: () => (settings?.enabled ? callback() : undefined),
      })
      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.abLoopSetA = action('设置 A 点', () => setPointA('keyboard'))
        actions.abLoopSetB = action('设置 B 点', () => setPointB())
        actions.abLoopClear = action('退出 A-B 循环', () => clearLoop())
      })
    },
  },
})
