import type { Component } from 'vue'
import type { Executable } from '@/core/common-types'
import { isUserComponent } from '@/core/settings'
import { registerAndGetData } from '@/plugins/data'
import { getHook } from '@/plugins/hook'

import type { ComponentMetadata } from '../../types'
import { uninstallComponent } from '../../user-component'

export interface ComponentConfigAction {
  name: string
  displayName: string
  action: Executable
  icon: string
  visible?: boolean
  title?: string
  // condition?: () => boolean
}
export interface ComponentVueAction {
  name: string
  component: Component<{
    item?: ComponentVueAction
    component?: ComponentMetadata
  }>
}
export type ComponentAction = (
  metadata: ComponentMetadata,
) => ComponentConfigAction | ComponentVueAction

const builtInActions: ComponentAction[] = [
  metadata => ({
    name: 'uninstall',
    displayName: '卸载',
    icon: 'mdi-trash-can-outline',
    visible: isUserComponent(metadata),
    action: async () => {
      const { before, after } = getHook('userComponents.remove', metadata)
      await before()
      await uninstallComponent(metadata.name)
      await after()
    },
  }),
]
export const [componentActions] = registerAndGetData(
  'settingsPanel.componentActions',
  builtInActions,
)
