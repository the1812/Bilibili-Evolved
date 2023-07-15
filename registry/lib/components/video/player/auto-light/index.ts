import { playerAgent } from '@/components/video/player-agent'
import { lightOn, lightOff } from '@/components/video/player-light'
import { videoChange } from '@/core/observer'
import { allVideoUrls } from '@/core/utils/urls'
import type { PlayerAgent } from '@/components/video/player-agent/base'
import { StarAnim } from './animation'
import { defineComponentMetadata } from '@/components/define'

let playerAgentInstance: PlayerAgent

export const component = defineComponentMetadata({
  name: 'playerAutoLight',
  displayName: '播放时自动关灯',
  urlInclude: allVideoUrls,
  tags: [componentsTags.video],
  options: {
    starAnimation: {
      defaultValue: true,
      displayName: '启用星光动画',
    },
  },
  description: {
    'zh-CN': '在视频播放时自动关灯, 暂停或结束时再自动打开.',
  },
  entry: async ({ settings }) => {
    const { isEmbeddedPlayer } = await import('@/core/utils')

    if (isEmbeddedPlayer()) {
      return
    }

    const makeLightOn = () => {
      lightOn()
      StarAnim(false)
    }

    const makeLightOff = () => {
      lightOff()
      if (settings.options.starAnimation) {
        StarAnim(true)
      }
    }

    videoChange(async () => {
      if (playerAgentInstance != null) {
        const oldVideo = await playerAgentInstance.query.video.element()
        oldVideo.removeEventListener('ended', makeLightOn)
        oldVideo.removeEventListener('pause', makeLightOn)
        oldVideo.removeEventListener('play', makeLightOff)
      }

      playerAgentInstance = playerAgent
      const video = await playerAgentInstance.query.video.element()

      if (playerAgentInstance.isAutoPlay()) {
        makeLightOff()
      }

      video.addEventListener('ended', makeLightOn)
      video.addEventListener('pause', makeLightOn)
      video.addEventListener('play', makeLightOff)
    })
  },
})
