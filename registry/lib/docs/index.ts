import type { Author } from '@/components/types'
import type { RegistryFeatureType } from '@/core/feature-types'

/** 表示一个合集包 */
export interface Package {
  name: string
  displayName: string
  description?: string
  components?: string[]
  plugins?: string[]
}
/** 表示一个支持在线安装的功能 */
export interface DocSourceItem {
  type: RegistryFeatureType
  name: string
  displayName: string
  description?: string
  author?: Author | Author[]
  tags?: string[]
  fullAbsolutePath: string
  fullRelativePath: string
  repo?: string
  owner?: string
}
