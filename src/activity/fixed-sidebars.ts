const style = `
.custom-navbar {
  position: fixed !important;
}
.sticky-bar {
  display: none !important;
}
.left-panel, .right-panel {
  position: fixed !important;
}
.center-panel {
  margin-left: calc(244px + 8px) !important;
}
.right-panel {
  margin-left: calc(244px + 16px + 632px) !important;
}
.live-panel .live-up-list {
  max-height: calc(100vh - 200px);
  overflow: auto;
  scrollbar-width: none !important;
}
.live-panel .live-up-list::-webkit-scrollbar {
  height: 0 !important;
  width: 0 !important;
}
`
const id = 'fixed-sidebars-style'
let disableProfilePopup = true
if (document.URL.replace(location.search, '') === 'https://t.bilibili.com/') {
  (async () => {
    const list = await SpinQuery.select('.live-up-list') as HTMLElement
    if (list !== null) {
      list.addEventListener('mouseenter', e => {
        if (disableProfilePopup) {
          e.stopImmediatePropagation()
        }
      }, { capture: true })
    }
  })()
}
const add = () => {
  if (document.URL.replace(location.search, '') === 'https://t.bilibili.com/') {
    resources.applyStyleFromText(style, id)
    disableProfilePopup = true
  }
}
const remove = () => {
  dqa('#' + id).forEach(it => it.remove())
  disableProfilePopup = false
}
add()
export default {
  reload: add,
  unload: remove,
}