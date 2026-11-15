import type { PluginSetupParameters } from '@/plugins/plugin'
import type { SettingsDetailActionProvider } from '@/components/settings-panel/component-actions/settings-action-types'
import { isIframe } from '@/core/utils'
import { LaunchBarAction, LaunchBarActionProvider } from '@/components/launch-bar/launch-bar-action'
import { getFeatureDevPath } from './converter'

export const setupPlugin = async ({ addData }: PluginSetupParameters) => {
  if (isIframe()) {
    return
  }
  addData('settingsPanel.featureActions', (providers: SettingsDetailActionProvider[]) => {
    providers.push(feature => {
      const target = feature.operations.registry?.target
      const path = target && getFeatureDevPath(target.kind, target.name)
      return path
        ? {
            buttons: [
              { name: 'devClient', view: () => import('./Action.vue'), props: { target, path } },
            ],
          }
        : {}
    })
  })
  addData('launchBar.actions', (providers: LaunchBarActionProvider[]) => {
    providers.push({
      name: 'devClientActions',
      getActions: async () => {
        const { devClient } = await import('./client')
        const actions: LaunchBarAction[] = []
        if (devClient.isConnected) {
          actions.push({
            name: '断开 DevServer 连接',
            description: 'Disconnect from DevServer',
            icon: 'mdi-stop-circle-outline',
            action: () => devClient.disconnect(),
          })
        } else {
          actions.push({
            name: '连接 DevServer',
            description: 'Connect to DevServer',
            icon: 'mdi-play-circle-outline',
            action: async () => {
              await devClient.createSocket(true)
            },
          })
        }
        return actions
      },
    })
  })
}
