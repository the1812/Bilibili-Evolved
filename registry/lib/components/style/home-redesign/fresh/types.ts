import { getComponentSettings } from '@/core/settings'

import type { FreshLayoutItemSettings } from './layouts/fresh-layout-item'

export const freshHomeOptions = getComponentSettings('freshHome').options as {
  layoutOptions: Record<string, FreshLayoutItemSettings>
  personalized: boolean
  horizontalWheelScroll: boolean
  [key: string]: any
}
