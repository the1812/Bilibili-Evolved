import { mountVueComponent } from '@/core/utils'

let settingsVM: Vue & {
  popupOpen: boolean
  triggerElement: HTMLElement
}

export const loadKeymapSettings = async (button?: HTMLElement) => {
  if (settingsVM) {
    return
  }
  const KeymapSettings = await import('./KeymapSettings.vue').then(m => m.default)
  settingsVM = mountVueComponent(KeymapSettings)
  if (button) {
    settingsVM.triggerElement = button
  }
  document.body.insertAdjacentElement('beforeend', settingsVM.$el)
}
export const toggleKeymapSettings = async (button?: HTMLElement) => {
  if (!settingsVM) {
    await loadKeymapSettings(button)
  }
  settingsVM.popupOpen = !settingsVM.popupOpen
}
