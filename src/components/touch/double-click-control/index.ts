import { ComponentMetadata, componentsTags } from '@/components/component'
import { playerUrls } from '@/components/video/player/player-urls'

const entry = async () => {
  const { select } = await import('@/core/spin-query')
  const { videoChange } = await import('@/core/observer')
  const { addStyle } = await import('@/core/style')
  const { default: style } = await import('./double-click-control.scss')

  addStyle(style)
  const disableOriginalHover = 'disable-original-hover'
  const touchHover = 'touch-video-control-show'
  videoChange(async () => {
    const playerArea = await select('.bilibili-player-area')
    if (playerArea.classList.contains(disableOriginalHover)) {
      return
    }
    playerArea.classList.add(disableOriginalHover)
    const { dq } = await import('@/core/utils')
    const video = dq('.bilibili-player-video') as HTMLElement
    const { DoubleClickEvent } = await import('@/core/double-click-event')
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
    doubleClickEvent.bind(video)
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
  enabledByDefault: false,
  urlInclude: playerUrls,
  entry,
}
