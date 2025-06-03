import { defineComponentMetadata } from '@/components/define'
import { feedsUrlsWithoutDetail } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'fullFeedsContent',
  instantStyles: [
    {
      name: 'full-feeds-content',
      style: () => import('./full-content.scss'),
    },
  ],
  displayName: '展开动态内容',
  tags: [componentsTags.style, componentsTags.feeds],
  urlInclude: feedsUrlsWithoutDetail,
  entry: none,
})
