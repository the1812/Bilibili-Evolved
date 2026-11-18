import { OptionsOfMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import type { dashboardHomeOptionsMetadata } from '.'

export const dashboardHomeOptions =
  getComponentSettings<OptionsOfMetadata<typeof dashboardHomeOptionsMetadata>>(
    'dashboardHome',
  ).options
