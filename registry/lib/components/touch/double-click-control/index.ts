import { defineComponentMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { videoChange } from '@/core/observer'
import { addStyle } from '@/core/style'
import { playerUrls } from '@/core/utils/urls'

import touchStyles from './double-click-control.scss'

const entry = async () => {
  addStyle(touchStyles)
  const disableOriginalHover = 'disable-original-hover'
  const touchHover = 'touch-video-control-show'
  videoChange(async () => {
    const playerArea = await playerAgent.query.playerArea()
    if (playerArea.classList.contains(disableOriginalHover)) {
      return
    }
    playerArea.classList.add(disableOriginalHover)
    const videoWrapper = playerAgent.query.video.container.sync()
    const { DoubleClickEvent } = await import('@/core/utils')
    const doubleClickEvent = new DoubleClickEvent(() => playerAgent.togglePlay(), true)
    doubleClickEvent.singleClickHandler = () => {
      playerArea.classList.toggle(touchHover)
    }
    doubleClickEvent.bind(videoWrapper)
  })
}
export const component = defineComponentMetadata({
  name: 'doubleClickControl',
  displayName: '启用双击控制',
  tags: [componentsTags.touch],
  enabledByDefault: navigator.maxTouchPoints > 0,
  urlInclude: playerUrls,
  entry,
})
