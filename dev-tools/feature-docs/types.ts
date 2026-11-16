import type { RegistryFeatureType } from '../src-types'

export type Author = {
  name: string
  link: string
}

export type DocSourceItem = {
  type: RegistryFeatureType
  name: string
  displayName: string
  description?: string
  author?: Author | Author[]
  tags?: string[]
  fullAbsolutePath: string
  fullRelativePath: string
  owner?: string
}

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
