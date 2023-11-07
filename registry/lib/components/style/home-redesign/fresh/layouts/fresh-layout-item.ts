import type { Component } from 'vue'
import type { WithName } from '@/core/common-types'

export interface FreshLayoutItem extends WithName {
  component: Component
  grow?: boolean
}
export interface FreshLayoutItemSettings {
  linebreak: boolean
  order: number
  hidden: boolean
}
