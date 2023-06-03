import { Executable, VueModule, WithName } from '@/core/common-types'

export interface FreshLayoutItem extends WithName {
  component: Executable<VueModule>
  grow?: boolean
}
export interface FreshLayoutItemSettings {
  linebreak: boolean
  order: number
  hidden: boolean
}
