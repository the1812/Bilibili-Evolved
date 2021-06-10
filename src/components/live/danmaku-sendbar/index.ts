import { ComponentMetadata, componentsTags } from '@/components/component'
import { liveUrls } from '../live-urls'

const entry = async () => {
  const { select } = await import('@/core/spin-query')
  const { leftControllerSelector, originalTextAreaSelector, sendButtonSelector } = await import('./original-elements')

  const leftController = await select(leftControllerSelector) as HTMLDivElement
  const originalTextArea = await select(originalTextAreaSelector) as HTMLTextAreaElement
  const sendButton = await select(sendButtonSelector) as HTMLButtonElement
  if ([leftController, originalTextArea, sendButton].some(it => it === null)) {
    return
  }

  const { mountVueComponent } = await import('@/core/utils')
  const DanmakuSendBar = await import('./DanmakuSendbar.vue')
  leftController.insertAdjacentElement('afterend', mountVueComponent(DanmakuSendBar).$el)
}
export const component: ComponentMetadata = {
  name: 'liveDanmakuSendbar',
  displayName: '直播弹幕发送栏',
  tags: [
    componentsTags.live,
  ],
  description: {
    'zh-CN': '在直播的网页全屏和全屏模式状态下, 在底部显示弹幕栏.',
  },
  enabledByDefault: true,
  entry,
  reload: () => document.body.classList.remove('danmaku-send-bar-unloaded'),
  unload: () => document.body.classList.add('danmaku-send-bar-unloaded'),
  urlInclude: liveUrls,
}
