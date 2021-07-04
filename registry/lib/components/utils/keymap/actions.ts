import { getComponentSettings } from '@/core/settings'
import { raiseEvent } from '@/core/utils'
import { registerAndGetData } from '@/plugins/data'
import { KeyBindingAction, KeyBindingActionContext } from './bindings'

export const clickElement = (target: string | HTMLElement) => (
  ({ event }: KeyBindingActionContext) => {
    const mouseEvent = new MouseEvent('click', {
      ..._.pick(event, 'ctrlKey', 'shiftKey', 'altKey', 'metaKey'),
    })
    if (typeof target === 'string') {
      (dq(target) as HTMLElement)?.dispatchEvent(mouseEvent)
    } else {
      target.dispatchEvent(mouseEvent)
    }
  }
)
export const changeVideoTime = (delta: number | (() => number)) => () => {
  const video = dq('.bilibili-player-video video') as HTMLVideoElement
  const deltaNumber = typeof delta === 'function' ? delta() : delta
  console.log(`[keymap] requested video time change, delta = ${delta}`)
  if (!video) {
    console.log('[keymap] video element not found')
    return
  }
  if (!unsafeWindow.player) {
    // fallback
    console.log('[keymap] fallback')
    video.currentTime += deltaNumber
  }
  console.log('[keymap] player API seek')
  unsafeWindow.player.seek(video.currentTime + deltaNumber, video.paused)
}
/** 提示框用的`setTimeout`句柄 */
let tipTimeoutHandle: number
/**
 * 显示提示框
 * @param text 文字 (可以 HTML)
 * @param icon MDI 图标 class
 */
export const showTip = (text: string, icon: string) => {
  let tip = dq('.keymap-tip') as HTMLDivElement
  if (!tip) {
    const player = dq('.bilibili-player-video-wrap')
    if (!player) {
      return
    }
    player.insertAdjacentHTML('afterbegin', /* html */`
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
export const builtInActions: Record<string, KeyBindingAction> = {
  fullscreen: {
    displayName: '全屏',
    run: clickElement('.bilibili-player-video-btn-fullscreen'),
  },
  webFullscreen: {
    displayName: '网页全屏',
    run: clickElement('.bilibili-player-video-web-fullscreen'),
  },
  wideScreen: {
    displayName: '宽屏',
    run: clickElement('.bilibili-player-video-btn-widescreen'),
  },
  volumeUp: {
    displayName: '增加音量',
    run: () => {
      const current = unsafeWindow.player.volume()
      unsafeWindow.player.volume(current + 0.1)
      showTip(`${Math.round(unsafeWindow.player.volume() * 100)}%`, 'mdi-volume-high')
    },
  },
  volumeDown: {
    displayName: '降低音量',
    run: () => {
      const current = unsafeWindow.player.volume()
      unsafeWindow.player.volume(current - 0.1)
      const after = Math.round(unsafeWindow.player.volume() * 100)
      if (after === 0) {
        showTip('静音', 'mdi-volume-off')
      } else {
        showTip(`${after}%`, 'mdi-volume-high')
      }
    },
  },
  mute: {
    displayName: '静音',
    run: context => {
      clickElement('.bilibili-player-video-btn-volume .bilibili-player-iconfont-volume')(context)
      const isMute = unsafeWindow.player.isMute()
      if (isMute) {
        showTip('已静音', 'mdi-volume-off')
      } else {
        showTip('已取消静音', 'mdi-volume-high')
      }
    },
  },
  pictureInPicture: {
    displayName: '画中画',
    run: clickElement('.bilibili-player-video-btn-pip'),
  },
  coin: {
    displayName: '投币',
    run: clickElement('.video-toolbar .coin,.tool-bar .coin-info, .video-toolbar-module .coin-box, .play-options-ul > li:nth-child(2)'),
  },
  favorite: {
    displayName: '收藏',
    run: clickElement('.video-toolbar .collect, .video-toolbar-module .fav-box, .play-options-ul > li:nth-child(3)'),
  },
  pause: {
    displayName: '暂停/播放',
    run: clickElement('.bilibili-player-video-btn-start'),
  },
  like: {
    displayName: '点赞',
    run: (() => {
      /** 长按`L`三连使用的记忆变量 */
      let likeClick = true
      return ((context: KeyBindingActionContext) => {
        const { event } = context
        const likeButton = dq('.video-toolbar .like, .tool-bar .like-info') as HTMLSpanElement
        event.preventDefault()
        const fireEvent = (name: string, args: Event) => {
          const customEvent = new CustomEvent(name, args)
          likeButton.dispatchEvent(customEvent)
        }
        likeClick = true
        setTimeout(() => (likeClick = false), 200)
        fireEvent('mousedown', event)
        document.body.addEventListener('keyup', e => {
          e.preventDefault()
          fireEvent('mouseup', e)
          if (likeClick) {
            fireEvent('click', e)
          }
        }, { once: true })
      })
    })(),
  },
  danmaku: {
    displayName: '弹幕开关',
    run: () => {
      const checkbox = dq('.bilibili-player-video-danmaku-switch input') as HTMLInputElement
      if (!checkbox) {
        return
      }
      checkbox.checked = !checkbox.checked
      raiseEvent(checkbox, 'change')
    },
  },
  longJumpBackward: {
    displayName: '长倒退',
    run: changeVideoTime(
      () => -(getComponentSettings('keymap').options.longJumpSeconds),
    ),
  },
  longJumpForward: {
    displayName: '长前进',
    run: changeVideoTime(
      () => getComponentSettings('keymap').options.longJumpSeconds,
    ),
  },
  jumpBackward: {
    displayName: '倒退',
    run: changeVideoTime(-5),
  },
  jumpForward: {
    displayName: '前进',
    run: changeVideoTime(5),
  },
  playerMenu: {
    displayName: '播放器菜单',
    run: () => {
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
        clientY: rect.y + rect.height / 2 - 194 / 2,
      }))
    },
  },
  seekBegin: {
    displayName: '回开头',
    run: () => {
      if (!unsafeWindow.player) {
        return
      }
      unsafeWindow.player.play()
      setTimeout(() => {
        unsafeWindow.player.seek(0)
        const toastText = dq('.bilibili-player-video-toast-bottom .bilibili-player-video-toast-item:first-child .bilibili-player-video-toast-item-text span:nth-child(2)')
        if (toastText) {
          toastText.textContent = ' 00:00'
        }
      })
    },
  },
}
export const [actions] = registerAndGetData('keymap.actions', builtInActions)
