import { ComponentMetadata } from '@/components/types'
import { videoUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  name: 'hideRecommendedLive',
  entry: none,
  instantStyles: [
    {
      name: 'hideRecommendedLive',
      style: () => import('./recommended-live.scss'),
    },
  ],
  displayName: '隐藏直播推荐',
  tags: [
    componentsTags.style,
    componentsTags.video,
  ],
  description: {
    'zh-CN': '隐藏视频页面右侧下方的直播推荐.',
  },
  urlInclude: videoUrls,
}
