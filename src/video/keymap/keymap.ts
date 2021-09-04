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

let config: { enable: boolean, bindings: KeyBinding[] } | undefined = undefined;
(async () => {
  if (!supportedUrls.some(url => document.URL.startsWith(url))) {
    return
  }
  const { playerAgent } = await import('../player-agent')
  const clickElement = (target: string | HTMLElement | Promise<HTMLElement | null>) => {
    return async ({ event }: KeyBindingActionContext) => {
      const mouseEvent = new MouseEvent('click', {
        ..._.pick(event, 'ctrlKey', 'shiftKey', 'altKey', 'metaKey')
      })
      if (typeof target === 'string') {
        (dq(target) as HTMLElement)?.dispatchEvent(mouseEvent)
      } else {
        const element = await target
        element?.dispatchEvent(mouseEvent)
      }
    }
  }
  const changeVideoTime = (delta: number) => {
    return async () => playerAgent.changeTime(delta)
    // return async () => {
    //   const video = await playerAgent.query.video.element() as HTMLVideoElement
    //   console.log(`[keymap] requested video time change, delta = ${delta}`)
    //   if (!video) {
    //     console.log('[keymap] video element not found')
    //     return
    //   }
    //   if (!unsafeWindow.player) {
    //     // fallback
    //     console.log('[keymap] fallback')
    //     video.currentTime += delta
    //     return
    //   }
    //   console.log('[keymap] player API seek')
    //   unsafeWindow.player.seek(video.currentTime + delta, video.paused)
    // }
  }
  /** 提示框用的`setTimeout`句柄 */
  let tipTimeoutHandle: number
  /**
   * 显示提示框
   * @param text 文字 (可以 HTML)
   * @param icon MDI 图标 class
   */
  const showTip = async (text: string, icon: string) => {
    let tip = dq('.keymap-tip') as HTMLDivElement
    if (!tip) {
      const player = await playerAgent.query.playerArea() as HTMLElement
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
    fullscreen: () => playerAgent.fullscreen(),
    webFullscreen: () => playerAgent.webFullscreen(),
    wideScreen: () => playerAgent.widescreen(),
    volumeUp: async () => {
      const volume = await playerAgent.changeVolume(10)
      showTip(`${volume}%`, 'mdi-volume-high')
    },
    volumeDown: async () => {
      const volume = await playerAgent.changeVolume(-10)
      if (volume === 0) {
        showTip('静音', 'mdi-volume-off')
      } else {
        showTip(`${volume}%`, 'mdi-volume-high')
      }
    },
    mute: async () => {
      await playerAgent.toggleMute()
      const isMute = await playerAgent.isMute()
      if (isMute) {
        showTip('已静音', 'mdi-volume-off')
      } else {
        showTip('已取消静音', 'mdi-volume-high')
      }
    },
    pictureInPicture: () => playerAgent.togglePip(),
    coin: clickElement('.video-toolbar .coin,.tool-bar .coin-info, .video-toolbar-module .coin-box, .play-options-ul > li:nth-child(2)'),
    favorite: clickElement('.video-toolbar .collect, .video-toolbar-module .fav-box, .play-options-ul > li:nth-child(3)'),
    pause: () => playerAgent.togglePlay(),
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
      playerAgent.toggleDanmaku()
    },
    longJumpBackward: changeVideoTime(-settings.keymapJumpSeconds),
    longJumpForward: changeVideoTime(settings.keymapJumpSeconds),
    jumpBackward: changeVideoTime(-5),
    jumpForward: changeVideoTime(5),
    playerMenu: async () => {
      // menu size: 386.6 x 311 (2020-03-29)
      // menu size: 176.65 x 194 (2020-06-09)
      const container = await playerAgent.query.video.container() as HTMLElement
      if (!container) {
        return
      }
      const rect = container.getBoundingClientRect()
      container.dispatchEvent(new MouseEvent('contextmenu', {
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
    seekBegin: () => playerAgent.seek(0),
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
        action: (actions as any)[actionName] || (() => { }),
      } as KeyBinding
    })
  }
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

export default {
  reload: () => config && (config.enable = true),
  unload: () => config && (config.enable = false),
}
