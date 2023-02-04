import { ref } from 'vue'
import { mountVueComponent } from '@/core/utils'
import type NavbarSettings from './NavbarSettings.vue'

let navbarSettingsVM: InstanceType<typeof NavbarSettings> | undefined
const triggerElement = ref<HTMLElement | null>(null)
export const setTriggerElement = (element: HTMLElement) => {
  if (!navbarSettingsVM) {
    return
  }
  triggerElement.value = element
}
export const loadNavbarSettings = async () => {
  if (navbarSettingsVM) {
    return false
  }
  const [el, vm] = mountVueComponent(await import('./NavbarSettings.vue'), { triggerElement })
  navbarSettingsVM = vm
  document.body.insertAdjacentElement('beforeend', el)
  return true
}
export const toggleNavbarSettings = async () => {
  if (!navbarSettingsVM) {
    await loadNavbarSettings()
  }
  navbarSettingsVM?.toggle()
}
