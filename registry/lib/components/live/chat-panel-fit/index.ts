import { defineComponentMetadata } from '@/components/define'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { select, sq } from '@/core/spin-query'
import { mountVueComponent } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { liveUrls } from '@/core/utils/urls'
import { ChatPanelFitOptions, ChatPanelFitOptionsMinWidth, chatPanelFitOptions } from './options'

const name = 'liveChatPanelFit'
const console = useScopedConsole(name)

const calcPanelWidth = () => {
  const { maxWidth, customWidth } = getComponentSettings<ChatPanelFitOptions>(name).options
  if (customWidth !== 0) {
    return
  }
  const video = dq('.live-player-ctnr video') as HTMLVideoElement
  if (!video) {
    return
  }
  const widthRatio = video.videoWidth
  const heightRatio = video.videoHeight
  if (widthRatio === 0 || heightRatio === 0) {
    return
  }
  const { innerWidth, innerHeight } = window
  const liveChatPanelWidth = innerWidth - (widthRatio * innerHeight) / heightRatio
  console.log({ liveChatPanelWidth })
  document.documentElement.style.setProperty(
    '--live-chat-panel-width',
    `${lodash.clamp(liveChatPanelWidth, ChatPanelFitOptionsMinWidth, maxWidth)}px`,
  )
}
const debounceCalcPanelWidth = lodash.debounce(calcPanelWidth, 200)

let draggerInstance: Vue
const load = async () => {
  addComponentListener(`${name}.targetRatio`, calcPanelWidth)
  addComponentListener(`${name}.maxWidth`, calcPanelWidth)
  window.addEventListener('customWidthReset', calcPanelWidth)
  window.addEventListener('resize', debounceCalcPanelWidth)
  const video = await sq(
    () => dq('.live-player-ctnr video') as HTMLVideoElement,
    v => v !== null && v.readyState !== HTMLMediaElement.HAVE_NOTHING,
  )
  if (!video) {
    console.log('未找到 video 元素')
    return
  }
  calcPanelWidth()

  const asideToggleButton = (await select('.aside-area-toggle-btn')) as HTMLElement
  if (!asideToggleButton) {
    console.log('未找到侧边栏按钮')
    return
  }
  const { default: ChatPanelFitDragger } = await import('./ChatPanelFitDragger.vue')
  draggerInstance = mountVueComponent(ChatPanelFitDragger)
  asideToggleButton.insertAdjacentElement('afterend', draggerInstance.$el)
}
const unload = () => {
  removeComponentListener(`${name}.targetRatio`, calcPanelWidth)
  removeComponentListener(`${name}.maxWidth`, calcPanelWidth)
  window.removeEventListener('customWidthReset', calcPanelWidth)
  window.removeEventListener('resize', debounceCalcPanelWidth)
  document.documentElement.style.removeProperty('--live-chat-panel-width')
  if (draggerInstance) {
    draggerInstance.$el.remove()
    draggerInstance.$destroy()
    draggerInstance = undefined
  }
}

export const component = defineComponentMetadata({
  name,
  displayName: '直播间网页全屏自适应',
  tags: [componentsTags.live, componentsTags.style],
  urlInclude: [...liveUrls],
  entry: load,
  reload: load,
  unload,
  instantStyles: [
    {
      name,
      style: () => import('./chat-panel-fit.scss'),
      important: true,
    },
  ],
  options: chatPanelFitOptions,
})
