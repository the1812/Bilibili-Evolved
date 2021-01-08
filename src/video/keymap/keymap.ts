import { VideoSpeedController } from '../default-video-speed'
import { KeyBinding, KeyBindingAction } from './key-bindings'

const supportedUrls = [
  'https://www.bilibili.com/bangumi/',
  'https://www.bilibili.com/video/',
  'https://www.bilibili.com/watchlater/',
  'https://www.bilibili.com/medialist/play/',
]

let config: { enable: boolean }
if (supportedUrls.some(url => document.URL.startsWith(url))) {
  const clickElement = (target: string | HTMLElement) => {
    return () => {
      if (typeof target === 'string') {
        (dq(target) as HTMLElement)?.click()
      } else {
        target.click()
      }
    }
  }
  /** 播放速度提示框用的`setTimeout`句柄 */
  let showPlaybackTipOldTimeout: number
  /**
   * 显示播放速度提示框
   * @param speed 播放速度
   */
  const showPlaybackTip = (speed: number) => {
    let tip = dq('.keymap-playback-tip') as HTMLDivElement
    if (!tip) {
      const player = dq('.bilibili-player-video-wrap')
      if (!player) {
        return
      }
      player.insertAdjacentHTML('afterbegin', /*html*/`
        <div class="keymap-playback-tip-container">
          <i class="mdi mdi-fast-forward"></i>
          <div class="keymap-playback-tip"></div>x
        </div>
      `)
      resources.applyStyleFromText(`
        .keymap-playback-tip-container {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          padding: 8px 16px;
          background-color: #000A;
          color: white;
          pointer-events: none;
          opacity: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          font-size: 14pt;
          border-radius: 4px;
          transition: .2s ease-out;
        }
        .keymap-playback-tip-container.show {
          opacity: 1;
        }
        .keymap-playback-tip-container i {
          line-height: 1;
          margin-right: 8px;
          font-size: 18pt;
        }
      `, 'keymapStyle')
      tip = dq('.keymap-playback-tip') as HTMLDivElement
    }
    tip.innerHTML = speed.toString()
    if (showPlaybackTipOldTimeout) {
      clearTimeout(showPlaybackTipOldTimeout)
    }
    (dq('.keymap-playback-tip-container') as HTMLDivElement).classList.add('show')
    showPlaybackTipOldTimeout = window.setTimeout(() => {
      (dq('.keymap-playback-tip-container') as HTMLDivElement).classList.remove('show')
    }, 2000)
  }
  const videoSpeed = (controllerAction: (controller: VideoSpeedController, rates: number[]) => void) => {
    return async () => {
      const { VideoSpeedController } = await import('../default-video-speed')
      const containerElement = dq(`.${VideoSpeedController.classNameMap.speedContainer}`) as HTMLElement
      const videoElement = dq(`.${VideoSpeedController.classNameMap.video} video`) as HTMLVideoElement
      if (!containerElement || !videoElement) {
        return
      }
      const controller = new VideoSpeedController(containerElement, videoElement, 1)
      controllerAction(controller, VideoSpeedController.supportedRates)
      showPlaybackTip(controller.playbackRate)
    }
  }
  const actions = {
    fullscreen: clickElement('.bilibili-player-video-btn-fullscreen'),
    webFullscreen: clickElement('.bilibili-player-video-web-fullscreen'),
    wideScreen: clickElement('.bilibili-player-video-btn-widescreen'),
    mute: clickElement('.bilibili-player-video-btn-volume .bilibili-player-iconfont-volume'),
    pictureInPicture: clickElement('.bilibili-player-video-btn-pip'),
    coin: clickElement('.video-toolbar .coin,.tool-bar .coin-info, .video-toolbar-module .coin-box, .play-options-ul > li:nth-child(2)'),
    favorite: clickElement('.video-toolbar .collect, .video-toolbar-module .fav-box, .play-options-ul > li:nth-child(3)'),
    pause: clickElement('.bilibili-player-video-btn-start'),
    like: (() => {
      /** 长按`L`三连使用的记忆变量 */
      let likeClick = true
      /** 在稍后再看页面里, 记录当前视频是否赞过 */
      let liked = false

      const listenWatchlaterVideoChange = _.once(() => {
        Observer.videoChange(() => {
          Ajax.getJsonWithCredentials(`https://api.bilibili.com/x/web-interface/archive/has/like?aid=${unsafeWindow.aid}`).then(json => {
            liked = Boolean(json.data)
          })
        })
      })
      return (({ isWatchlater, isMediaList, event }) => {
        if (isWatchlater) {
          listenWatchlaterVideoChange()
          const formData = {
            aid: unsafeWindow.aid,
            /** `1`点赞; `2`取消赞 */
            like: liked ? 2 : 1,
            csrf: getCsrf(),
          }
          Ajax.postTextWithCredentials(`https://api.bilibili.com/x/web-interface/archive/like`, Object.entries(formData).map(([k, v]) => `${k}=${v}`).join('&')).then(() => {
            liked = !liked
            if (liked) {
              Toast.success(`已点赞`, `快捷键扩展`, 1000)
            } else {
              Toast.success(`已取消点赞`, `快捷键扩展`, 1000)
            }
          })
        } else if (isMediaList) {
          const likeButton = dq('.play-options-ul > li:first-child') as HTMLLIElement
          if (likeButton) {
            likeButton.click()
          }
        } else {
          const likeButton = dq('.video-toolbar .like') as HTMLSpanElement
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
        }
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
    longJumpBackward: () => {
      const video = dq('.bilibili-player-video video') as HTMLVideoElement
      video.currentTime -= settings.keymapJumpSeconds
    },
    longJumpForward: () => {
      const video = dq('.bilibili-player-video video') as HTMLVideoElement
      video.currentTime += settings.keymapJumpSeconds
    },
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
      controller.reset()
    }),
    takeScreenshot: clickElement('.video-take-screenshot'),
    previousFrame: clickElement('.prev-frame'),
    nextFrame: clickElement('.next-frame'),
    returnBegin: () => {
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
    mute: 'm',
    pictureInPicture: 'p',
    coin: 'c',
    favorite: 's',
    pause: 'space',
    like: 'l',
    playerMenu: '`',
    longJumpForward: 'j',
    longJumpBackward: 'shift j',
    watchlater: 'shift w',
    quickFavorite: 'shift s',
    danmaku: 'd',
    videoSpeedIncrease: 'shift > 》 arrowUp',
    videoSpeedDecrease: 'shift < 《 arrowDown',
    videoSpeedReset: 'shift ? ？',
    takeScreenshot: 'ctrl alt c',
    previousFrame: 'shift arrowLeft',
    nextFrame: 'shift arrowRight',
    returnBegin: '0'
  }
  const parseBindings = (bindings: { [action: string]: string }) => {
    return Object.entries(bindings).map(([actionName, keyString]) => {
      const keys = keyString.split(' ')
      return {
        keys,
        action: (actions as any)[actionName] || (() => {}),
      } as KeyBinding
    })
  }

  ;(async () => {
      const { loadKeyBindings } = await import('./key-bindings')
      config = loadKeyBindings(parseBindings(
        { ...defaultBindings, ...settings.customKeyBindings }
      ))
    })()
}

export default {
  reload: () => config && (config.enable = true),
  unload: () => config && (config.enable = false),
}
