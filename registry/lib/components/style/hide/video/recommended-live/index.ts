import { defineComponentMetadata } from '@/components/define'
import { videoUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'hideRecommendedLive',
  entry: none,
  instantStyles: [
    {
      name: 'hideRecommendedLive',
      style: () => import('./recommended-live.scss'),
    },
  ],
  displayName: '隐藏直播推荐',
  tags: [componentsTags.style, componentsTags.video],
  urlInclude: videoUrls,
})
