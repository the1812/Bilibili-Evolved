import { registerAndGetData } from '@/plugins/data'
import { Executable, VueModule } from '@/core/common-types'
import { getHook } from '@/plugins/hook'
import { isUserComponent } from '@/core/settings'
import { ComponentMetadata } from '../../types'
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
  component: Executable<VueModule>
}
export interface OptionsTransferActionItem extends ComponentVueAction {
  mode: 'export' | 'import'
  displayName: string
  ctrlDisplayName: string
  icon: string
  ctrlIcon: string
  title?: string
}

export type ComponentAction = (
  metadata: ComponentMetadata,
) => ComponentConfigAction | ComponentVueAction | undefined

export const isMac =
  navigator.userAgentData?.platform === 'macOS' || navigator.platform.toLowerCase().includes('mac')

type TransferActionConfig = Pick<
  OptionsTransferActionItem,
  'mode' | 'name' | 'displayName' | 'ctrlDisplayName' | 'icon' | 'ctrlIcon'
> & { title: (modifierKey: string) => string }

const createTransferAction =
  (config: TransferActionConfig): ComponentAction =>
  metadata => {
    if (metadata.options === undefined) {
      return undefined
    }
    return {
      ...config,
      component: () => import('./OptionsTransferAction.vue'),
      title: config.title(isMac ? 'Cmd' : 'Ctrl'),
    }
  }

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
  createTransferAction({
    name: 'optionsExport',
    mode: 'export',
    displayName: '导出选项',
    ctrlDisplayName: '复制选项',
    icon: 'mdi-export',
    ctrlIcon: 'mdi-content-copy',
    title: key => `导出当前组件的选项, 按住 ${key} 点击可复制到剪贴板`,
  }),
  createTransferAction({
    name: 'optionsImport',
    mode: 'import',
    displayName: '导入选项',
    ctrlDisplayName: '粘贴选项',
    icon: 'mdi-import',
    ctrlIcon: 'mdi-content-paste',
    title: key => `从文件导入当前组件的选项, 按住 ${key} 点击可从剪贴板粘贴`,
  }),
]
export const [componentActions] = registerAndGetData(
  'settingsPanel.componentActions',
  builtInActions,
)
