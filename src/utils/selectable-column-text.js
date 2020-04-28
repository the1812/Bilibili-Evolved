const style = `.article-holder { user-select: text !important }`
const id = 'selectable-column-text-style'
let eventInjected = false
const load = () => {
  if (!document.URL.startsWith('https://www.bilibili.com/read/')) {
    return
  }
  resources.applyStyleFromText(style, id)
  if (!eventInjected) {
    eventInjected = true
    document.addEventListener('copy', e => {
      e.stopImmediatePropagation()
    }, { capture: true })
  }
}
load()
export default {
  reload: load,
  unload: () => {
    document.getElementById(id).remove()
  },
}