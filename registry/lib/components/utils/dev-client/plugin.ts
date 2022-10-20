import { PluginSetupParameters } from '@/plugins/plugin'
import { ComponentAction } from '@/components/settings-panel/component-actions/component-actions'
import { isIframe } from '@/core/utils'
import { LaunchBarAction, LaunchBarActionProvider } from '@/components/launch-bar/launch-bar-action'
import { autoUpdateOptions } from './options'

export const setupPlugin = async ({ addData }: PluginSetupParameters) => {
  if (isIframe()) {
    return
  }
  addData('settingsPanel.componentActions', (actions: ComponentAction[]) => {
    actions.push(component => {
      if (!autoUpdateOptions.urls.components[component.name]) {
        return undefined
      }
      const ActionModule = () => import('./Action.vue')
      return {
        name: 'devClient',
        component: ActionModule,
      }
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
            action: () => devClient.closeSocket(),
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
