import { PluginMetadata } from '@/plugins/plugin'
import { TagFilter } from '@/components/settings-panel/tag-filter'
import { ComponentMetadata } from '@/components/types'
import type { Options as SettingPanelOptions } from '@/components/settings-panel'

type ExtendedOptions = SettingPanelOptions & {
  recentComponents?: Record<string, number>
}

export const plugin: PluginMetadata = {
  name: 'settingsPanel.tagFilters.recentComponents',
  displayName: '设置面板 - "最近使用" 类别',
  description: '在设置面板中添加 "最近使用" 类别, 方便检索最近操作过的组件.',
  setup: ({ addData, addHook }) => {
    const getRecentComponents = async () => {
      const { getGeneralSettings } = await import('@/core/settings')
      const generalSettings: ExtendedOptions = getGeneralSettings()
      if (!generalSettings.recentComponents) {
        generalSettings.recentComponents = {}
      }
      return generalSettings.recentComponents as Record<string, number>
    }
    addHook('settingsPanel.componentDetail.open', {
      after: async (name: string) => {
        const recentComponents = await getRecentComponents()
        recentComponents[name] = Number(new Date())
      },
    })
    addHook('userComponents.add', {
      after: async (code: string, url: string, component: ComponentMetadata) => {
        const recentComponents = await getRecentComponents()
        recentComponents[component.name] = Number(new Date())
      },
    })
    addHook('userComponents.remove', {
      after: async (component: ComponentMetadata) => {
        const recentComponents = await getRecentComponents()
        delete recentComponents[component.name]
      },
    })
    addData('settingsPanel.tagFilters', async (tagFilters: TagFilter[]) => {
      const recentComponents = await getRecentComponents()
      tagFilters.unshift(({ renderedComponents }) => ({
        name: 'recent',
        displayName: '最近',
        color: 'inherit',
        icon: 'mdi-clock-outline',
        order: 0,
        count: renderedComponents.length,
        filter: components =>
          lodash.sortBy(components, it => recentComponents[it.name] ?? 0).reverse(),
      }))
    })
  },
}
