import { mountVueComponent } from '@/core/utils'
import GlobalLaunchBar from './GlobalLaunchBar.vue'

let launchBarInstance: Vue & { show: boolean }
export const toggleLaunchBar = () => {
  if (!launchBarInstance) {
    launchBarInstance = mountVueComponent(GlobalLaunchBar)
    document.body.append(launchBarInstance.$el)
    return
  }
  launchBarInstance.show = !launchBarInstance.show
}
