import { defineComponentMetadata } from '@/components/define'
import { hasVideo } from '@/core/spin-query'

export const component = defineComponentMetadata({
  name: 'downloadVideo',
  displayName: '下载视频',
  entry: none,
  reload: none,
  unload: none,
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
    condition: () => hasVideo(),
  },
  tags: [componentsTags.video],
  options: {
    basicConfig: {
      defaultValue: {},
      displayName: '基础配置',
      hidden: true,
    },
  },
  // plugin,
})
