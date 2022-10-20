import { videoAndBangumiUrls } from '@/core/utils/urls'
import { defineComponentMetadata } from '@/components/define'
import desc from './desc.md'

export const component = defineComponentMetadata({
  name: 'playerFocus',
  displayName: '播放器定位',
  tags: [componentsTags.video],
  entry: async ({ settings: { options } }) => {
    const target = document.URL.includes('bangumi')
      ? '.bilibili-player'
      : '.video-info .video-title .tit'
    const { select } = await import('@/core/spin-query')
    const { playerReady } = await import('@/core/utils')
    const element = (await select(target)) as HTMLElement
    await playerReady()
    if (!element) {
      return
    }
    element.scrollIntoView()
    if (options.offset !== 0) {
      window.scrollBy(0, options.offset)
    }
  },
  description: {
    'zh-CN': desc,
  },
  options: {
    offset: {
      displayName: '定位偏移量',
      defaultValue: -10,
    },
  },
  urlInclude: videoAndBangumiUrls,
})
