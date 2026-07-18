/* eslint-disable no-underscore-dangle */
import { contentLoaded, fullyLoaded } from '@/core/life-cycle'
import { select } from '@/core/spin-query'
import { setupContainerQueryFeatureDetection } from '@/core/container-query'

export const compatibilityPatch = () => {
  contentLoaded(async () => {
    document.body.classList.add('round-corner')
    const { isIframe, matchUrlPattern } = await import('@/core/utils')
    const transparentFrames = [
      'https://t.bilibili.com/share/card/index',
      'https://manga.bilibili.com/eden/bilibili-nav-panel.html',
      'https://live.bilibili.com/blackboard/dropdown-menu.html',
      'https://www.bilibili.com/page-proxy/game-nav.html',
      'https://live.bilibili.com/p/html/live-lottery/',
    ]
    document.documentElement.classList.toggle(
      'iframe',
      isIframe() && transparentFrames.some(matchUrlPattern),
    )

    const { allVideoUrls } = await import('@/core/utils/urls')
    if (allVideoUrls.some(url => matchUrlPattern(url))) {
      const { playerPolyfill } = await import('@/components/video/player-adaptor')
      playerPolyfill()
    }

    await setupContainerQueryFeatureDetection()
  })
  fullyLoaded(() => {
    select('meta[name=spm_prefix]').then(spm => {
      if (spm) {
        spm.remove()
        select(() => unsafeWindow.__spm_prefix).then(() => {
          if (unsafeWindow.__spm_prefix) {
            delete unsafeWindow.__spm_prefix
          }
        })
      }
    })
  })
  if (typeof requestIdleCallback === 'undefined') {
    window.requestIdleCallback = (callback: TimerHandler) => window.setTimeout(callback, 0)
    window.cancelIdleCallback = (handle: number) => {
      window.clearTimeout(handle)
    }
  }
  // 沙箱 window 的补丁不影响页面作用域, 而 B 站页面自身代码也会调用 requestIdleCallback,
  // 在缺少原生实现的浏览器 (如 Safari) 中需要在 unsafeWindow 上同样补充
  if (typeof unsafeWindow.requestIdleCallback === 'undefined') {
    unsafeWindow.requestIdleCallback = (callback: IdleRequestCallback) =>
      unsafeWindow.setTimeout(() => {
        const start = performance.now()
        callback({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50 - (performance.now() - start)),
        })
      }, 0)
    unsafeWindow.cancelIdleCallback = (handle: number) => {
      unsafeWindow.clearTimeout(handle)
    }
  }
}
