import type { PluginMetadata } from '@/plugins/plugin'
import type { TagFilter } from '@/components/settings-panel/tag-filter'
import type { Options as SettingPanelOptions } from '@/components/settings-panel'
import type { FeatureType } from '@/core/feature-types'

const recordKeys = {
  component: 'recentComponents',
  plugin: 'recentPlugins',
  style: 'recentStyles',
} as const satisfies Record<FeatureType, string>
type ExtendedOptions = SettingPanelOptions &
  Partial<Record<(typeof recordKeys)[FeatureType], Record<string, number>>>

export const plugin: PluginMetadata = {
  name: 'settingsPanel.tagFilters.recentComponents',
  displayName: '设置面板 - "最近使用" 类别',
  setup: async ({ addData, addHook }) => {
    const { getGeneralSettings } = await import('@/core/settings')
    const options: ExtendedOptions = getGeneralSettings()
    const getLastUsed = (name: string) =>
      Math.max(...Object.values(recordKeys).map(key => options[key]?.[name] ?? 0))
    for (const [type, key] of Object.entries(recordKeys)) {
      const records = () => (options[key] ??= {})
      const recordUse = (name: string) => {
        records()[name] = Date.now()
      }
      addHook(`settingsPanel.${type}Detail.open`, { after: recordUse })
      const hookPrefix = `user${lodash.startCase(type)}s`
      addHook(`${hookPrefix}.add`, {
        after: (_code: string, _url: string, feature: { name: string }) => recordUse(feature.name),
      })
      addHook(`${hookPrefix}.remove`, {
        after: (feature: { name: string }) => {
          delete records()[feature.name]
        },
      })
    }
    addData('settingsPanel.featureTagFilters', (tagFilters: TagFilter[]) => {
      tagFilters.unshift(features => ({
        name: 'recent',
        displayName: '最近',
        color: 'inherit',
        icon: 'mdi-clock-outline',
        order: 0,
        count: features.length,
        filter: items => lodash.sortBy(items, feature => getLastUsed(feature.name)).reverse(),
      }))
    })
  },
}
