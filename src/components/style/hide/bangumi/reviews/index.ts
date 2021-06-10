import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'
import { bangumiUrls } from '@/components/video/video-urls'

export const component: ComponentMetadata = {
  name: 'hideBangumiReviews',
  displayName: '隐藏番剧点评',
  tags: [
    componentsTags.style,
  ],
  ...toggleStyle(() => import('./reviews.scss')),
  enabledByDefault: false,
  urlInclude: bangumiUrls,
  description: {
    'zh-CN': '隐藏番剧播放页面里的点评板块.',
  },
}
