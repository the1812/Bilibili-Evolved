import { defineAsyncComponent } from 'vue'

import { defineComponentMetadata } from '@/components/define'
import { hasVideo } from '@/core/spin-query'

export const component = defineComponentMetadata({
  name: 'downloadVideo',
  displayName: '下载视频',
  entry: none,
  reload: none,
  unload: none,
  widget: {
    component: defineAsyncComponent(() => import('./Widget.vue')),
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
