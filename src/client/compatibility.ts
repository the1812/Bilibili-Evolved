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
}
