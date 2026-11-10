import type { DocSourceItem } from '../../src/components/settings-panel/sub-pages/online-registry/types'

export type { Author } from '../../src/components/types'

export type FeatureKind = 'component' | 'plugin'

export type { DocSourceItem }

export type PackageDoc = {
  name: string
  displayName: string
  description?: string
  components?: string[]
  plugins?: string[]
}

export type PackItem = PackageDoc & {
  type: 'pack'
  items: DocSourceItem[]
}
