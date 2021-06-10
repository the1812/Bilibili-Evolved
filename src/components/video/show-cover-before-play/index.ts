import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'
import { playerUrls } from '../player/player-urls'

const entry = async () => {
  const { select } = await import('@/core/spin-query')
  const { dq } = await import('@/core/utils')
  const { videoChange } = await import('@/core/observer')

  let lastCid: string
  const showCover = async () => {
    const removeCover = () => document.body.style.removeProperty('--cover-url')
    const originalPlay = HTMLVideoElement.prototype.play
    HTMLVideoElement.prototype.play = function play() {
      removeCover()
      return originalPlay.call(this)
    }
    const aid = await select(() => unsafeWindow.aid)
    if (!aid) {
      console.warn('[播放前显示封面] 未找到av号')
      return
    }
    const { cid } = unsafeWindow
    if (cid === lastCid || !cid) {
      return
    }
    lastCid = cid
    const { VideoInfo } = await import('../video-info')
    const info = new VideoInfo(aid)
    await info.fetchInfo()
    if (!(dq('video') as HTMLVideoElement).paused) {
      return
    }
    document.body.style.setProperty('--cover-url', `url('${info.coverUrl}')`)
  }
  if (document.URL.includes('//www.bilibili.com/bangumi/')) {
    videoChange(showCover)
  } else {
    showCover()
  }
}
export const component: ComponentMetadata = {
  name: 'showCoverBeforePlay',
  displayName: '播放前显示封面',
  urlInclude: playerUrls,
  enabledByDefault: false,
  ...toggleStyle(() => import('./cover.scss'), entry),
  description: {
    'zh-CN': '在视频开始播放前, 在播放器中显示封面.',
  },
  tags: [
    componentsTags.video,
  ],
}
