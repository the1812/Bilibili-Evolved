import { addControlBarButton } from '@/components/video/video-control-bar'
import { attributesSubtree } from '@/core/observer'
import { playerReady } from '@/core/utils'
import { playerUrls } from '@/core/utils/urls'
import { addData } from '@/plugins/data'
import { KeyBindingAction } from '../../../utils/keymap/bindings'
import { defineComponentMetadata } from '@/components/define'
import desc from './desc.md'
import seekLeft from './seek-left.svg'
import seekRight from './seek-right.svg'

export const SeekByFramesDisabledClass = 'seek-by-frame-disable'
const entry = async () => {
  await playerReady()
  const { playerAgent } = await import('@/components/video/player-agent')
  addData('ui.icons', (icons: Record<string, string>) => {
    icons['seek-left'] = seekLeft
    icons['seek-right'] = seekRight
  })
  let frameTime = 0
  attributesSubtree(`${playerAgent.query.control.buttons.quality.selector} ul`, () => {
    const selectedQuality = dq(
      `${playerAgent.query.control.buttons.quality.selector} .bui-select-item-active, ${playerAgent.query.control.buttons.quality.selector} .active`,
    )
    const quality = selectedQuality ? parseInt(selectedQuality.getAttribute('data-value')) : 0
    const fps = (() => {
      switch (quality) {
        // 60fps
        case 116:
        case 74:
          return 60000 / 1001
        // 30fps
        default:
          return 30000 / 1001
      }
    })()
    frameTime = 1 / fps
  })
  const setFrame = (num: number) => {
    playerAgent.changeTime(num * frameTime)
  }
  addControlBarButton({
    name: 'seekPrevFrame',
    displayName: '上一帧',
    icon: 'seek-left',
    order: 1,
    action: () => {
      setFrame(-1)
    },
  })
  addControlBarButton({
    name: 'seekNextFrame',
    displayName: '下一帧',
    icon: 'seek-right',
    order: 2,
    action: () => {
      setFrame(1)
    },
  })
}

export const component = defineComponentMetadata({
  name: 'seekByFrames',
  displayName: '启用逐帧调整',
  tags: [componentsTags.video],
  description: {
    'zh-CN': desc,
  },
  entry,
  reload: () => document.body.classList.remove(SeekByFramesDisabledClass),
  unload: () => document.body.classList.add(SeekByFramesDisabledClass),
  urlInclude: playerUrls,
  plugin: {
    displayName: '逐帧调整 - 快捷键支持',
    setup: () => {
      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.previousFrame = {
          displayName: '上一帧',
          run: context => {
            const { clickElement } = context
            return clickElement('.be-video-control-bar-extend [data-name="seekPrevFrame"]', context)
          },
        }
        actions.nextFrame = {
          displayName: '下一帧',
          run: context => {
            const { clickElement } = context
            return clickElement('.be-video-control-bar-extend [data-name="seekNextFrame"]', context)
          },
        }
      })
      addData('keymap.presets', (presetBase: Record<string, string>) => {
        presetBase.previousFrame = 'shift arrowLeft'
        presetBase.nextFrame = 'shift arrowRight'
      })
    },
  },
})
