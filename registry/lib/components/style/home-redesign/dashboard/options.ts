import { onBeforeUnmount, ref } from 'vue'
import { OptionsOfMetadata } from '@/components/define'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import type { dashboardHomeOptionsMetadata } from '.'

export const dashboardHomeOptions =
  getComponentSettings<OptionsOfMetadata<typeof dashboardHomeOptionsMetadata>>(
    'dashboardHome',
  ).options

export const useDashboardWatchlater = () => {
  const enabled = ref(dashboardHomeOptions.enableWatchlater)
  const path = 'dashboardHome.enableWatchlater'
  const update = (value: boolean) => {
    enabled.value = value
  }
  addComponentListener(path, update)
  onBeforeUnmount(() => removeComponentListener(path, update))
  return enabled
}
