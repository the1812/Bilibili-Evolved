let eventAttached = false
export const disableProfilePopup = () => {
  if (document.URL.replace(location.search, '') === 'https://t.bilibili.com/') {
    if (eventAttached) {
      return
    }
    (async () => {
      const list = await SpinQuery.select('.live-up-list') as HTMLElement
      if (list !== null) {
        list.addEventListener('mouseenter', e => {
          if (settings.fixedSidebars || settings.extendFeedsLive) {
            e.stopImmediatePropagation()
          }
        }, { capture: true })
        eventAttached = true
      }
    })()
  }
}
export default {
  export: {
    disableProfilePopup,
  },
}