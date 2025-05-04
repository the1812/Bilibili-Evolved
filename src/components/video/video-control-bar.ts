import { reactive } from 'vue'
import { videoChange } from '@/core/observer'
import { matchUrlPattern, mountVueComponent } from '@/core/utils'
import { playerUrls } from '@/core/utils/urls'
import type VideoControlBar from './VideoControlBar.vue'

export interface VideoControlBarItem {
  name: string
  displayName: string
  icon: string
  order: number
  action: (event: MouseEvent) => void | Promise<void>
}
type ControlBarInstance = InstanceType<typeof VideoControlBar>
const controlBarClass = '.be-video-control-bar-extend'
let controlBarInstance: Promise<ControlBarInstance> = null
const controlBarItems: VideoControlBarItem[] = reactive([])
const initControlBar = lodash.once(() => {
  if (!playerUrls.some(url => matchUrlPattern(url))) {
    return Promise.resolve<ControlBarInstance>(null)
  }
  return new Promise<ControlBarInstance>(resolve => {
    videoChange(async () => {
      const { playerAgent } = await import('@/components/video/player-agent')
      const time = await playerAgent.query.control.buttons.time()
      if (time === null || time.parentElement?.querySelector(controlBarClass) !== null) {
        return
      }
      const [el, vm] = mountVueComponent(await import('./VideoControlBar.vue'), {
        items: controlBarItems,
      })
      time.insertAdjacentElement('afterend', el)
      resolve(vm)
    })
  })
})
/** 向视频控制栏添加按钮 */
export const addControlBarButton = async (button: VideoControlBarItem) => {
  if (!controlBarInstance) {
    controlBarInstance = initControlBar()
  }
  const created = (await controlBarInstance) as ControlBarComponent
  if (!created) {
    return
  }
  created.items.push(button)
}
