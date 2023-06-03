import { defineComponentMetadata } from '@/components/define'
import { videoChange, VideoChangeCallback } from '@/core/observer'
import { createHook } from '@/core/utils'
import { playerUrls } from '@/core/utils/urls'

const entry = async () => {
  let lastAid: string
  const removeCover = () => document.documentElement.style.removeProperty('--cover-url')
  videoChange(() => {
    console.debug('isBpxPlayer')
    const currentBpxVideo = dq('.bpx-player-video-wrap video') as HTMLVideoElement
    if (!currentBpxVideo) {
      console.warn('bpx player not found')
      return
    }
    createHook(currentBpxVideo, 'play', () => {
      removeCover()
      return true
    })
  })
  const showCover: VideoChangeCallback = async ({ aid }) => {
    if (!aid) {
      console.warn('[播放前显示封面] 未找到av号')
      return
    }
    if (aid === lastAid) {
      return
    }
    lastAid = aid
    const { VideoInfo } = await import('@/components/video/video-info')
    const info = new VideoInfo(aid)
    await info.fetchInfo()
    document.documentElement.style.setProperty('--cover-url', `url('${info.coverUrl}')`)
  }
  videoChange(showCover)
}
export const component = defineComponentMetadata({
  name: 'showCoverBeforePlay',
  displayName: '播放前显示封面',
  urlInclude: playerUrls,
  entry,
  instantStyles: [
    {
      name: 'showCoverBeforePlay',
      style: () => import('./cover.scss'),
    },
  ],
  description: {
    'zh-CN': '在视频开始播放前, 在播放器中显示封面.',
  },
  tags: [componentsTags.video],
})
