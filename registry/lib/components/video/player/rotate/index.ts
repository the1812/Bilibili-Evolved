import { defineComponentMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { addControlBarButton, removeControlBarButton } from '@/components/video/video-control-bar'
import { sizeChange, videoChange } from '@/core/observer'
import { getComponentSettings } from '@/core/settings'
import { playerUrls } from '@/core/utils/urls'
import { KeyBindingAction } from '../../../utils/keymap/bindings'
import { showPlayerTip } from '../common/player-tip/player-tip'

const name = 'videoRotate'
const displayName = '视频旋转'
const rotateIcon = 'mdi-rotate-left'
const activeClass = 'be-video-rotate'
const angleVar = '--be-video-rotate-angle'
const scaleVar = '--be-video-rotate-scale'
const videoWrapSelector = '.bpx-player-video-wrap'

/** 当前逆时针旋转角度 (0 / 90 / 180 / 270) */
let angle = 0
let resizeObserver: ResizeObserver | null = null

const computeScale = (wrap: HTMLElement) => {
  if (angle % 180 === 0) {
    return 1
  }
  const { clientWidth: wrapWidth, clientHeight: wrapHeight } = wrap
  if (!wrapWidth || !wrapHeight) {
    return 1
  }
  const video = playerAgent.query.video.element.sync() as HTMLVideoElement | null
  const useIntrinsic =
    video?.videoWidth && video.videoHeight && window.getComputedStyle(video).objectFit !== 'fill'
  const sourceWidth = useIntrinsic ? video.videoWidth : wrapWidth
  const sourceHeight = useIntrinsic ? video.videoHeight : wrapHeight
  return (
    Math.min(wrapWidth / sourceHeight, wrapHeight / sourceWidth) /
    Math.min(wrapWidth / sourceWidth, wrapHeight / sourceHeight)
  )
}

const applyRotation = () => {
  const playerArea = playerAgent.query.playerArea.sync()
  if (angle === 0) {
    resizeObserver?.disconnect()
    resizeObserver = null
    playerArea?.classList.remove(activeClass)
    playerArea?.style.removeProperty(angleVar)
    playerArea?.style.removeProperty(scaleVar)
    return
  }
  const wrap = playerArea?.querySelector(videoWrapSelector) as HTMLElement | null
  if (!playerArea || !wrap) {
    return
  }
  playerArea.style.setProperty(angleVar, `${-angle}deg`)
  playerArea.style.setProperty(scaleVar, `${computeScale(wrap)}`)
  playerArea.classList.add(activeClass)
  if (!resizeObserver) {
    ;[resizeObserver] = sizeChange(wrap, applyRotation)
  }
}

const resetRotation = () => {
  if (angle !== 0) {
    angle = 0
    applyRotation()
  }
}

const rotate = () => {
  if (!playerAgent.query.playerArea.sync()?.querySelector(videoWrapSelector)) {
    return undefined
  }
  angle = (angle + 90) % 360
  applyRotation()
  showPlayerTip(angle === 0 ? '已重置旋转' : `旋转 ${angle}°`, rotateIcon)
  return true
}

const enable = () =>
  addControlBarButton({
    name,
    displayName: '旋转',
    icon: rotateIcon,
    order: 4,
    action: () => {
      rotate()
    },
  })

export const component = defineComponentMetadata({
  author: { name: 'WhiteTeal55', link: 'https://github.com/WhiteTeal55' },
  name,
  displayName,
  tags: [componentsTags.video],
  instantStyles: [{ name, style: () => import('./rotate.scss') }],
  entry: async () => {
    videoChange(resetRotation)
    await enable()
  },
  reload: enable,
  unload: async () => {
    resetRotation()
    await removeControlBarButton(name)
  },
  urlInclude: playerUrls,
  plugin: {
    displayName: `${displayName} - 快捷键支持`,
    setup: ({ addData }) => {
      const settings = getComponentSettings(component)
      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.videoRotate = {
          displayName: '旋转视频',
          run: () => (settings?.enabled ? rotate() : undefined),
        }
      })
    },
  },
})
