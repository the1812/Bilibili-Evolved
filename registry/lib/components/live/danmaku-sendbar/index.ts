import { waitForControlBar } from '@/components/live/live-control-bar'
import { defineComponentMetadata } from '@/components/define'
import { getUID } from '@/core/utils'
import { liveUrls } from '@/core/utils/urls'
import { leftControllerSelector } from './original-elements'

const entry = async () => {
  if (!getUID()) {
    return
  }
  let danmakuSendBarElement: Element
  waitForControlBar({
    callback: async controlBar => {
      const leftController = dq(controlBar, leftControllerSelector) as HTMLDivElement
      if (!leftController) {
        throw new Error('[danmakuSendBar] leftController not found')
      }
      if (dq(controlBar, '.danmaku-send-bar')) {
        return
      }
      if (!danmakuSendBarElement) {
        const { mountVueComponent } = await import('@/core/utils')
        const DanmakuSendBar = await import('./DanmakuSendbar.vue')
        danmakuSendBarElement = mountVueComponent(DanmakuSendBar).$el
      }
      leftController.insertAdjacentElement('afterend', danmakuSendBarElement)
    },
  })
}
export const component = defineComponentMetadata({
  name: 'liveDanmakuSendbar',
  displayName: '直播弹幕发送栏',
  tags: [componentsTags.live],
  description: {
    'zh-CN': '在直播的网页全屏和全屏模式状态下, 在底部显示弹幕栏.',
  },
  entry,
  reload: () => document.body.classList.remove('danmaku-send-bar-unloaded'),
  unload: () => document.body.classList.add('danmaku-send-bar-unloaded'),
  urlInclude: liveUrls,
})
