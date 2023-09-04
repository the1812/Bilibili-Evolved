import { mountVueComponent } from '@/core/utils'

let extraOptionsVm: Vue & {
  popupOpen: boolean
  triggerElement: HTMLElement
}

export const setTriggerElement = (element: HTMLElement) => {
  extraOptionsVm.triggerElement = element
}

export const getExtraOptionsLoadState = async () => {
  return Boolean(extraOptionsVm)
}

export const loadExtraOptions = async () => {
  const extraOptions = await import('./panel.vue').then(m => m.default)
  extraOptionsVm = mountVueComponent(extraOptions)
  document.body.insertAdjacentElement('beforeend', extraOptionsVm.$el)
}

export const toggleExtraOptionsDisplay = async () => {
  extraOptionsVm.popupOpen = !extraOptionsVm.popupOpen
}
