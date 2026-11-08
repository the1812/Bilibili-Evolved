import { defineComponentMetadata } from '@/components/define'
import { isIframe } from '@/core/utils'
import { devClientOptionsMetadata } from './options'
import { setupPlugin } from './plugin'

export const component = defineComponentMetadata({
  name: 'devClient',
  displayName: 'DevClient',
  tags: [componentsTags.utils],
  entry: async ({ settings: { options } }) => {
    if (isIframe()) {
      return
    }
    const { devClient } = await import('./client')
    if (options.autoConnect || devClient.debugPaths.length > 0) {
      devClient.createSocket()
    }
  },
  options: devClientOptionsMetadata,
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
  },
  plugin: {
    setup: setupPlugin,
  },
})
