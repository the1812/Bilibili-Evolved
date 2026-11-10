import type { DocSourceItem } from '../../../../../registry/lib/docs'
import type { ComponentTag } from '@/components/types'

export type RegistryItemData = DocSourceItem & {
  repo: string
  componentTags: ComponentTag[]
  descriptionText: string
  searchText: string
}
