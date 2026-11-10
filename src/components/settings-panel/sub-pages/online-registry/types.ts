import type { ComponentTag, FeatureBase } from '@/components/types'

export interface DocSourceItem {
  type: 'component' | 'plugin'
  name: string
  displayName: string
  description?: string
  author?: FeatureBase['author']
  tags?: string[]
  fullAbsolutePath: string
  fullRelativePath: string
  repo?: string
  owner?: string
}

export interface RegistryFilterSelection {
  sort: 'default' | 'nameAsc' | 'nameDesc' | 'installed' | 'notInstalled'
  status: '' | 'installed' | 'notInstalled'
  type: '' | DocSourceItem['type']
  tag: string
}

export type RegistryItemData = DocSourceItem & {
  nameSortKey: string
  repo: string
  componentTags: ComponentTag[]
  descriptionText: string
  searchText: string
}
