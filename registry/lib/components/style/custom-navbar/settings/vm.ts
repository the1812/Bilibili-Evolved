import { mountVueComponent } from '@/core/utils'

let navbarSettingsVM: Vue & {
  toggle: () => void
  triggerElement: HTMLElement
}
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
  const NavbarSettings = await import('./NavbarSettings.vue').then(m => m.default)
  navbarSettingsVM = mountVueComponent(NavbarSettings)
  document.body.insertAdjacentElement('beforeend', navbarSettingsVM.$el)
  return true
}
export const toggleNavbarSettings = async () => {
  if (!navbarSettingsVM) {
    await loadNavbarSettings()
  }
  navbarSettingsVM?.toggle()
}
