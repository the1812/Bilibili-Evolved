import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'
import { liveUrls } from '../live-urls'

export const component: ComponentMetadata = {
  name: 'removeLiveWatermark',
  displayName: '删除直播水印',
  ...toggleStyle(() => import('./remove-watermark.scss')),
  tags: [
    componentsTags.live,
    componentsTags.style,
  ],
  enabledByDefault: true,
  description: {
    'zh-CN': '删除观看直播时角落的水印.',
  },
  urlInclude: liveUrls,
}
