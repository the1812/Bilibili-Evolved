import { mountVueComponent } from '@/core/utils'

let settingsVM: Vue & {
  popupOpen: boolean
  triggerElement: HTMLElement | null
}

export const loadBilibiliPlayerShortcutsSettings = async (button?: HTMLElement) => {
  if (settingsVM) {
    return
  }
  const BilibiliPlayerShortcutsSettings = await import(
    './BilibiliPlayerShortcutsSettings.vue'
  ).then(m => m.default)
  settingsVM = mountVueComponent(BilibiliPlayerShortcutsSettings)
  if (button) {
    settingsVM.triggerElement = button
  }
  document.body.insertAdjacentElement('beforeend', settingsVM.$el)
}

export const toggleBilibiliPlayerShortcutsSettings = async (button?: HTMLElement) => {
  if (!settingsVM) {
    await loadBilibiliPlayerShortcutsSettings(button)
  }
  settingsVM.popupOpen = !settingsVM.popupOpen
}
