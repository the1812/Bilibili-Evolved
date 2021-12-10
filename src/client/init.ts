/** 初始化脚本 */
export const init = async () => {
  window.lodash = _
  Object.defineProperty(window, '_', {
    get() {
      console.warn('window._ is deprecated, please use window.lodash instead.')
      return window.lodash
    },
  })

  const { initVue } = await import('./init-vue')
  initVue()

  // 跳过对多余<iframe>的加载
  // const { checkIframes } = await import('./check-iframes')
  // const skip = !checkIframes()
  // if (skip) {
  //   return
  // }

  const { headLoaded, raiseLifeCycleEvent, LifeCycleEventTypes } = await import('@/core/life-cycle')
  raiseLifeCycleEvent(LifeCycleEventTypes.Start)
  const { none } = await import('@/core/utils')
  const { promiseLoadTrace } = await import('@/core/performance/promise-trace')

  await promiseLoadTrace('wait for <head>', async () => {
    // 等待<head>元素
    await headLoaded(none)
  })

  await promiseLoadTrace('compatibility patch', async () => {
    // 兼容性补丁
    const { compatibilityPatch } = await import('./compatibility')
    compatibilityPatch()
  })

  const { coreApis, externalApis } = await import('@/core/core-apis')
  unsafeWindow.bilibiliEvolved = externalApis
  /** sand-boxed window, safe to use original name */
  window.coreApis = coreApis
  window.dq = coreApis.utils.dq
  window.dqa = coreApis.utils.dqa
  window.none = coreApis.utils.none
  window.componentsTags = coreApis.componentApis.component.componentsTags

  const { loadAllUserComponents } = await import('@/components/component')
  await promiseLoadTrace('parse user components', loadAllUserComponents)

  const { preloadStyles, loadAllCustomStyles } = await import('@/core/style')
  await promiseLoadTrace('load styles', preloadStyles)
  raiseLifeCycleEvent(LifeCycleEventTypes.StyleLoaded)

  await promiseLoadTrace('load components', async () => {
    const { loadAllComponents } = await import('@/components/component')
    return Promise.allSettled([loadAllComponents(), loadAllCustomStyles()])
  })
  raiseLifeCycleEvent(LifeCycleEventTypes.ComponentsLoaded)

  await promiseLoadTrace('wind up', async () => {
    const prefetchLink = document.createElement('link')
    prefetchLink.rel = 'dns-prefetch'
    prefetchLink.href = 'https://api.bilibili.com'
    document.head.insertAdjacentElement('afterbegin', prefetchLink)

    requestIdleCallback(async () => {
      const { getGeneralSettings } = await import('@/core/settings/helpers')
      const { devMode } = getGeneralSettings()
      if (devMode) {
        const {
          promiseLoadTime,
          promiseResolveTime,
        } = await import('@/core/performance/promise-trace')
        const { logStats } = await import('@/core/performance/stats')
        logStats('init block', promiseLoadTime)
        logStats('init resolve', promiseResolveTime)
      }
    })
  })
  raiseLifeCycleEvent(LifeCycleEventTypes.End)
}
