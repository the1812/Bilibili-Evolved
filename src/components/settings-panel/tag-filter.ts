import { ref } from 'vue'
import { registerAndGetData } from '@/plugins/data'
import { ascendingSort } from '@/core/utils/sort'
import type { ComponentTag } from '../types'
import type { SettingsFeature } from './settings-feature'

export interface SettingsTag extends ComponentTag {
  count: number
  filter: (features: SettingsFeature[]) => SettingsFeature[]
}

export type TagFilter =
  | SettingsTag
  | ((features: readonly SettingsFeature[]) => SettingsTag | SettingsTag[])

const builtInTagFilters: TagFilter[] = [
  features => ({
    name: 'all',
    displayName: '全部',
    color: 'inherit',
    icon: 'mdi-shape-outline',
    order: 0,
    count: features.length,
    filter: items => items,
  }),
  features => {
    const tags = features.flatMap(feature => feature.row.tags ?? [])
    const counts = lodash.countBy(tags, tag => tag.name)
    return lodash
      .uniqBy(tags, tag => tag.name)
      .map(tag => ({
        ...tag,
        count: counts[tag.name],
        filter: items => items.filter(feature => feature.row.tags?.some(t => t.name === tag.name)),
      }))
  },
]

const [tagFilters] = registerAndGetData('settingsPanel.featureTagFilters', builtInTagFilters)
const registeredFilters = ref(tagFilters)

export const getSettingsTags = (features: readonly SettingsFeature[]): SettingsTag[] =>
  registeredFilters.value
    .flatMap(filter => (typeof filter === 'function' ? filter(features) : filter))
    .sort(ascendingSort(tag => tag.order))
