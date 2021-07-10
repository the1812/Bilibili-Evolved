import { ComponentMetadata } from '@/components/types'
import { toggleStyle } from '@/components/styled-component'
import { videoUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  ...toggleStyle('hideRecommendedLive', () => import('./recommended-live.scss')),
  displayName: '隐藏推荐直播',
  tags: [
    componentsTags.style,
    componentsTags.video,
  ],
  description: {
    'zh-CN': '隐藏视频页面右侧下方的推荐直播.',
  },
  urlInclude: videoUrls,
}
