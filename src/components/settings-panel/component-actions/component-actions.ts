import { ref } from 'vue'
import { registerAndGetData } from '@/plugins/data'
import type { Executable, ExecutableWithParameter, VueModule } from '@/core/common-types'
import type { ComponentMetadata } from '../../types'
import { feedbackSupported, openFeedback } from '../feedback'
import type { SettingsFeature } from '../settings-feature'
import type {
  SettingsAction,
  SettingsBatchAction,
  SettingsButtonAction,
  SettingsDetailActionProvider,
} from './settings-action-types'

export interface ComponentConfigAction<Metadata = ComponentMetadata>
  extends Omit<SettingsButtonAction, 'action'> {
  action: ExecutableWithParameter<[component?: Metadata]>
  visible?: boolean
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

export type ComponentAction<Metadata = ComponentMetadata> = (
  metadata: Metadata,
) => ComponentConfigAction<Metadata> | ComponentVueAction | undefined

const createOptionsTransferAction =
  (config: Omit<OptionsTransferActionItem, 'component'>): ComponentAction =>
  metadata =>
    metadata.options === undefined
      ? undefined
      : {
          ...config,
          component: () => import('./OptionsTransferAction.vue'),
        }

const optionsTransferActions: ComponentAction[] = [
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

const builtInActions: SettingsDetailActionProvider = feature => {
  const buttons: SettingsButtonAction[] = []
  const { registry, removal } = feature.operations
  if (registry && feedbackSupported) {
    buttons.push({
      name: 'feedback',
      displayName: '反馈',
      icon: 'mdi-message-text-outline',
      action: () => openFeedback(feature.metadata),
    })
  }
  if (removal) {
    buttons.push({
      name: 'uninstall',
      displayName: '卸载',
      icon: 'mdi-trash-can-outline',
      action: async () => {
        if (!removal.confirm || window.confirm(`确定要卸载 ${feature.displayName} 吗?`)) {
          await removal.run()
        }
      },
    })
  }
  return { buttons }
}

const builtInBatchActions: SettingsBatchAction[] = [
  {
    name: 'uninstall',
    displayName: '批量卸载',
    icon: 'mdi-trash-can-outline',
    title: '卸载所选的用户组件和插件',
    verb: '卸载',
    prepare: selection => {
      const items = selection.flatMap(feature => {
        const { removal } = feature.operations
        return removal?.batch ? [{ name: feature.displayName, run: removal.run }] : []
      })
      return {
        count: items.length,
        run: async () => {
          const failures: string[] = []
          for (const { name, run } of items) {
            try {
              await run()
            } catch (error) {
              failures.push(`[${name}] ${String(error)}`)
            }
          }
          const count = items.length - failures.length
          return [`已卸载 ${count} 个功能, 刷新后生效`, ...failures].join('\n')
        },
      }
    },
  },
]

export const [componentActions] = registerAndGetData(
  'settingsPanel.componentActions',
  optionsTransferActions,
)
const registeredComponentActions = ref(componentActions)

export const getComponentMenuActions = (metadata: ComponentMetadata): SettingsAction[] =>
  registeredComponentActions.value.flatMap(factory => {
    const action = factory(metadata)
    if (!action || ('visible' in action && action.visible === false)) {
      return []
    }
    return [
      'component' in action
        ? {
            name: action.name,
            view: action.component,
            props: { item: action, component: metadata },
          }
        : { ...action, action: () => action.action(metadata) },
    ]
  })

const [detailActionProviders] = registerAndGetData('settingsPanel.featureActions', [builtInActions])
const registeredActionProviders = ref(detailActionProviders)
const [batchActions] = registerAndGetData('settingsPanel.featureBatchActions', builtInBatchActions)
export const settingsBatchActions = ref(batchActions)

export const getSettingsDetailActions = (feature: SettingsFeature) => {
  const { enabled, menu } = feature.operations
  if (enabled === false) {
    return { buttons: [], menu: [] }
  }
  const actions = registeredActionProviders.value.map(provider => provider(feature))
  return {
    buttons: actions.flatMap(action => action.buttons ?? []),
    menu: [...actions.flatMap(action => action.menu ?? []), ...(menu?.() ?? [])],
  }
}
