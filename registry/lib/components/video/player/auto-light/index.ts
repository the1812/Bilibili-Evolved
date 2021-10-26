import { ComponentMetadata } from '@/components/types'
import { videoChange } from '@/core/observer'
import { allVideoUrls } from '@/core/utils/urls'

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
    const autoPlay = lodash.get(
      JSON.parse(localStorage.getItem('bilibili_player_settings')),
      'video_status.autoplay',
      false,
    )
    videoChange(() => {
      const video = dq('video') as HTMLVideoElement
      if (autoPlay) {
        lightOff()
      }
      video.addEventListener('ended', () => lightOn())
      video.addEventListener('pause', () => lightOn())
      video.addEventListener('play', () => lightOff())
    })
  },
}
