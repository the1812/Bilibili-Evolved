import { defineComponentMetadata } from '@/components/define'
import { waitForControlBar, withControlBar } from '@/components/live/live-control-bar'
import { mountVueComponent } from '@/core/utils'
import { liveUrls } from '@/core/utils/urls'
import { KeyBindingAction } from '../../utils/keymap/bindings'
import {
  Screenshot,
  ScreenshotDisabledClass,
} from '../../video/player/common/screenshot/screenshot'
import ScreenshotContainer from '../../video/player/common/screenshot/ScreenshotContainer.vue'
import LiveScreenshotButton from './LiveScreenshotButton.vue'

const buttonClass = 'be-live-screenshot-button'

let screenShotsList: Vue & {
  screenshots: Screenshot[]
}
let screenshotButton: Element
let enabled = false

const exitConfirmHandler = (e: BeforeUnloadEvent) => {
  if (screenShotsList?.screenshots.length > 0) {
    e.preventDefault()
  }
}

/** 控制栏上显示的直播已持续时间 (轮播等场景下为空) */
const getLiveDuration = () => dq('.control-area .text.time')?.textContent?.trim() || undefined

const addScreenshot = (video: HTMLVideoElement, duration?: string) => {
  if (!screenShotsList) {
    screenShotsList = mountVueComponent(ScreenshotContainer)
    document.body.insertAdjacentElement('beforeend', screenShotsList.$el)
  }
  screenShotsList.screenshots.unshift(new Screenshot(video, video.currentTime, false, duration))
}

const takeLiveScreenshot = async () => {
  const video = dq('.live-player-mounter video, .live-player-ctnr video')
  if (!(video instanceof HTMLVideoElement)) {
    const { logError } = await import('@/core/utils/log')
    logError('直播截图失败: 无法定位直播视频元素.')
    return
  }
  if (!dq('.control-area')) {
    // 控制栏未显示时取不到持续时间, 先临时调出控制栏再截图
    await withControlBar(() => addScreenshot(video, getLiveDuration()))
    return
  }
  // 轮播等场景下控制栏存在但没有持续时间, 交给 Screenshot 用视频时间兜底
  addScreenshot(video, getLiveDuration())
}

const insertScreenshotButton = (controlBar: Element | null) => {
  if (!enabled || !controlBar || dq(controlBar, `.${buttonClass}`)) {
    return
  }
  if (!screenshotButton) {
    screenshotButton = mountVueComponent(LiveScreenshotButton).$el
    const button = screenshotButton.querySelector('button') as HTMLButtonElement
    button.addEventListener('click', takeLiveScreenshot)
  }
  const volume = dq(controlBar, '.volume')
  if (volume) {
    volume.insertAdjacentElement('afterend', screenshotButton)
    return
  }
  ;(dq(controlBar, '.left-area') ?? controlBar).appendChild(screenshotButton)
}

const enable = () => {
  enabled = true
  document.body.classList.remove(ScreenshotDisabledClass)
  window.addEventListener('beforeunload', exitConfirmHandler)
}

export const component = defineComponentMetadata({
  name: 'liveScreenshot',
  displayName: '启用直播截图',
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  tags: [componentsTags.live],
  urlInclude: liveUrls,
  entry: () => {
    enable()
    waitForControlBar({ callback: insertScreenshotButton })
  },
  reload: () => {
    enable()
    insertScreenshotButton(dq('.control-area'))
  },
  unload: () => {
    enabled = false
    document.body.classList.add(ScreenshotDisabledClass)
    window.removeEventListener('beforeunload', exitConfirmHandler)
    screenshotButton?.remove()
  },
  plugin: {
    displayName: '直播截图 - 快捷键支持',
    setup: ({ addData }) => {
      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.takeLiveScreenshot = {
          displayName: '直播截图',
          run: () => {
            // 插件在所有页面都会注册, 组件未在页面运行时不做任何事
            if (!enabled) {
              return undefined
            }
            return takeLiveScreenshot()
          },
        }
      })
      addData('keymap.presets', (presetBase: Record<string, string>) => {
        presetBase.takeLiveScreenshot = 'ctrl [shift] alt c'
      })
    },
  },
})
