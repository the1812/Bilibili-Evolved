const condition = () => {
  return Boolean(document.URL.match(/live\.bilibili\.com\/(\d)+/))
}
const init = () => {
  const button = dq(`#record-live-danmaku`) as HTMLButtonElement
  let recorderVM: any
  button.addEventListener('click', async () => {
    if (!dq('.live-danmaku-recorder')) {
      const Recorder = await import('./record-live-danmaku.vue')
      recorderVM = new (Vue.extend(Recorder))().$mount()
      const element = recorderVM.$el
      document.body.insertAdjacentElement('beforeend', element)
      recorderVM.opened = true
    } else {
      recorderVM.opened = !recorderVM.opened
    }
    (dq('.gui-settings-mask') as HTMLDivElement).click()
  })
}

export default {
  widget: {
    content: /*html*/`
    <button class="gui-settings-flat-button" id="record-live-danmaku">
      <i class="mdi mdi-24px mdi-record-rec" style="transform: scale(1.3)"></i>
      <span>记录弹幕</span>
    </button>
    `,
    condition,
    success: init,
  }
}