import type { OptionsOfMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import type { freshHomeOptionsMetadata } from './types'

export const freshHomeOptions =
  getComponentSettings<OptionsOfMetadata<typeof freshHomeOptionsMetadata>>('freshHome').options
