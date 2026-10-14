import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { hasVideo } from '@/core/spin-query'
import { videoAndBangumiUrls } from '@/core/utils/urls'

const options = defineOptionsMetadata({
  copyWithTitle: {
    defaultValue: false,
    displayName: '复制链接时带上标题',
  },
  copyWithCover: {
    defaultValue: false,
    displayName: '复制链接时带上封面',
  },
  copyFormat: {
    defaultValue: 'HTML',
    displayName: '富文本格式',
    dropdownEnum: ['HTML', 'Markdown'],
  },
})
export const component = defineComponentMetadata({
  name: 'bvidConvert',
  displayName: 'BV 号转换',
  options,
  entry: none,
  tags: [componentsTags.video, componentsTags.utils],
  widget: {
    component: () => import('./BvidConvert.vue').then(m => m.default),
    condition: hasVideo,
  },
  urlInclude: videoAndBangumiUrls,
})
export type BvidConvertOptions = OptionsOfMetadata<typeof options>
