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
      Object.entries(options.devRecords).forEach(([, { name, originalUrl }]) => {
        const autoUpdateRecord = autoUpdateOptions.urls.components[name]
        if (!autoUpdateRecord) {
          return
        }
        const devUrl = autoUpdateRecord.url
        if (devClient.featureSessions.find(s => devUrl.endsWith(s))) {
          return
        }
        autoUpdateRecord.url = originalUrl
        console.log('restoreInactiveDevRecords', name, devUrl, originalUrl, autoUpdateRecord)
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
