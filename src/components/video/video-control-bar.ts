import { videoChange } from '@/core/observer'
import { matchUrlPattern } from '@/core/utils'
import { playerUrls } from '@/core/utils/urls'

export interface VideoControlBarItem {
  name: string
  displayName: string
  icon: string
  order: number
  action: (event: MouseEvent) => void | Promise<void>
}
let controlBarInstance: Vue
const controlBarItems: VideoControlBarItem[] = []
const initControlBar = lodash.once(async () => {
  if (!playerUrls.some(url => matchUrlPattern(url))) {
    return
  }
  videoChange(async () => {
    const { playerAgent } = await import('@/components/video/player-agent')
    const time = await playerAgent.query.control.buttons.time()
    if (time === null) {
      return
    }
    const VideoControlBar = await import('./VideoControlBar.vue').then(m => m.default)
    controlBarInstance = new VideoControlBar({
      propsData: {
        items: controlBarItems,
      },
    }).$mount()
    time.insertAdjacentElement('afterend', controlBarInstance.$el)
  })
})
/** 向视频控制栏添加按钮 */
export const addControlBarButton = async (button: VideoControlBarItem) => {
  if (!controlBarInstance) {
    await initControlBar()
  }
  controlBarItems.push(button)
}
