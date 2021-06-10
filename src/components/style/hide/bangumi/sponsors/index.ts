import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'
import { bangumiUrls } from '@/components/video/video-urls'

export const component: ComponentMetadata = {
  name: 'hideBangumiSponsors',
  displayName: '隐藏番剧承包',
  tags: [
    componentsTags.style,
  ],
  ...toggleStyle(() => import('./sponsors.scss')),
  enabledByDefault: false,
  urlInclude: bangumiUrls,
  description: {
    'zh-CN': '隐藏番剧页面下方的承包榜, 以及右边的承包按钮.',
  },
}
