import type { Executable, ImportedVueComponent, WithName } from '@/core/common-types'

export interface FreshLayoutItem extends WithName {
  component: Executable<ImportedVueComponent>
  grow?: boolean
}
export interface FreshLayoutItemSettings {
  name: string
  linebreak: boolean
}
