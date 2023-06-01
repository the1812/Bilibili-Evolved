import { defineComponentMetadata } from '@/components/define'
import { preventEvent } from '@/core/utils'
import { allVideoUrls } from '@/core/utils/urls'

let cancel: () => void
export const disableScrollVolume = () => {
  return preventEvent(unsafeWindow, 'mousewheel', () => {
    const isFullscreen = ['player-mode-full', 'player-fullscreen-fix', 'player-full-win'].some(
      token => document.body.classList.contains(token),
    )
    return isFullscreen
  })
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
