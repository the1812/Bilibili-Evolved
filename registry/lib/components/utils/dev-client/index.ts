import { defineComponentMetadata } from '@/components/define'
import { isIframe } from '@/core/utils'
import { devClientOptionsMetadata, autoUpdateOptions } from './options'
import { setupPlugin } from './plugin'
import description from './desc.md'

export const component = defineComponentMetadata({
  name: 'devClient',
  displayName: 'DevClient',
  tags: [componentsTags.utils],
  description,
  entry: async ({ settings: { options } }) => {
    if (isIframe()) {
      return
    }
    const { devClient, DevClientEvents } = await import('./client')
    const cleanUpDevRecords = () => {
      Object.entries(options.devRecords).forEach(([, { name, originalUrl }]) => {
        if (devClient.sessions.find(s => originalUrl.endsWith(s))) {
          return
        }
        const autoUpdateRecord = autoUpdateOptions.urls.components[name]
        if (autoUpdateRecord) {
          autoUpdateRecord.url = originalUrl
        }
        delete options.devRecords[name]
      })
    }
    devClient.addEventListener(
      DevClientEvents.ServerConnected,
      () => cleanUpDevRecords(),
      { once: true },
    )
    if (options.autoConnect) {
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
