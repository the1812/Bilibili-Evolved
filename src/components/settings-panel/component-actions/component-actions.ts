import { registerAndGetData } from '@/plugins/data'
import { Executable, ExecutableWithParameter, VueModule } from '@/core/common-types'
import { isUserComponent } from '@/core/settings'
import { ComponentMetadata } from '../../types'
import { feedbackSupported, openFeedback } from '../feedback'
import { removeUserComponent } from '../user-item'

export interface ComponentConfigAction {
  name: string
  displayName: string
  action: ExecutableWithParameter<[component?: ComponentMetadata]>
  icon: string
  visible?: boolean
  title?: string
  // condition?: () => boolean
}
export interface ComponentVueAction {
  name: string
  component: Executable<VueModule>
}
export interface OptionsTransferActionItem extends ComponentVueAction {
  mode: 'export' | 'import'
  displayName: string
  shiftDisplayName: string
  icon: string
  shiftIcon: string
  title: string
}

export type ComponentAction = (
  metadata: ComponentMetadata,
) => ComponentConfigAction | ComponentVueAction | undefined

export interface ComponentBatchAction extends Omit<ComponentConfigAction, 'action' | 'visible'> {
  verb: string
  filter: (component: ComponentMetadata) => boolean
  run: (components: ComponentMetadata[]) => Promise<string>
}

const createOptionsTransferAction =
  (config: Omit<OptionsTransferActionItem, 'component'>): ComponentAction =>
  metadata =>
    metadata.options === undefined
      ? undefined
      : {
          ...config,
          component: () => import('./OptionsTransferAction.vue'),
        }

const builtInMenuActions: ComponentAction[] = [
  createOptionsTransferAction({
    name: 'optionsExport',
    mode: 'export',
    displayName: '导出选项',
    shiftDisplayName: '复制选项',
    icon: 'mdi-export',
    shiftIcon: 'mdi-content-copy',
    title: '导出当前组件的选项, 按住 Shift 点击可复制到剪贴板. 文件命名格式可在设置面板中修改',
  }),
  createOptionsTransferAction({
    name: 'optionsImport',
    mode: 'import',
    displayName: '导入选项',
    shiftDisplayName: '粘贴选项',
    icon: 'mdi-import',
    shiftIcon: 'mdi-content-paste',
    title: '从文件导入当前组件的选项, 按住 Shift 点击可从剪贴板粘贴',
  }),
]
const builtInActionButtons: ComponentAction[] = [
  metadata => ({
    name: 'feedback',
    displayName: '反馈',
    icon: 'mdi-message-text-outline',
    visible: feedbackSupported,
    action: () => openFeedback(metadata),
  }),
  metadata => ({
    name: 'uninstall',
    displayName: '卸载',
    icon: 'mdi-trash-can-outline',
    visible: isUserComponent(metadata),
    action: () => removeUserComponent(metadata),
  }),
]
const builtInBatchActions: ComponentBatchAction[] = [
  {
    name: 'uninstall',
    displayName: '批量卸载',
    icon: 'mdi-trash-can-outline',
    title: '卸载所选的自定义组件',
    verb: '卸载',
    filter: isUserComponent,
    run: async items => {
      const failures: string[] = []
      for (const item of items) {
        try {
          await removeUserComponent(item)
        } catch (error) {
          failures.push(`[${item.displayName}] ${String(error)}`)
        }
      }
      const count = items.length - failures.length
      return [`已卸载 ${count} 个组件, 刷新后生效`, ...failures].join('\n')
    },
  },
]
export const [componentActions] = registerAndGetData(
  'settingsPanel.componentActions',
  builtInMenuActions,
)
export const [componentActionButtons] = registerAndGetData(
  'settingsPanel.componentActionButtons',
  builtInActionButtons,
)
export const [componentBatchActions] = registerAndGetData(
  'settingsPanel.componentBatchActions',
  builtInBatchActions,
)
