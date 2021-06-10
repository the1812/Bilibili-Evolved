import { ComponentMetadata, componentsTags } from '@/components/component'
import { none } from '@/core/utils'
import { hasVideo } from '@/core/spin-query'

export const component: ComponentMetadata = {
  name: 'bvidConvert',
  displayName: 'BV号转换',
  entry: none,
  enabledByDefault: true,
  description: {
    'zh-CN': '在功能面板中显示视频的AV号和BV号.',
  },
  tags: [
    componentsTags.video,
    componentsTags.utils,
  ],
  widget: {
    component: () => import('./BvidConvert.vue').then(m => m.default),
    condition: hasVideo,
  },
  urlInclude: [
    'https://www.bilibili.com/video/',
    'https://www.bilibili.com/bangumi/',
  ],
}
