import { defineComponentMetadata } from '@/components/define'
import { preventEvent } from '@/core/utils'

let cancel: () => void
const prevent = () => {
  cancel?.()
  cancel = preventEvent(unsafeWindow, 'mousewheel', () => {
    const isFullscreen = [
      'player-mode-webfullscreen',
      'player-fullscreen-fix',
      'player-full-win',
    ].some(token => document.body.classList.contains(token))
    return isFullscreen
  })
}
export const component = defineComponentMetadata({
  name: 'disableScrollVolume',
  displayName: '禁止滚轮调音量',
  tags: [componentsTags.video],
  entry: prevent,
  reload: prevent,
  unload: () => {
    cancel?.()
  },
})
