import { ComponentMetadata } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'
import { liveUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  ...toggleStyle('removeLiveWatermark', () => import('./remove-watermark.scss')),
  displayName: '删除直播水印',
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
