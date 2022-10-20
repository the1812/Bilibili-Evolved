import { defineComponentMetadata } from '@/components/define'
import { toggleStyle } from '@/components/styled-component'
import { liveUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  ...toggleStyle('removeLiveWatermark', () => import('./remove-watermark.scss')),
  displayName: '删除直播水印',
  tags: [componentsTags.live, componentsTags.style],
  description: {
    'zh-CN': '删除观看直播时角落的水印.',
  },
  urlInclude: liveUrls,
})
