import { ComponentMetadata } from '@/components/types'
import { playerAgent } from '@/components/video/player-agent'
import { videoChange } from '@/core/observer'
import { allVideoUrls } from '@/core/utils/urls'

let playerAgentInstance

export const component: ComponentMetadata = {
  name: 'playerAutoLight',
  displayName: '播放时自动关灯',
  urlInclude: allVideoUrls,
  tags: [componentsTags.video],
  description: {
    'zh-CN': '在视频播放时自动关灯, 暂停或结束时再自动打开.',
  },
  entry: async () => {
    const { isEmbeddedPlayer } = await import('@/core/utils')
    const { lightOn, lightOff } = await import('@/components/video/player-light')

    if (isEmbeddedPlayer()) {
      return
    }

    videoChange(async () => {
      if (playerAgentInstance != null) {
        const oldVideo = await playerAgentInstance.query.video.element()
        oldVideo.removeEventListener('ended', lightOn)
        oldVideo.removeEventListener('pause', lightOn)
        oldVideo.removeEventListener('play', lightOff)
      }

      playerAgentInstance = playerAgent
      const { query, isAutoPlay } = playerAgentInstance
      const video = await query.video.element()

      if (isAutoPlay()) {
        lightOff()
      }

      video.addEventListener('ended', lightOn)
      video.addEventListener('pause', lightOn)
      video.addEventListener('play', lightOff)
    })
  },
}
