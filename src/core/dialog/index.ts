import { defineComponent, type App } from 'vue'
import { mountVueComponent } from '@/core/utils'
import type { Executable, ImportedVueComponent } from '../common-types'
import Dialog from './Dialog.vue'

export interface DialogInputs {
  icon?: string
  title?: string | Executable<ImportedVueComponent>
  zIndex?: number
  content: string | Executable<ImportedVueComponent>
  contentProps?: Record<string, unknown>
}
export interface DialogInstance extends Required<DialogInputs> {
  open: boolean
  close: Promise<void>
  closeListeners: (() => void)[]
}
export const showDialog = (inputs: DialogInputs) => {
  const { icon, title, zIndex, content, contentProps } = inputs
  let dialogEl: HTMLDivElement | undefined
  let dialogApp: App<HTMLDivElement> | undefined
  const ExtendedDialog = defineComponent({
    extends: Dialog,
    data() {
      return {
        open: false,
        closeListeners: [
          () => {
            dialogApp!.unmount()
            dialogEl!.remove()
          },
        ],
      }
    },
  })
  const [el, vm, app] = mountVueComponent(ExtendedDialog, {
    icon,
    title,
    zIndex,
    content,
    contentProps,
  })
  dialogEl = el
  dialogApp = app
  document.body.appendChild(el)
  setTimeout(() => {
    vm.open = true
  })
  return vm
}
