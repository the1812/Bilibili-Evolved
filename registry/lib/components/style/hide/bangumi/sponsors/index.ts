import { ComponentMetadata } from '@/components/types'
import { toggleStyle } from '@/components/styled-component'
import { bangumiUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  displayName: '隐藏番剧承包',
  tags: [
    componentsTags.style,
  ],
  ...toggleStyle('hideBangumiSponsors', () => import('./sponsors.scss')),
  enabledByDefault: false,
  urlInclude: bangumiUrls,
  description: {
    'zh-CN': '隐藏番剧页面下方的承包榜, 以及右边的承包按钮.',
  },
}
