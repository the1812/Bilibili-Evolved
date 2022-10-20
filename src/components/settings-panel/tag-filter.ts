import { registerAndGetData } from '@/plugins/data'
import { ComponentTag, ComponentMetadata } from '../types'

export interface SettingsTagFilterContext {
  components: ComponentMetadata[]
  renderedComponents: ComponentMetadata[]
}
export interface SettingsTag extends ComponentTag {
  count: number
  filter: (components: ComponentMetadata[]) => ComponentMetadata[]
}
export type SettingsTagFunction = (context: SettingsTagFilterContext) => SettingsTag | SettingsTag[]
export type TagFilter = SettingsTag | SettingsTagFunction
const builtInTagFilters: TagFilter[] = [
  (
    { renderedComponents }, // 全部组件
  ) => ({
    name: 'all',
    displayName: '全部',
    color: 'inherit',
    icon: 'mdi-shape-outline',
    order: 0,
    count: renderedComponents.length,
    filter: c => c,
  }),
  ({ renderedComponents }) => {
    // 按组件标签分类
    const tags: SettingsTag[] = []
    renderedComponents.forEach(it =>
      it.tags.forEach(t => {
        tags.push({
          count: 0,
          ...t,
          filter: components =>
            components.filter(c => {
              if (t.name === 'all') {
                return true
              }
              return c.tags.some(tag => tag.name === t.name)
            }),
        })
      }),
    )
    const counts = lodash.countBy(tags, (t: ComponentTag) => t.name)
    return lodash
      .uniqBy(tags, t => t.name)
      .map(t => ({ ...t, count: counts[t.name] } as SettingsTag))
  },
]
export const [tagFilters] = registerAndGetData('settingsPanel.tagFilters', builtInTagFilters)
