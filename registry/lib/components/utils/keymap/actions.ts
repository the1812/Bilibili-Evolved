import { playerAgent } from '@/components/video/player-agent'
import { getComponentSettings } from '@/core/settings'
import { raiseEvent } from '@/core/utils'
import { registerAndGetData } from '@/plugins/data'
import { KeyBindingAction, KeyBindingActionContext } from './bindings'

export const clickElement = async (
  target: string | HTMLElement | Promise<HTMLElement>,
  context: KeyBindingActionContext,
) => {
  const { event } = context
  const mouseEvent = new MouseEvent('click', {
    ...lodash.pick(event, 'ctrlKey', 'shiftKey', 'altKey', 'metaKey'),
  })
  if (typeof target === 'string') {
    const targetElement = dq(target) as HTMLElement
    if (!targetElement) {
      return false
    }
    targetElement.dispatchEvent(mouseEvent)
  } else {
    const element = await target
    element?.dispatchEvent(mouseEvent)
  }
  return true
}
export const useClickElement = (target: string | HTMLElement) => (
  (context: KeyBindingActionContext) => clickElement(target, context)
)
export const changeVideoTime = (delta: number | (() => number)) => () => (
  playerAgent.changeTime(typeof delta === 'number' ? delta : delta())
)
/** 提示框用的`setTimeout`句柄 */
let tipTimeoutHandle: number
/**
 * 显示提示框
 * @param text 文字 (可以 HTML)
 * @param icon MDI 图标 class
 */
export const showTip = async (text: string, icon: string) => {
  let tip = dq('.keymap-tip') as HTMLDivElement
  if (!tip) {
    const player = await playerAgent.query.playerArea() as HTMLElement
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
    run: () => playerAgent.fullscreen(),
  },
  webFullscreen: {
    displayName: '网页全屏',
    run: () => playerAgent.webFullscreen(),
  },
  wideScreen: {
    displayName: '宽屏',
    run: () => playerAgent.widescreen(),
  },
  volumeUp: {
    displayName: '增加音量',
    run: () => {
      const volume = await playerAgent.changeVolume(10)
      showTip(`${volume}%`, 'mdi-volume-high')

      if (!unsafeWindow.player) {
        return false
      }
      const current = unsafeWindow.player.volume()
      unsafeWindow.player.volume(current + 0.1)
      showTip(`${Math.round(unsafeWindow.player.volume() * 100)}%`, 'mdi-volume-high')
      return true
    },
  },
  volumeDown: {
    displayName: '降低音量',
    run: () => {
      if (!unsafeWindow.player) {
        return false
      }
      const current = unsafeWindow.player.volume()
      unsafeWindow.player.volume(current - 0.1)
      const after = Math.round(unsafeWindow.player.volume() * 100)
      if (after === 0) {
        showTip('静音', 'mdi-volume-off')
      } else {
        showTip(`${after}%`, 'mdi-volume-high')
      }
      return true
    },
  },
  mute: {
    displayName: '静音',
    run: context => {
      if (!unsafeWindow.player) {
        return false
      }
      clickElement('.bilibili-player-video-btn-volume .bilibili-player-iconfont-volume', context)
      const isMute = unsafeWindow.player.isMute()
      if (isMute) {
        showTip('已静音', 'mdi-volume-off')
      } else {
        showTip('已取消静音', 'mdi-volume-high')
      }
      return true
    },
  },
  pictureInPicture: {
    displayName: '画中画',
    run: useClickElement('.bilibili-player-video-btn-pip'),
  },
  coin: {
    displayName: '投币',
    run: useClickElement('.video-toolbar .coin,.tool-bar .coin-info, .video-toolbar-module .coin-box, .play-options-ul > li:nth-child(2)'),
  },
  favorite: {
    displayName: '收藏',
    run: useClickElement('.video-toolbar .collect, .video-toolbar-module .fav-box, .play-options-ul > li:nth-child(3)'),
  },
  pause: {
    displayName: '暂停/播放',
    run: useClickElement('.bilibili-player-video-btn-start'),
  },
  like: {
    displayName: '点赞',
    run: (() => {
      /** 长按`L`三连使用的记忆变量 */
      let likeClick = true
      return ((context: KeyBindingActionContext) => {
        const { event } = context
        const likeButton = dq('.video-toolbar .like, .tool-bar .like-info') as HTMLSpanElement
        if (!likeButton) {
          return false
        }
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
        return true
      })
    })(),
  },
  danmaku: {
    displayName: '弹幕开关',
    run: () => {
      const checkbox = dq('.bilibili-player-video-danmaku-switch input') as HTMLInputElement
      if (!checkbox) {
        return false
      }
      checkbox.checked = !checkbox.checked
      raiseEvent(checkbox, 'change')
      return true
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
        return false
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
      return true
    },
  },
  seekBegin: {
    displayName: '回开头',
    run: () => {
      if (!unsafeWindow.player) {
        return false
      }
      unsafeWindow.player.play()
      setTimeout(() => {
        unsafeWindow.player.seek(0)
        const toastText = dq('.bilibili-player-video-toast-bottom .bilibili-player-video-toast-item:first-child .bilibili-player-video-toast-item-text span:nth-child(2)')
        if (toastText) {
          toastText.textContent = ' 00:00'
        }
      })
      return true
    },
  },
}
export const [actions] = registerAndGetData('keymap.actions', builtInActions)
