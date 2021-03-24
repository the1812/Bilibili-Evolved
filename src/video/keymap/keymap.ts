import { VideoSpeedController } from '../video-speed/video-speed-controller'
import { KeyBinding, KeyBindingAction, KeyBindingActionContext } from './key-bindings'

const supportedUrls = [
  'https://www.bilibili.com/bangumi/',
  'https://www.bilibili.com/video/',
  'https://www.bilibili.com/cheese/',
  'https://www.bilibili.com/watchlater/',
  'https://www.bilibili.com/medialist/play/',
  'https://www.bilibili.com/festival/2021bnj',
]

let config: { enable: boolean, bindings: KeyBinding[] } | undefined = undefined
if (supportedUrls.some(url => document.URL.startsWith(url))) {
  const clickElement = (target: string | HTMLElement) => {
    return ({ event }: KeyBindingActionContext) => {
      const mouseEvent = new MouseEvent('click', {
        ..._.pick(event, 'ctrlKey', 'shiftKey', 'altKey', 'metaKey')
      })
      if (typeof target === 'string') {
        (dq(target) as HTMLElement)?.dispatchEvent(mouseEvent)
      } else {
        target.dispatchEvent(mouseEvent)
      }
    }
  }
  const changeVideoTime = (delta: number) => {
    return () => {
      const video = dq('.bilibili-player-video video') as HTMLVideoElement
      if (!video || !unsafeWindow.player) {
        return
      }
      unsafeWindow.player.seek(video.currentTime + delta, video.paused)
    }
  }
  /** 提示框用的`setTimeout`句柄 */
  let tipTimeoutHandle: number
  /**
   * 显示提示框
   * @param text 文字 (可以 HTML)
   * @param icon MDI 图标 class
   */
  const showTip = (text: string, icon: string) => {
    let tip = dq('.keymap-tip') as HTMLDivElement
    if (!tip) {
      const player = dq('.bilibili-player-video-wrap')
      if (!player) {
        return
      }
      player.insertAdjacentHTML('afterbegin', /*html*/`
        <div class="keymap-tip-container">
          <i class="keymap-tip-icon mdi ${icon}"></i>
          <div class="keymap-tip">${text}</div>
        </div>
      `)
      tip = dq('.keymap-tip') as HTMLDivElement
    }
    tip.innerHTML = text
    const container = dq('.keymap-tip-container') as HTMLDivElement
    const iconElement = dq(container, '.mdi') as HTMLElement
    iconElement.classList.remove(...iconElement.classList.values())
    iconElement.classList.add('mdi', icon)
    if (tipTimeoutHandle) {
      clearTimeout(tipTimeoutHandle)
    }
    container.classList.add('show')
    tipTimeoutHandle = window.setTimeout(() => {
      container.classList.remove('show')
    }, 2000)
  }
  const videoSpeed = (controllerAction: (controller: VideoSpeedController, rates: number[]) => void) => {
    return async () => {
      const { VideoSpeedController } = await import('../video-speed/video-speed-controller')
      const controller = await VideoSpeedController.getInstance()
      controllerAction(controller, VideoSpeedController.supportedRates)
      showTip(`${controller.playbackRate}x`, 'mdi-fast-forward')
    }
  }
  const actions = {
    fullscreen: clickElement('.bilibili-player-video-btn-fullscreen'),
    webFullscreen: clickElement('.bilibili-player-video-web-fullscreen'),
    wideScreen: clickElement('.bilibili-player-video-btn-widescreen'),
    volumeUp: () => {
      const current = unsafeWindow.player.volume()
      unsafeWindow.player.volume(current + 0.1)
      showTip(`${Math.round(unsafeWindow.player.volume() * 100)}%`, 'mdi-volume-high')
    },
    volumeDown: () => {
      const current = unsafeWindow.player.volume()
      unsafeWindow.player.volume(current - 0.1)
      const after = Math.round(unsafeWindow.player.volume() * 100)
      if (after === 0) {
        showTip('静音', 'mdi-volume-off')
      } else {
        showTip(`${after}%`, 'mdi-volume-high')
      }
    },
    mute: (context: KeyBindingActionContext) => {
      clickElement('.bilibili-player-video-btn-volume .bilibili-player-iconfont-volume')(context)
      const isMute = unsafeWindow.player.isMute()
      if (isMute) {
        showTip('已静音', 'mdi-volume-off')
      } else {
        showTip('已取消静音', 'mdi-volume-high')
      }
    },
    pictureInPicture: clickElement('.bilibili-player-video-btn-pip'),
    coin: clickElement('.video-toolbar .coin,.tool-bar .coin-info, .video-toolbar-module .coin-box, .play-options-ul > li:nth-child(2)'),
    favorite: clickElement('.video-toolbar .collect, .video-toolbar-module .fav-box, .play-options-ul > li:nth-child(3)'),
    pause: clickElement('.bilibili-player-video-btn-start'),
    like: (() => {
      /** 长按`L`三连使用的记忆变量 */
      let likeClick = true
      return (({ event }) => {
        const likeButton = dq('.video-toolbar .like, .tool-bar .like-info') as HTMLSpanElement
        event.preventDefault()
        const fireEvent = (name: string, args: Event) => {
          const event = new CustomEvent(name, args)
          likeButton.dispatchEvent(event)
        }
        likeClick = true
        setTimeout(() => likeClick = false, 200)
        fireEvent('mousedown', event)
        document.body.addEventListener('keyup', e => {
          e.preventDefault()
          fireEvent('mouseup', e)
          if (likeClick) {
            fireEvent('click', e)
          }
        }, { once: true })
      }) as KeyBindingAction
    })(),
    danmaku: () => {
      const checkbox = dq('.bilibili-player-video-danmaku-switch input') as HTMLInputElement
      if (!checkbox) {
        return
      }
      checkbox.checked = !checkbox.checked
      raiseEvent(checkbox, 'change')
    },
    longJumpBackward: changeVideoTime(-settings.keymapJumpSeconds),
    longJumpForward: changeVideoTime(settings.keymapJumpSeconds),
    jumpBackward: changeVideoTime(-5),
    jumpForward: changeVideoTime(5),
    playerMenu: () => {
      // menu size: 386.6 x 311 (2020-03-29)
      // menu size: 176.65 x 194 (2020-06-09)
      const player = dq('.bilibili-player-video-wrap') as HTMLElement
      if (!player) {
        return
      }
      const rect = player.getBoundingClientRect()
      player.dispatchEvent(new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: false,
        view: unsafeWindow,
        button: 2,
        buttons: 0,
        clientX: rect.x + rect.width / 2 - 176.65 / 2,
        clientY: rect.y + rect.height / 2 - 194 / 2
      }))
    },
    watchlater: clickElement('.video-toolbar .ops .watchlater, .more-ops-list .ops-watch-later, .video-toolbar-module .see-later-box'),
    quickFavorite: clickElement('.quick-favorite'),
    videoSpeedIncrease: videoSpeed((controller, rates) => {
      controller.setVideoSpeed(rates.find(it => it > controller.playbackRate) || rates[rates.length - 1])
    }),
    videoSpeedDecrease: videoSpeed((controller, rates) => {
      controller.setVideoSpeed([...rates].reverse().find(it => it < controller.playbackRate) || rates[0])
    }),
    videoSpeedReset: videoSpeed((controller) => {
      controller.toggleVideoSpeed()
    }),
    videoSpeedForget: videoSpeed((controller) => {
      controller.reset(true)
    }),
    takeScreenshot: clickElement('.video-take-screenshot'),
    previousFrame: clickElement('.prev-frame'),
    nextFrame: clickElement('.next-frame'),
    seekBegin: () => {
      if (!unsafeWindow.player) {
        return
      }
      unsafeWindow.player.play()
      setTimeout(() => {
        unsafeWindow.player.seek(0)
        const toastText = dq(".bilibili-player-video-toast-bottom .bilibili-player-video-toast-item:first-child .bilibili-player-video-toast-item-text span:nth-child(2)")
        if (toastText) {
          toastText.textContent = " 00:00"
        }
      })
    },
  }
  const defaultBindings: { [action in keyof typeof actions]: string } = {
    fullscreen: 'f',
    webFullscreen: 'w',
    wideScreen: 't',
    volumeUp: 'arrowUp',
    volumeDown: 'arrowDown',
    mute: 'm',
    pictureInPicture: 'p',
    coin: 'c',
    favorite: 's',
    pause: 'space',
    like: 'l',
    playerMenu: '`',
    longJumpForward: 'j',
    longJumpBackward: 'shift j',
    jumpBackward: 'arrowLeft',
    jumpForward: 'arrowRight',
    watchlater: 'shift w',
    quickFavorite: 'shift s',
    danmaku: 'd',
    videoSpeedIncrease: 'shift > 》 arrowUp',
    videoSpeedDecrease: 'shift < 《 arrowDown',
    videoSpeedReset: 'shift ? ？',
    videoSpeedForget: 'shift : ：',
    takeScreenshot: 'ctrl [shift] alt c',
    previousFrame: 'shift arrowLeft',
    nextFrame: 'shift arrowRight',
    seekBegin: '0',
  }
  const parseBindings = (bindings: { [action: string]: string }) => {
    return Object.entries(bindings).map(([actionName, keyString]) => {
      const keys = keyString.split(' ').filter(it => it !== '')
      return {
        keys,
        action: (actions as any)[actionName] || (() => {}),
      } as KeyBinding
    })
  }

  ;(async () => {
    const { loadKeyBindings } = await import('./key-bindings')
    const { presets } = await import('./key-binding-presets')
    addSettingsListener('keymapPreset', () => {
      const preset = presets[settings.keymapPreset] || {}
      const bindings = parseBindings(
        { ...defaultBindings, ...preset, ...settings.customKeyBindings }
      )
      if (config) {
        console.log('load preset', settings.keymapPreset)
        config.bindings = bindings
      } else {
        config = loadKeyBindings(bindings)
      }
    }, true)
    resources.applyImportantStyle('keymapStyle')
  })()
}

export default {
  reload: () => config && (config.enable = true),
  unload: () => config && (config.enable = false),
}
