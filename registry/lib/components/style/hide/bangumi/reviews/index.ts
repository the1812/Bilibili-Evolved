import { defineComponentMetadata } from '@/components/define'
import { bangumiUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'hideBangumiReviews',
  displayName: '隐藏番剧点评',
  tags: [componentsTags.style],
  instantStyles: [{ name: 'hideBangumiReviews', style: () => import('./reviews.scss') }],
  entry: none,
  urlInclude: bangumiUrls,
})
