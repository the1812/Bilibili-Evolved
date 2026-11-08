import type { DocSourceItem, Package } from '../../../../../registry/lib/docs'

type RegistryFeature = DocSourceItem & { repo: string }

export type RegistryItemData =
  | RegistryFeature
  | (Package & { type: 'pack'; items: RegistryFeature[]; descriptionText?: string })
