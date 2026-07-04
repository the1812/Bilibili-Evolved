import { defineComponentMetadata } from '@/components/define'
import { bangumiUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'hideBangumiSponsors',
  displayName: '隐藏番剧承包',
  tags: [componentsTags.style],
  instantStyles: [{ name: 'hideBangumiSponsors', style: () => import('./sponsors.scss') }],
  entry: none,
  urlInclude: bangumiUrls,
})
