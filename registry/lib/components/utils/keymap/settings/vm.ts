import { mountVueComponent } from '@/core/utils'
import type KeymapSettings from './KeymapSettings.vue'

let settingsVM: InstanceType<typeof KeymapSettings> | undefined
export const loadKeymapSettings = async (button?: HTMLElement) => {
  if (settingsVM) {
    return
  }
  const [el, vm] = mountVueComponent(await import('./KeymapSettings.vue'), {
    triggerElement: button,
  })
  settingsVM = vm
  document.body.insertAdjacentElement('beforeend', el)
}
export const toggleKeymapSettings = async (button?: HTMLElement) => {
  if (!settingsVM) {
    await loadKeymapSettings(button)
  }
  settingsVM.popupOpen = !settingsVM.popupOpen
}
