import { defineComponentMetadata } from '@/components/define'
import { toggleStyle } from '@/components/styled-component'
import { bangumiUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  displayName: '隐藏番剧承包',
  tags: [componentsTags.style],
  ...toggleStyle('hideBangumiSponsors', () => import('./sponsors.scss')),
  urlInclude: bangumiUrls,
})
