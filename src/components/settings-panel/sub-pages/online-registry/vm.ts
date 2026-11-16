import { mountVueComponent } from '@/core/utils'
import OnlineRegistry from './OnlineRegistry.vue'

let vm: Vue & { popupOpen: boolean }
export const togglePopup = () => {
  if (!vm) {
    vm = mountVueComponent(OnlineRegistry)
    document.body.append(vm.$el)
  }
  vm.popupOpen = !vm.popupOpen
}
