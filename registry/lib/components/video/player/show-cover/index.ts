import { defineComponentMetadata } from '@/components/define'
import { playerAgent, PlayerAgentEventTypes } from '@/components/video/player-agent'
import { videoChange, VideoChangeCallback } from '@/core/observer'
import { playerUrls } from '@/core/utils/urls'

const entry = async () => {
  let lastAid: string
  const removeCover = () => document.documentElement.style.removeProperty('--cover-url')
  videoChange(() => {
    playerAgent.addEventListener(PlayerAgentEventTypes.Pause, () => {
      removeCover()
    })
    playerAgent.addEventListener(PlayerAgentEventTypes.Play, () => {
      removeCover()
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
