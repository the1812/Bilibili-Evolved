// import { ComponentSettings } from '@/core/settings'
import { ComponentMetadata, componentsTags } from '@/components/component'
import { playerUrls } from '../player-urls'

const entry = async (/* { options }: ComponentSettings */) => {
  const { videoChange } = await import('@/core/observer')
  videoChange(async () => {
    const { select } = await import('@/core/spin-query')
    const { dq } = await import('@/core/utils')
    const { DoubleClickEvent } = await import('@/core/double-click-event')
    const playerArea = await select('.bilibili-player-area')
    if (playerArea === null) {
      console.log('fail')
      return
    }
    const className = 'double-click-fullscreen'
    if (!playerArea.classList.contains(className)) {
      playerArea.classList.add(className)
      const video = dq('.bilibili-player-video')
      const doubleClick = new DoubleClickEvent(
        () => (dq('.bilibili-player-video-btn-fullscreen') as HTMLDivElement).click(),
        // options.preventSingleClick,
        false,
      )
      doubleClick.bind(video)
    }
  })
}
export const component: ComponentMetadata = {
  name: 'doubleClickFullscreen',
  displayName: '双击全屏',
  enabledByDefault: false,
  entry,
  tags: [
    componentsTags.video,
  ],
  options: {
    // preventSingleClick: {
    //   displayName: '阻止单击事件',
    //   defaultValue: false,
    //   hidden: true,
    // },
  },
  urlInclude: playerUrls,
}
