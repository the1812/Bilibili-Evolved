import { defineComponentMetadata } from '@/components/define'
import { playerAgent, PlayerAgentEventTypes } from '@/components/video/player-agent'
import {
  addControlBarButton,
  removeControlBarButton,
  VideoControlBarItem,
} from '@/components/video/video-control-bar'
import { videoChange } from '@/core/observer'
import { playerUrls } from '@/core/utils/urls'

/** 播放器 (DASH) 内部接口, 用于停止/恢复视频流的下载与解码 */
interface AudioOnlyPlayerApi {
  disableVideo?: (saveLastFrame?: boolean) => void
  enableVideo?: (transition?: boolean) => void
}
const getPlayerApi = () => playerAgent.nativeApi as AudioOnlyPlayerApi | undefined

const htmlClass = 'be-audio-only'
let enabled = false
/** 是否已由本组件停用视频流 */
let videoDisabled = false

const applyAudioOnly = () => {
  if (!enabled) {
    return
  }
  const player = getPlayerApi()
  if (!player?.disableVideo) {
    return
  }
  player.disableVideo(true)
  videoDisabled = true
  document.documentElement.classList.add(htmlClass)
}

const revertAudioOnly = () => {
  document.documentElement.classList.remove(htmlClass)
  if (!videoDisabled) {
    return
  }
  videoDisabled = false
  getPlayerApi()?.enableVideo?.(true)
}

const toggleAudioOnly = () => {
  enabled = !enabled
  if (enabled) {
    applyAudioOnly()
  } else {
    revertAudioOnly()
  }
}

const button: VideoControlBarItem = {
  name: 'audioOnly',
  displayName: '仅听视频',
  icon: 'mdi-headphones',
  order: 3,
  action: () => toggleAudioOnly(),
}

/** 播放器会在页面回到前台时自行恢复视频流, 因此需要重新停用 */
const visibilityHandler = () => {
  if (document.visibilityState === 'visible' && enabled) {
    setTimeout(applyAudioOnly, 1000)
  }
}

const entry = async () => {
  videoChange(() => {
    // 换集/分P切换时播放器实例可能重建, 需要重新挂载; 先移除避免监听器累积
    playerAgent.removeEventListener(PlayerAgentEventTypes.Play, applyAudioOnly)
    playerAgent.addEventListener(PlayerAgentEventTypes.Play, applyAudioOnly)
  })
  document.addEventListener('visibilitychange', visibilityHandler)
  await addControlBarButton(button)
}

export const component = defineComponentMetadata({
  name: 'audioOnly',
  displayName: '仅听视频',
  author: {
    name: 'weidows',
    link: 'https://github.com/weidows',
  },
  urlInclude: playerUrls,
  tags: [componentsTags.video],
  entry,
  reload: entry,
  unload: async () => {
    enabled = false
    revertAudioOnly()
    document.removeEventListener('visibilitychange', visibilityHandler)
    await removeControlBarButton(button.name)
  },
  instantStyles: [
    {
      name: 'audioOnly',
      style: () => import('./style.scss'),
    },
  ],
})
