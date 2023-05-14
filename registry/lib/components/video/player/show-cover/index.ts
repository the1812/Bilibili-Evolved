import { defineComponentMetadata } from '@/components/define'
import { videoChange, VideoChangeCallback } from '@/core/observer'
import { createHook, isBwpVideo } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { playerUrls } from '@/core/utils/urls'

const entry = async () => {
  let lastAid: string
  const removeCover = () => document.documentElement.style.removeProperty('--cover-url')
  const mainPlayer = dq(':is(.bilibili-player-area, .bpx-player-primary-area) :is(.bilibili-player-video , .bpx-player-video-wrap) video')
  //主要区域的播放器，避免hook到`inline-player`(右边区域的接下来播放和推荐视频的预览播放器)
  //话是这么说，但是执行`dq`的时候只有主播放器能选择到
  mainPlayer.addEventListener('play',(e)=>{
    removeCover()
    return true
  })
  // if (isBpxPlayer) {
  //   videoChange(() => {
  //     console.debug('isBpxPlayer')
  //     const currentBpxVideo = dq('.bpx-player-primary-area .bpx-player-video-wrap video') as HTMLVideoElement
  //     if (!currentBpxVideo) {
  //       console.warn('bpx player not found')
  //       return
  //     }
  //     createHook(currentBpxVideo, 'play', () => {
  //       removeCover()
  //       return true
  //     })
  //   })
  // }
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
