import { contentLoaded } from '@/core/life-cycle'

export const compatibilityPatch = () => {
  contentLoaded(() => document.body.classList.add('round-corner'))
  if (!('requestIdleCallback' in window)) {
    window.requestIdleCallback = (callback: TimerHandler) => {
      window.setTimeout(callback, 0)
    }
    window.cancelIdleCallback = (handle: number) => {
      window.clearTimeout(handle)
    }
  }
}
