import type { DocSourceItem } from '../../../../../registry/lib/docs'
import type { ComponentTag } from '@/components/types'

export type RegistryItemData = DocSourceItem & {
  nameSortKey: string
  repo: string
  componentTags: ComponentTag[]
  descriptionText: string
  searchText: string
}
