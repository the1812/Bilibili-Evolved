import {
  defineOptionsMetadata,
  OptionsOfMetadata,
  defineComponentMetadata,
} from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { playerUrls } from '@/core/utils/urls'

const options = defineOptionsMetadata({
  preventSingleClick: {
    displayName: '双击时阻止单击事件',
    defaultValue: true,
  },
})

export type Options = OptionsOfMetadata<typeof options>

const entry: ComponentEntry<Options> = async ({ settings }) => {
  const { videoChange } = await import('@/core/observer')
  videoChange(async () => {
    const { DoubleClickEvent } = await import('@/core/utils')
    const { playerAgent } = await import('@/components/video/player-agent')
    const playerArea = await playerAgent.query.danmakuTipLayer()
    if (playerArea === null) {
      console.error('playerArea not found')
      return
    }
    const className = 'double-click-fullscreen'
    if (!playerArea.classList.contains(className)) {
      playerArea.classList.add(className)
      const container = playerAgent.query.video.container.sync()
      const doubleClick = new DoubleClickEvent(
        () => playerAgent.fullscreen(),
        settings.options.preventSingleClick,
      )
      doubleClick.singleClickHandler = () => playerAgent.togglePlay()
      doubleClick.bind(container)
    }
  })
}

export const component = defineComponentMetadata({
  name: 'doubleClickFullscreen',
  displayName: '双击全屏',
  description: '为视频播放器启用双击全屏功能, 请注意不能和 `启用双击控制` 一同使用.',
  entry,
  tags: [componentsTags.video],
  options,
  urlInclude: playerUrls,
})
