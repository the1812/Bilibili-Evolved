import { defineComponentMetadata } from '@/components/define'
import { toggleStyle } from '@/components/styled-component'
import { bangumiUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  displayName: '隐藏番剧点评',
  tags: [componentsTags.style],
  ...toggleStyle('hideBangumiReviews', () => import('./reviews.scss')),
  urlInclude: bangumiUrls,
})
