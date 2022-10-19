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
})
export const component = defineComponentMetadata({
  name: 'bvidConvert',
  displayName: 'BV 号转换',
  options,
  entry: none,
  description: {
    'zh-CN': '在功能面板中显示视频的 AV 号和 BV 号.',
  },
  tags: [componentsTags.video, componentsTags.utils],
  widget: {
    component: () => import('./BvidConvert.vue').then(m => m.default),
    condition: hasVideo,
  },
  urlInclude: videoAndBangumiUrls,
})
export type BvidConvertOptions = OptionsOfMetadata<typeof options>
