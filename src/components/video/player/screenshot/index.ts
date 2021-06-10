import { ComponentMetadata, componentsTags } from '@/components/component'
import desc from './desc.md'
import { playerUrls } from '../player-urls'

export const VideoScreenshotDisabledClass = 'video-screenshot-disable'
const entry = async () => {
  const { videoChange } = await import('@/core/observer')
  const { dq, mountVueComponent } = await import('@/core/utils')
  let screenshotButton: ReturnType<typeof mountVueComponent> & { $el: HTMLElement }
  videoChange(async () => {
    const { select } = await import('@/core/spin-query')
    const time = await select('.bilibili-player-video-time')
    if (time === null || dq('.video-take-screenshot')) {
      return
    }
    const TakeScreenshot = await import('./TakeScreenshot.vue')
    screenshotButton = mountVueComponent(TakeScreenshot)
    time.insertAdjacentElement('afterend', screenshotButton.$el)
  })
  document.addEventListener('keydown', e => {
    const isTyping = document.activeElement && ['input', 'textarea'].includes(document.activeElement.nodeName.toLowerCase())
    if (isTyping) {
      return
    }
    if (document.body.classList.contains(VideoScreenshotDisabledClass)) {
      return
    }
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'c') {
      e.stopPropagation()
      e.preventDefault()
      screenshotButton.$el?.click()
    }
  })
}
export const component: ComponentMetadata = {
  name: 'videoScreenshot',
  displayName: '启用视频截图',
  enabledByDefault: false,
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
