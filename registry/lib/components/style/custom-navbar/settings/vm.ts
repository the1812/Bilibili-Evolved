import { mountVueComponent } from '@/core/utils'
import type NavbarSettings from './NavbarSettings.vue'

let navbarSettingsVM: InstanceType<typeof NavbarSettings> | undefined
export const setTriggerElement = (element: HTMLElement) => {
  if (!navbarSettingsVM) {
    return
  }
  navbarSettingsVM.triggerElement = element
}
export const loadNavbarSettings = async () => {
  if (navbarSettingsVM) {
    return false
  }
  const [el, vm] = mountVueComponent(await import('./NavbarSettings.vue'))
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
