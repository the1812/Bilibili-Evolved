import { ref } from 'vue'
import { registerAndGetData } from '@/plugins/data'
import { ascendingSort } from '@/core/utils/sort'
import type { ComponentMetadata, ComponentTag } from '../types'
import type { SettingsFeature } from './settings-feature'
import { ComponentSettingsFeature } from './settings-feature/component'

export interface SettingsTag extends ComponentTag {
  count: number
  filter: (features: SettingsFeature[]) => SettingsFeature[]
}

export type TagFilter =
  | SettingsTag
  | ((features: readonly SettingsFeature[]) => SettingsTag | SettingsTag[])

interface LegacyTagFilterContext {
  components: ComponentMetadata[]
  renderedComponents: ComponentMetadata[]
}

interface LegacySettingsTag extends Omit<SettingsTag, 'filter'> {
  filter: (components: ComponentMetadata[]) => ComponentMetadata[]
}

type LegacyTagFilter =
  | LegacySettingsTag
  | ((context: LegacyTagFilterContext) => LegacySettingsTag | LegacySettingsTag[])

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
const [legacyTagFilters] = registerAndGetData('settingsPanel.tagFilters', [] as LegacyTagFilter[])
const registeredLegacyFilters = ref(legacyTagFilters)

const getLegacySettingsTags = (context: LegacyTagFilterContext): SettingsTag[] =>
  registeredLegacyFilters.value
    .flatMap(filter => (typeof filter === 'function' ? filter(context) : filter))
    .map<SettingsTag>(({ filter, ...tag }) => ({
      ...tag,
      filter: items => {
        const components = items.filter(item => item instanceof ComponentSettingsFeature)
        const byName = new Map(components.map(item => [item.name, item]))
        return filter(components.map(item => item.metadata)).flatMap(
          component => byName.get(component.name) ?? [],
        )
      },
    }))

export const getSettingsTags = (
  features: readonly SettingsFeature[],
  componentContext: LegacyTagFilterContext,
): SettingsTag[] => {
  const legacyTags = getLegacySettingsTags(componentContext)
  const tags = registeredFilters.value.flatMap(filter =>
    typeof filter === 'function' ? filter(features) : filter,
  )
  const tagsByName = new Map([...legacyTags, ...tags].map(tag => [tag.name, tag]))
  return [...tagsByName.values()].sort(ascendingSort(tag => tag.order))
}
