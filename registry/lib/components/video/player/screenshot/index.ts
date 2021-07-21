import { ComponentMetadata } from '@/components/types'
import { addControlBarButton } from '@/components/video/video-control-bar'
import { mountVueComponent } from '@/core/utils'
import { playerUrls } from '@/core/utils/urls'
import { Screenshot, takeScreenshot } from './screenshot'
import desc from './desc.md'
import ScreenshotContainer from './VideoScreenshotContainer.vue'

export const VideoScreenshotDisabledClass = 'video-screenshot-disable'
const entry = async () => {
  let screenShotsList: Vue & {
    screenshots: Screenshot[]
  }
  addControlBarButton({
    name: 'takeScreenshot',
    displayName: '截图',
    icon: 'mdi-camera',
    order: 0,
    action: async (e: MouseEvent) => {
      const { select } = await import('@/core/spin-query')
      const video = (await select('.bilibili-player-video video')) as HTMLVideoElement
      const screenshot = takeScreenshot(video, e.shiftKey)
      if (!screenShotsList) {
        screenShotsList = mountVueComponent(ScreenshotContainer)
        document.body.insertAdjacentElement('beforeend', screenShotsList.$el)
      }
      screenShotsList.screenshots.unshift(screenshot)
    },
  })
}
export const component: ComponentMetadata = {
  name: 'videoScreenshot',
  displayName: '启用视频截图',
  tags: [
    componentsTags.video,
  ],
  entry,
  description: {
    'zh-CN': desc,
  },
  urlInclude: playerUrls,
  reload: () => document.body.classList.remove(VideoScreenshotDisabledClass),
  unload: () => document.body.classList.add(VideoScreenshotDisabledClass),
}
