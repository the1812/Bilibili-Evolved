import { PluginSetupParameters } from '@/plugins/plugin'
import { ComponentAction } from '@/components/settings-panel/component-actions/component-actions'
import { isIframe } from '@/core/utils'

export const setupPlugin = async ({ addData }: PluginSetupParameters) => {
  if (isIframe()) {
    return
  }
  addData('settingsPanel.componentActions', (actions: ComponentAction[]) => {
    actions.push(
      () => {
        const ActionModule = () => import('./Action.vue')
        return {
          name: 'devClient',
          component: ActionModule,
        }
      },
    )
  })
}
