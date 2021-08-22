import { Placement } from '@popperjs/core'
import tippy, { Content, Instance, Props } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import { addStyle } from '../style'
import miniStyle from './mini.scss'

export interface MiniToast {
  message: Content
  readonly triggerElement: Element
  placement?: Placement
  tippy: Instance<Props>
}

export const createMiniToast = (
  message: Content,
  trigger: Element,
  tippyProps: Partial<Props> = {},
) => {
  addStyle(miniStyle, 'mini-toast-style')
  const tip = tippy(trigger, {
    content: message,
    allowHTML: true,
    interactive: true,
    delay: [0, 200],
    arrow: false,
    ...tippyProps,
  })
  return {
    get message() {
      return tip.props.content
    },
    set message(value: Content) {
      tip.setContent(value)
    },
    get triggerElement() {
      return tip.reference
    },
    get placement() {
      return tip.props.placement
    },
    set placement(value: Placement) {
      tip.setProps({ placement: value })
    },
    get tippy() {
      return tip
    },
  } as MiniToast
}
