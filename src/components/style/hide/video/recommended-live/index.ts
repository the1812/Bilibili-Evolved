import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'

export const component: ComponentMetadata = {
  name: 'hideRecommendedLive',
  displayName: '隐藏推荐直播',
  ...toggleStyle(() => import('./recommended-live.scss')),
  tags: [
    componentsTags.style,
  ],
  enabledByDefault: true,
  description: {
    'zh-CN': '隐藏视频页面右侧下方的推荐直播.',
  },
  urlInclude: [
    '//www.bilibili.com/video/',
  ],
}
