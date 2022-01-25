let eventAttached = false

// FIXME: 需要重构, 不要直接对具体组件有行为依赖
export const disableProfilePopup = () => {
  if (document.URL.replace(window.location.search, '') === 'https://t.bilibili.com/') {
    (async () => {
      const { select } = await import('@/core/spin-query')
      const list = await select('.live-up-list') as HTMLElement
      if (list !== null) {
        const { getComponentSettings } = await import('@/core/settings')
        if (eventAttached) {
          return
        }
        const fixedSidebars = getComponentSettings('fixedSidebars')
        const extendFeedsLive = getComponentSettings('extendFeedsLive')
        list.addEventListener('mouseenter', e => {
          if (fixedSidebars.enabled || extendFeedsLive.enabled) {
            e.stopImmediatePropagation()
          }
        }, { capture: true })
        eventAttached = true
      }
    })()
  }
}
