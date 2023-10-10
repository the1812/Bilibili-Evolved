import { mountVueComponent } from '@/core/utils'

let panelVm: Vue & {
  toggleDisplay: () => void
}

export const getPanelLoadState = async () => {
  return Boolean(panelVm)
}

export const mountPanel = async () => {
  const panel = await import('./Panel1.vue').then(m => m.default)
  panelVm = mountVueComponent(panel)
  document.body.insertAdjacentElement('beforeend', panelVm.$el)
}

export const togglePanelDisplay = async () => {
  panelVm.toggleDisplay()
}
