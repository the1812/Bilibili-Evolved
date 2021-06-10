import { ComponentMetadata, componentsTags } from '@/components/component'
import { ComponentSettings } from '@/core/settings'
import desc from './desc.md'
import { videoAndBangumiUrls } from '../../video-urls'

export const component: ComponentMetadata = {
  name: 'playerFocus',
  displayName: '播放器定位',
  tags: [
    componentsTags.video,
  ],
  entry: async ({ options }: ComponentSettings) => {
    const target = document.URL.includes('bangumi') ? '#bofqi' : '.video-info .video-title .tit'
    const { select } = await import('@/core/spin-query')
    const { playerReady } = await import('@/core/utils')
    const element = await select(target) as HTMLElement
    await playerReady()
    if (!element) {
      return
    }
    element.scrollIntoView()
    if (options.offset !== 0) {
      window.scrollBy(0, options.offset)
    }
  },
  enabledByDefault: false,
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
}
