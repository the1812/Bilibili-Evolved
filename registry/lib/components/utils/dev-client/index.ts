import { defineComponentMetadata } from '@/components/define'
import { isIframe } from '@/core/utils'
import { devClientOptionsMetadata, autoUpdateOptions } from './options'
import { setupPlugin } from './plugin'

export const component = defineComponentMetadata({
  name: 'devClient',
  displayName: 'DevClient',
  tags: [componentsTags.utils],
  description: '本地开发工具',
  entry: async ({ settings: { options } }) => {
    if (isIframe()) {
      return
    }
    const { devClient, DevClientEvents } = await import('./client')
    const cleanUpDevRecords = () => {
      Object.entries(options.devRecords).forEach(([, { name, originalUrl }]) => {
        const autoUpdateRecord = autoUpdateOptions.urls.components[name]
        if (autoUpdateRecord) {
          autoUpdateRecord.url = originalUrl
        }
        delete options.devRecords[name]
      })
    }
    if (devClient.isConnected) {
      cleanUpDevRecords()
    } else {
      devClient.addEventListener(
        DevClientEvents.ServerConnected,
        () => cleanUpDevRecords(),
        { once: true },
      )
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
