import { defineComponentMetadata } from '@/components/define'
import { isIframe } from '@/core/utils'
import { devClientOptionsMetadata, autoUpdateOptions } from './options'
import { setupPlugin } from './plugin'

export const component = defineComponentMetadata({
  name: 'devClient',
  displayName: 'DevClient',
  tags: [componentsTags.utils],
  entry: async ({ settings: { options } }) => {
    if (isIframe()) {
      return
    }
    const { devClient, DevClientEvents } = await import('./client')
    const restoreInactiveDevRecords = () => {
      Object.values(options.devRecords).forEach(({ name, originalUrl }) => {
        const record =
          autoUpdateOptions.urls.components[name] ?? autoUpdateOptions.urls.plugins[name]
        if (!record || devClient.featureSessions.some(s => record.url.endsWith(s))) {
          return
        }
        record.url = originalUrl
        console.log('restoreInactiveDevRecords', name, originalUrl, record)
        delete options.devRecords[name]
      })
    }
    devClient.addEventListener(DevClientEvents.FeatureSessionsUpdate, restoreInactiveDevRecords)
    devClient.addEventListener(DevClientEvents.ServerDisconnected, restoreInactiveDevRecords)
    devClient.addEventListener(DevClientEvents.ServerStop, restoreInactiveDevRecords)
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
