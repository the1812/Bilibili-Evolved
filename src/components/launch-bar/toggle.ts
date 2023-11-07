import { mountVueComponent } from '@/core/utils'

import GlobalLaunchBar from './GlobalLaunchBar.vue'

let launchBarInstance: InstanceType<typeof GlobalLaunchBar> | undefined
export const toggleLaunchBar = () => {
  if (!launchBarInstance) {
    const [el, vm] = mountVueComponent(GlobalLaunchBar)
    launchBarInstance = vm
    document.body.append(el)
    return
  }
  launchBarInstance.show = !launchBarInstance.show
}
