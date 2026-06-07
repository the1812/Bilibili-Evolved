import { mountVueComponent } from '@/core/utils'

let settingsVm: Vue & {
  popupOpen: boolean
  triggerElement: HTMLElement
}

export const loadRbvpSettings = async (button?: HTMLElement) => {
  if (settingsVm) {
    return
  }
  const Settings = await import('./RBVPSettings.vue').then(m => m.default)
  settingsVm = mountVueComponent(Settings)
  if (button) {
    settingsVm.triggerElement = button
  }
  document.body.insertAdjacentElement('beforeend', settingsVm.$el)
}

export const toggleRbvpSettings = async (button?: HTMLElement) => {
  if (!settingsVm) {
    await loadRbvpSettings(button)
  }
  settingsVm.popupOpen = !settingsVm.popupOpen
}
