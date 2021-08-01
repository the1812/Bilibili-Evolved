import { mountVueComponent } from '../utils'
import { createMiniToast } from './mini'
import ToastCardContainer from './ToastCardContainer.vue'

export enum ToastType {
  Default = 'default',
  Info = 'info',
  Success = 'success',
  Error = 'error',
}
let container: Vue & { cards: Toast[] }
export class Toast {
  duration: number | undefined = 3000
  creationTime = Number(new Date())
  randomKey = Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER + 1))
  constructor(
    public message = '',
    public title = '',
    public type = ToastType.Default,
  ) {
  }
  static get containerVM() {
    if (!container) {
      Toast.createToastContainer()
    }
    return container
  }
  static createToastContainer() {
    if (!dq('.toast-card-container')) {
      // console.log(Vue, ToastCardContainer)
      container = mountVueComponent(ToastCardContainer)
      document.body.insertAdjacentElement('beforeend', container.$el)
    }
  }
  get element() {
    return dq(`.toast-card[data-key='${this.key}']`)
  }
  get key() {
    return `${this.creationTime}[${this.randomKey}]`
  }
  show() {
    Toast.containerVM.cards.unshift(this)
    if (this.duration !== undefined) {
      setTimeout(() => this.dismiss(), this.duration)
    }
  }
  dismiss() {
    if (Toast.containerVM.cards.includes(this)) {
      Toast.containerVM.cards.splice(Toast.containerVM.cards.indexOf(this), 1)
    }
  }

  private static internalShow(
    message: string,
    title: string,
    duration: number | undefined,
    type: ToastType,
  ) {
    const toast = new Toast(message, title, type)
    toast.duration = duration
    toast.show()
    return toast
  }
  static show(message: string, title: string, duration?: number | undefined) {
    return this.internalShow(message, title, duration, ToastType.Default)
  }
  static info(message: string, title: string, duration?: number | undefined) {
    return this.internalShow(message, title, duration, ToastType.Info)
  }
  static success(message: string, title: string, duration?: number | undefined) {
    return this.internalShow(message, title, duration, ToastType.Success)
  }
  static error(message: string, title: string, duration?: number | undefined) {
    return this.internalShow(message, title, duration, ToastType.Error)
  }
  static mini(...args: Parameters<typeof createMiniToast>) {
    return createMiniToast(...args)
  }
}
