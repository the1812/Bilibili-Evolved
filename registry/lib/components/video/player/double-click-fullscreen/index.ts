import { ComponentEntry, ComponentMetadata } from '@/components/types'
import { playerUrls } from '@/core/utils/urls'

const entry: ComponentEntry = async ({ settings: { options } }) => {
  const { videoChange } = await import('@/core/observer')
  videoChange(async () => {
    const { select } = await import('@/core/spin-query')
    const { DoubleClickEvent } = await import('@/core/utils')
    const playerArea = await select('.bilibili-player-dm-tip-wrap, .bilibili-player-area')
    if (playerArea === null) {
      console.error('playerArea not found')
      return
    }
    const className = 'double-click-fullscreen'
    if (!playerArea.classList.contains(className)) {
      playerArea.classList.add(className)
      const videoWrapper = dq('.bilibili-player-video')
      const doubleClick = new DoubleClickEvent(
        () => (dq('.bilibili-player-video-btn-fullscreen') as HTMLDivElement).click(),
        options.preventSingleClick,
      )
      doubleClick.singleClickHandler = () => (dq('.bilibili-player-video-btn-start') as HTMLDivElement).click()
      doubleClick.bind(videoWrapper)
    }
  })
}
export const component: ComponentMetadata = {
  name: 'doubleClickFullscreen',
  displayName: '双击全屏',
  entry,
  tags: [
    componentsTags.video,
  ],
  options: {
    preventSingleClick: {
      displayName: '双击时阻止单击事件',
      defaultValue: true,
    },
  },
  urlInclude: playerUrls,
}
