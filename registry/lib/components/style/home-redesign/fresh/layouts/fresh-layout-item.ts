import type { Component } from 'vue'
import type { WithName } from '@/core/common-types'

export interface FreshLayoutItem extends WithName {
  component: Component
  grow?: boolean
}
export interface FreshLayoutItemSettings {
  name: string
  linebreak: boolean
}
