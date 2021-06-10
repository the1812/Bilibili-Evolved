import { ComponentMetadata, componentsTags } from '@/components/component'
import { ComponentSettings } from '@/core/settings'
import { videoSpeeds } from '../../video-speed'
import { playerUrls } from '../player-urls'

export const component: ComponentMetadata = {
  name: 'defaultVideoSpeed',
  displayName: '默认视频倍速',
  enabledByDefault: false,
  tags: [
    componentsTags.video,
  ],
  entry: async ({ options }: ComponentSettings) => {
    const { videoChange } = await import('@/core/observer')
    videoChange(async () => {
      const { select, sq } = await import('@/core/spin-query')
      const video = await select('.bilibili-player-video video') as HTMLVideoElement
      const speed = parseFloat(options.speed)
      video.playbackRate = speed
      sq(() => video, () => video.playbackRate !== speed)
        .then(() => (video.playbackRate = speed))
    })
  },
  options: {
    speed: {
      displayName: '倍速选择',
      defaultValue: '1.0x',
      dropdownEnum: videoSpeeds.map(it => `${it}x`),
    },
  },
  urlInclude: playerUrls,
}
