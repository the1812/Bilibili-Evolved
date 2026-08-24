export type Author = {
  name: string
  link: string
}

export type FeatureKind = 'component' | 'plugin'

export type DocSourceItem = {
  type: FeatureKind
  name: string
  displayName: string
  description?: string
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
