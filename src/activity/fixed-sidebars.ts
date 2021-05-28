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
.home-container {
  --left-width: 244px;
  --center-width: 632px;
}
@media screen and (min-width: 1921px) {
  .home-container {
    --left-width: 12.71vw;
    --center-width: 32.92vw;
  }
}
@media screen and (min-width: 2497px) {
  .home-container {
    --left-width: 317px;
    --center-width: 822px;
  }
}
.center-panel {
  margin-left: calc(var(--left-width) + 8px) !important;
}
.right-panel {
  margin-left: calc(var(--left-width) + 16px + var(--center-width)) !important;
}
.live-panel .live-up-list {
  max-height: calc(100vh - 380px);
  overflow: auto;
  scrollbar-width: none !important;
}
body.feeds-filter-side-block-profile .live-panel .live-up-list {
  max-height: calc(100vh - 180px);
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