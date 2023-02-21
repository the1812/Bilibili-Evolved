import { Executable, VueModule } from '../common-types'
import Dialog from './Dialog.vue'

export interface DialogInputs {
  icon?: string
  title?: string | Executable<VueModule>
  zIndex?: number
  content: string | Executable<VueModule>
  contentProps?: Record<string, unknown>
}
export interface DialogInstance extends Required<DialogInputs> {
  open: boolean
  close(): Promise<void>
  closeListeners: (() => void)[]
}
export const showDialog = (inputs: DialogInputs) => {
  const { icon, title, zIndex, content, contentProps } = inputs
  const dialogElement = new Dialog({
    propsData: {
      icon,
      title,
      zIndex,
      content,
      contentProps,
    },
    data: {
      open: false,
      closeListeners: [
        () => {
          dialogElement.$destroy()
          dialogElement.$el.remove()
        },
      ],
    },
  }).$mount() as Vue & DialogInstance
  document.body.appendChild(dialogElement.$el)
  setTimeout(() => {
    dialogElement.open = true
  })
  return dialogElement
}
