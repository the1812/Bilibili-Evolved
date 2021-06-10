import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'
import { videoAndBangumiUrls } from '../video-urls'

export const component: ComponentMetadata = {
  name: 'fullVideoDescription',
  displayName: '展开视频简介',
  ...toggleStyle(() => import('./full-description.scss')),
  tags: [
    componentsTags.video,
    componentsTags.style,
  ],
  enabledByDefault: true,
  description: {
    'zh-CN': '总是展开完整的视频简介.',
  },
  urlInclude: videoAndBangumiUrls,
}
