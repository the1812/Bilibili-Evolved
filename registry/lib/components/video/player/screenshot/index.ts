import { defineComponentMetadata } from '@/components/define'
import { addControlBarButton } from '@/components/video/video-control-bar'
import { mountVueComponent } from '@/core/utils'
import { playerUrls } from '@/core/utils/urls'

import type { KeyBindingAction } from '../../../utils/keymap/bindings'
import desc from './desc.md'
import { takeScreenshot } from './screenshot'
import ScreenshotContainer from './VideoScreenshotContainer.vue'

export const VideoScreenshotDisabledClass = 'video-screenshot-disable'
let screenShotsList: InstanceType<typeof ScreenshotContainer> | undefined
const exitConfirmHandler = (e: BeforeUnloadEvent) => {
  if (screenShotsList?.screenshots.length > 0) {
    e.preventDefault()
  }
}

const entry = async () => {
  addControlBarButton({
    name: 'takeScreenshot',
    displayName: '截图',
    icon: 'mdi-camera',
    order: 0,
    action: async (e: MouseEvent) => {
      const { playerAgent } = await import('@/components/video/player-agent')
      const video = await playerAgent.query.video.element()
      if (video instanceof HTMLVideoElement) {
        const screenshot = takeScreenshot(video, e.shiftKey)
        if (!screenShotsList) {
          const [el, vm] = mountVueComponent(ScreenshotContainer)
          screenShotsList = vm
          document.body.insertAdjacentElement('beforeend', el)
        }
        screenShotsList.screenshots.unshift(screenshot)
      } else {
        const { logError } = await import('@/core/utils/log')
        logError(
          '视频截图失败: 无法定位视频元素, 请尝试右击视频两次后另存为图片, 或将播放策略改为 AV1 或 AVC.',
        )
      }
    },
  })
  window.addEventListener('beforeunload', exitConfirmHandler)
}
export const component = defineComponentMetadata({
  name: 'videoScreenshot',
  displayName: '启用视频截图',
  tags: [componentsTags.video],
  entry,
  description: {
    'zh-CN': desc,
  },
  urlInclude: playerUrls,
  reload: () => {
    document.body.classList.remove(VideoScreenshotDisabledClass)
    window.addEventListener('beforeunload', exitConfirmHandler)
  },
  unload: () => {
    document.body.classList.add(VideoScreenshotDisabledClass)
    window.removeEventListener('beforeunload', exitConfirmHandler)
  },
  plugin: {
    displayName: '视频截图 - 快捷键支持',
    setup: ({ addData }) => {
      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.takeScreenshot = {
          displayName: '视频截图',
          run: context => {
            const { clickElement } = context
            return clickElement(
              '.be-video-control-bar-extend [data-name="takeScreenshot"]',
              context,
            )
          },
        }
      })
      addData('keymap.presets', (presetBase: Record<string, string>) => {
        presetBase.takeScreenshot = 'ctrl [shift] alt c'
      })
    },
  },
})
