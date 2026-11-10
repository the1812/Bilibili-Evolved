export type { DocSourceItem } from '@/components/settings-panel/sub-pages/online-registry/types'

/** 表示一个合集包 */
export interface Package {
  name: string
  displayName: string
  description?: string
  components?: string[]
  plugins?: string[]
}
