import { defineComponentMetadata } from '@/components/define'
import { isIframe } from '@/core/utils'
import { devClientOptionsMetadata } from './options'
import { setupPlugin } from './plugin'

export const component = defineComponentMetadata({
  name: 'devClient',
  displayName: 'DevClient',
  tags: [componentsTags.utils],
  description: '本地开发工具',
  entry: async () => {
    if (isIframe()) {
      return
    }
    import('./client')
  },
  options: devClientOptionsMetadata,
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
  },
  plugin: {
    setup: setupPlugin,
  },
})
