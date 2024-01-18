import { mountVueComponent } from '@/core/utils'

let panelVm: Vue & {
  toggleDisplay: () => void
}

const getPanelLoadState = () => {
  return Boolean(panelVm)
}

const mountPanel = async () => {
  const panel = await import('./Panel.vue').then(m => m.default)
  panelVm = mountVueComponent(panel)
  document.body.insertAdjacentElement('beforeend', panelVm.$el)
}

export const loadPanel = async () => {
  const isLoaded = getPanelLoadState()
  if (!isLoaded) {
    await mountPanel()
  }
}

export const togglePanelDisplay = async () => {
  panelVm.toggleDisplay()
}
