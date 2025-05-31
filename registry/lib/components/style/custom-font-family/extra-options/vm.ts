import { mountVueComponent } from '@/core/utils'
import type PanelVue from './Panel.vue'

let panelVm: InstanceType<typeof PanelVue> | null = null

const getPanelLoadState = () => {
  return Boolean(panelVm)
}

const mountPanel = async () => {
  const panel = await import('./Panel.vue')
  const [el, vm] = mountVueComponent(panel)
  panelVm = vm
  document.body.insertAdjacentElement('beforeend', el)
}

export const loadPanel = async () => {
  const isLoaded = getPanelLoadState()
  if (!isLoaded) {
    await mountPanel()
  }
}

export const togglePanelDisplay = async () => {
  panelVm?.toggleDisplay()
}
