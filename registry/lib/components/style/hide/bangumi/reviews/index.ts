import { ComponentMetadata } from '@/components/types'
import { toggleStyle } from '@/components/styled-component'
import { bangumiUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  displayName: '隐藏番剧点评',
  tags: [
    componentsTags.style,
  ],
  ...toggleStyle('hideBangumiReviews', () => import('./reviews.scss')),
  enabledByDefault: false,
  urlInclude: bangumiUrls,
  description: {
    'zh-CN': '隐藏番剧播放页面里的点评板块.',
  },
}
