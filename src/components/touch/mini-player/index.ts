import { ComponentMetadata, componentsTags } from '@/components/component'
import { liveUrls } from '@/components/live/live-urls'
import { videoAndBangumiUrls } from '@/components/video/video-urls'

const entry = async (enable: boolean) => {
  if (!document.URL.startsWith('https://live.bilibili.com')) {
    const { touchVideoMiniPlayer } = await import('./video')
    await touchVideoMiniPlayer(enable)
  } else {
    const { touchLiveMiniPlayer } = await import('./live')
    await touchLiveMiniPlayer(enable)
  }
}
export const component: ComponentMetadata = {
  name: 'touchMiniPlayer',
  displayName: '迷你播放器触摸拖动',
  description: {
    'zh-CN': '使迷你播放器的拖动条可以触摸拖动.',
  },
  enabledByDefault: false,
  tags: [
    componentsTags.touch,
  ],
  urlInclude: [
    ...videoAndBangumiUrls,
    ...liveUrls,
  ],
  entry: () => entry(true),
  reload: () => entry(true),
  unload: () => entry(false),
}
