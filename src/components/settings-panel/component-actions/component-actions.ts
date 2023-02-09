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
  action: (component: ComponentMetadata) => void
  icon: string
  visible?: boolean
  title?: string
  // condition?: () => boolean
}
export interface ComponentVueAction {
  name: string
  /* 组件。创建其实例时会传入属性：item: ComponentVueAction, component: ComponentMetadata */
  component: Component
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
