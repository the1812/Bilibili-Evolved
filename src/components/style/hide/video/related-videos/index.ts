import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'
import { videoAndBangumiUrls } from '@/components/video/video-urls'

export const component: ComponentMetadata = {
  name: 'hideRelatedVideos',
  displayName: '隐藏视频推荐',
  ...toggleStyle(() => import('./related-videos.scss')),
  tags: [
    componentsTags.style,
  ],
  enabledByDefault: false,
  description: {
    'zh-CN': '隐藏番剧和视频页面右侧的推荐视频列表.',
  },
  urlInclude: videoAndBangumiUrls,
}
