import { OptionsOfMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import type { minimalHomeOptionsMetadata } from '.'

export const minimalHomeOptions =
  getComponentSettings<OptionsOfMetadata<typeof minimalHomeOptionsMetadata>>('minimalHome').options
