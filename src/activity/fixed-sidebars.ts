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
  max-height: calc(100vh - 380px);
  overflow: auto;
  scrollbar-width: none !important;
}
.live-panel .live-up-list::-webkit-scrollbar {
  height: 0 !important;
  width: 0 !important;
}
.adaptive-scroll {
  min-height: unset !important;
}
`
const id = 'fixed-sidebars-style'
const add = () => {
  if (document.URL.replace(location.search, '') === 'https://t.bilibili.com/') {
    resources.applyStyleFromText(style, id)
    ;(async () => {
      const { disableProfilePopup } = await import('./disable-profile-popup')
      disableProfilePopup()
    })()
  }
}
const remove = () => {
  dqa('#' + id).forEach(it => it.remove())
}
add()
export default {
  reload: add,
  unload: remove,
}