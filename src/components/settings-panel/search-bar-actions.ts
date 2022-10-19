import { Toast } from '@/core/toast'
import { registerAndGetData } from '@/plugins/data'
import { isBuiltInComponent } from '../built-in-components'
import { ComponentMetadata } from '../types'
import { uninstallComponent } from '../user-component'

export interface SearchBarActionContext {
  components: ComponentMetadata[]
  selectedComponent: ComponentMetadata
  selectedComponents: ComponentMetadata[]
  searchKeyword: string
  searchFilter: (items: ComponentMetadata[]) => ComponentMetadata[]
}
export interface SearchBarAction {
  key: string
  icon: string
  title: string | ((context: SearchBarActionContext) => string)
  run: (context: SearchBarActionContext) => Promise<void> | void
  disabled?: (context: SearchBarActionContext) => boolean
}
const builtInActions: SearchBarAction[] = [
  {
    key: 'uninstallSelectedComponent',
    title: '卸载所选组件',
    icon: 'mdi-trash-can-outline',
    disabled: ({ selectedComponents }) => selectedComponents.length === 0,
    run: context => {
      if (!window.confirm(`确定要卸载所选的 ${context.selectedComponents.length} 个组件吗?`)) {
        return
      }
      context.selectedComponents.forEach(({ name }: ComponentMetadata) => {
        if (!isBuiltInComponent(name)) {
          uninstallComponent(name)
        } else {
          Toast.info('内置组件不能卸载', '检查更新', 3000)
        }
      })
      context.selectedComponents = []
    },
  },
]
export const [searchBarActions] = registerAndGetData('settingsPanel.searchBarActions', [
  ...builtInActions,
])
