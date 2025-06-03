import { defineComponentMetadata } from '@/components/define'
import { preventEvent } from '@/core/utils'
import { allVideoUrls } from '@/core/utils/urls'

let cancel: () => void
export const disableScrollVolume = () => {
  const shouldPrevent = () => {
    const isFullscreen = [
      'player-mode-full',
      'player-mode-web',
      'player-fullscreen-fix',
      'player-full-win',
    ].some(token => document.body.classList.contains(token))
    return isFullscreen
  }
  const cancelFirefox = preventEvent(unsafeWindow, 'DOMMouseScroll', shouldPrevent)
  const cancelStandard = preventEvent(unsafeWindow, 'wheel', shouldPrevent)
  return () => {
    cancelFirefox()
    cancelStandard()
  }
}
export const component = defineComponentMetadata({
  name: 'disableScrollVolume',
  displayName: '禁止滚轮调音量',
  tags: [componentsTags.video],
  entry: () => {
    cancel?.()
    cancel = disableScrollVolume()
  },
  reload: () => {
    cancel?.()
    cancel = disableScrollVolume()
  },
  unload: () => {
    cancel?.()
  },
  urlInclude: allVideoUrls,
})
