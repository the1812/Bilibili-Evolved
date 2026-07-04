import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'

const liveUrlsWithHome = [...liveUrls, /^https:\/\/live\.bilibili\.com\/(index\.html)?$/]

export const component = defineComponentMetadata({
  name: 'removeLiveWatermark',
  displayName: '删除直播水印',
  tags: [componentsTags.live, componentsTags.style],
  instantStyles: [{ name: 'removeLiveWatermark', style: () => import('./remove-watermark.scss') }],
  entry: none,
  urlInclude: liveUrlsWithHome,
})
