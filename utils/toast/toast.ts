export enum ToastType {
  Default = 'default',
  Info = 'info',
  Success = 'success',
  Error = 'error',
}
export class Toast {
  type: ToastType
  message: string
  title: string
  duration: number | undefined
  creationTime = new Date()
  constructor(message = '', title = '', type = ToastType.Default) {
    this.type = type
    this.message = message
    this.title = title
    this.duration = 3000
  }
  show() {
    container.cards.splice(0, 0, this)
    if (this.duration !== undefined) {
      setTimeout(() => this.dismiss(), this.duration)
    }
  }
  dismiss() {
    container.cards.splice(container.cards.indexOf(this), 1)
  }
  get element() {
    return dq(`.toast-card[key='${this.key}']`)
  }
  get key() {
    return this.creationTime.toISOString()
  }
  static get container() {
    return document.querySelector('.toast-card-container')
  }
  static createToastContainer() {
    if (!document.querySelector('.toast-card-container')) {
      document.body.insertAdjacentHTML('beforeend', /* html */`
        <transition-group class="toast-card-container" name="toast-card-container" tag="div">
          <toast-card v-for="card of cards" v-bind:key="card.key" v-bind:card="card"></toast-card>
        </transition-group>`)
    }
  }
  private static internalShow(message: string, title: string, duration: number | undefined, type: ToastType) {
    const toast = new Toast(message, title, type)
    toast.duration = duration
    toast.show()
    return toast
  }
  static show(message: string, title: string, duration: number | undefined) {
    return this.internalShow(message, title, duration, ToastType.Default)
  }
  static info(message: string, title: string, duration: number | undefined) {
    return this.internalShow(message, title, duration, ToastType.Info)
  }
  static success(message: string, title: string, duration: number | undefined) {
    return this.internalShow(message, title, duration, ToastType.Success)
  }
  static error(message: string, title: string, duration: number | undefined) {
    return this.internalShow(message, title, duration, ToastType.Error)
  }
}

resources.applyStyle('toastStyle')
Vue.component('toast-card', {
  props: ['card'],
  template: /*html*/`
    <div class="toast-card icons-enabled visible" v-bind:class="'toast-' + card.type">
      <div class="toast-card-header">
        <h1 class="toast-card-title">{{card.title}}</h1>
        <div class="toast-card-dismiss" v-on:click="card.dismiss()">
          <svg style="width:22px;height:22px" viewBox="0 0 24 24">
            <path
              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </div>
      </div>
      <div class="toast-card-message">{{card.message}}</div>
    </div>
    `,
})
Toast.createToastContainer()
const container = new Vue({
  el: '.toast-card-container',
  data: {
    cards: [] as Toast[]
  },
})

export default {
  export: Toast
}
