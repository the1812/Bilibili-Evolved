import { mountVueComponent } from '@/core/utils'
import OnlineRegistry from './OnlineRegistry.vue'

let vm: Vue & {
  popupOpen: boolean
  searchKeyword: string
}
export const initPopup = () => {
  if (!vm) {
    vm = mountVueComponent(OnlineRegistry)
    document.body.append(vm.$el)
  }
}
export const togglePopup = () => {
  if (!vm) {
    initPopup()
  }
  vm.popupOpen = !vm.popupOpen
}
