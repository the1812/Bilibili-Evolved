import { mountVueComponent } from '@/core/utils'

import OnlineRegistry from './OnlineRegistry.vue'

let vm: InstanceType<typeof OnlineRegistry> | undefined
export const initPopup = () => {
  if (!vm) {
    const [el, vm0] = mountVueComponent(OnlineRegistry)
    vm = vm0
    document.body.append(el)
  }
}
export const togglePopup = () => {
  if (!vm) {
    initPopup()
  }
  vm.popupOpen = !vm.popupOpen
}
