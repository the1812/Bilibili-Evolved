import { defineComponentMetadata } from '@/components/define'
import { installFeature } from '@/core/install-feature'
import { isIframe } from '@/core/utils'
import { devClientOptionsMetadata, autoUpdateOptions } from './options'
import { setupPlugin } from './plugin'
import { RefreshMethod } from './update-method'

export const component = defineComponentMetadata({
  name: 'devClient',
  displayName: 'DevClient',
  tags: [componentsTags.utils],
  entry: async ({ settings: { options } }) => {
    if (isIframe()) {
      return
    }
    const { devClient, DevClientEvents } = await import('./client')
    const restoreInactiveDevRecords = async () => {
      let restored = false
      for (const [, { name, originalUrl }] of Object.entries(options.devRecords)) {
        const autoUpdateRecord =
          autoUpdateOptions.urls.components[name] ?? autoUpdateOptions.urls.plugins[name]
        if (!autoUpdateRecord) {
          continue
        }
        const devUrl = autoUpdateRecord.url
        if (devClient.featureSessions.find(s => devUrl.endsWith(s))) {
          continue
        }
        autoUpdateRecord.url = originalUrl
        console.log('restoreInactiveDevRecords', name, devUrl, originalUrl, autoUpdateRecord)
        delete options.devRecords[name]
        restored = true
        // 只还原链接不够, 持久化的开发版代码也要重新安装
        await installFeature(originalUrl).catch(error => {
          console.error('还原原版本失败', name, error)
        })
      }
      if (restored && options.registryRefreshMethod !== RefreshMethod.DoNotRefresh) {
        location.reload()
      }
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
