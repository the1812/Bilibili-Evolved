import { contentLoaded } from '@/core/life-cycle'

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
    document.documentElement.classList.toggle('iframe', isIframe() && transparentFrames.some(matchUrlPattern))
  })
  if (!('requestIdleCallback' in window)) {
    window.requestIdleCallback = (callback: TimerHandler) => window.setTimeout(callback, 0)
    window.cancelIdleCallback = (handle: number) => {
      window.clearTimeout(handle)
    }
  }
}
