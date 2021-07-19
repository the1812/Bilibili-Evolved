import { ComponentMetadata } from '@/components/types'
import { playerUrls } from '@/core/utils/urls'
import touchStyles from './double-click-control.scss'

const entry = async () => {
  const { select } = await import('@/core/spin-query')
  const { videoChange } = await import('@/core/observer')
  const { addStyle } = await import('@/core/style')

  addStyle(touchStyles)
  const disableOriginalHover = 'disable-original-hover'
  const touchHover = 'touch-video-control-show'
  videoChange(async () => {
    const playerArea = await select('.bilibili-player-area')
    if (playerArea.classList.contains(disableOriginalHover)) {
      return
    }
    playerArea.classList.add(disableOriginalHover)
    const videoWrapper = dq('.bilibili-player-video') as HTMLElement
    const { DoubleClickEvent } = await import('@/core/utils')
    const doubleClickEvent = new DoubleClickEvent(
      () => {
        const playButton = dq('.bilibili-player-video-btn-start') as HTMLElement
        playButton?.click()
      },
      true,
    )
    doubleClickEvent.singleClickHandler = () => {
      playerArea.classList.toggle(touchHover)
    }
    doubleClickEvent.bind(videoWrapper)
  })
}
export const component: ComponentMetadata = {
  name: 'doubleClickControl',
  displayName: '启用双击控制',
  description: {
    'zh-CN': '将操作方式更改为: 单击显示/隐藏控制栏, 双击播放/暂停.',
  },
  tags: [
    componentsTags.touch,
  ],
  enabledByDefault: navigator.maxTouchPoints > 0,
  urlInclude: playerUrls,
  entry,
}
