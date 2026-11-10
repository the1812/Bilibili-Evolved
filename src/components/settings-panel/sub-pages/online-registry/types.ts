import type { DocSourceItem } from '../../../../../registry/lib/docs'
import type { ComponentTag } from '@/components/types'

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
