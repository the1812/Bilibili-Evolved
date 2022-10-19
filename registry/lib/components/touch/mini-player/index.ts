import { defineComponentMetadata } from '@/components/define'
import { videoAndBangumiUrls, liveUrls } from '@/core/utils/urls'

const setTouch = async (enable: boolean) => {
  if (!document.URL.startsWith('https://live.bilibili.com')) {
    const { touchVideoMiniPlayer } = await import('./video')
    await touchVideoMiniPlayer(enable)
  } else {
    const { touchLiveMiniPlayer } = await import('./live')
    await touchLiveMiniPlayer(enable)
  }
}
export const component = defineComponentMetadata({
  name: 'touchMiniPlayer',
  displayName: '迷你播放器触摸拖动',
  description: {
    'zh-CN': '使迷你播放器的拖动条可以触摸拖动.',
  },
  enabledByDefault: navigator.maxTouchPoints > 0,
  tags: [componentsTags.touch],
  urlInclude: [...videoAndBangumiUrls, ...liveUrls],
  entry: () => setTouch(true),
  reload: () => setTouch(true),
  unload: () => setTouch(false),
  options: {
    touchMoveDistance: {
      displayName: '拖动触发最小距离',
      defaultValue: 10,
      hidden: true,
    },
  },
})
