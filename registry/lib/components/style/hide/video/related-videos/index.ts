import { defineComponentMetadata } from '@/components/define'
import { videoAndBangumiUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'hideRelatedVideos',
  displayName: '隐藏视频推荐',
  entry: none,
  instantStyles: [
    {
      name: 'hideRelatedVideos',
      style: () => import('./related-videos.scss'),
    },
  ],
  tags: [componentsTags.style, componentsTags.video],
  urlInclude: videoAndBangumiUrls,
})
