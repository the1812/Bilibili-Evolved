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
    const cleanUpDevRecords = () => {
      Object.entries(options.devRecords).forEach(([, { name, originalUrl }]) => {
        const autoUpdateRecord = autoUpdateOptions.urls.components[name]
        if (!autoUpdateRecord) {
          return
        }
        const devUrl = autoUpdateRecord.url
        if (devClient.sessions.find(s => devUrl.endsWith(s))) {
          return
        }
        autoUpdateRecord.url = originalUrl
        console.log('cleanUpDevRecords', name, devUrl, originalUrl, autoUpdateRecord)
        delete options.devRecords[name]
      })
    }
    devClient.addEventListener(DevClientEvents.ServerConnected, () => {
      devClient.addEventListener(
        DevClientEvents.SessionsUpdate,
        () => {
          cleanUpDevRecords()
        },
        { once: true },
      )
    })
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
