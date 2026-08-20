import { getActiveElement, isTyping, matchUrlPattern } from '@/core/utils'
import { mediaListUrls, watchlaterUrls } from '@/core/utils/urls'
import { clickElement, changeVideoTime, showTip } from './actions'
import { shadowDomObserver } from '@/core/shadow-root'
import { shouldBlockBilibiliPlayerShortcut } from './bilibili-player-shortcuts'

export interface KeyBindingActionContext {
  binding: KeyBinding
  event: KeyEvent
  isWatchlater: boolean
  isMediaList: boolean
  clickElement: typeof clickElement
  changeVideoTime: typeof changeVideoTime
  showTip: typeof showTip
}
export interface KeyBindingAction {
  displayName: string
  run: (context: KeyBindingActionContext) => unknown
  prevent?: boolean
  /** 默认打字时忽略快捷键, 将此属性设置为 false 可以在打字时允许触发快捷键 */
  ignoreTyping?: boolean
  /** 默认聚焦在可聚焦元素时不忽略快捷键, 将此属性设置为 true 可以在聚焦时禁止触发快捷键 */
  ignoreFocus?: boolean
}
export interface KeyBinding {
  keys: string[]
  action: KeyBindingAction
}
export interface KeyReleaseEvent {
  sourceEvent: KeyboardEvent | MouseEvent | null
  cancelled: boolean
}
export interface KeyEvent {
  key: string
  code: string
  shiftKey: boolean
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  repeat: boolean
  sourceEvent: KeyboardEvent | MouseEvent
  onRelease: (listener: (event: KeyReleaseEvent) => void) => void
  preventDefault: () => void
  stopImmediatePropagation: () => void
}

const modifyKeys = ['shift', 'alt', 'ctrl', 'meta'] as const
const mouseButtonKeys: Record<number, string> = {
  1: 'mouseMiddle',
  3: 'mouseBack',
  4: 'mouseForward',
}
export const loadKeymap = lodash.once(() => {
  const isWatchlater = watchlaterUrls.some(url => matchUrlPattern(url))
  const isMediaList = mediaListUrls.some(url => matchUrlPattern(url))
  const keyReleaseListeners = new Map<string, ((event: KeyReleaseEvent) => void)[]>()
  const consumedMouseButtons = new Set<number>()
  const config = {
    enable: true,
    bindings: [] as KeyBinding[],
    disableBilibiliPlayerShortcuts: false,
  }

  const addKeyReleaseListener = (code: string, listener: (event: KeyReleaseEvent) => void) => {
    let listeners = keyReleaseListeners.get(code)
    if (!listeners) {
      listeners = []
      keyReleaseListeners.set(code, listeners)
    }
    listeners.push(listener)
  }
  const createKeyEvent = (
    sourceEvent: KeyboardEvent | MouseEvent,
    key: string,
    code: string,
    repeat: boolean,
  ): KeyEvent => ({
    key,
    code,
    ...lodash.pick(sourceEvent, 'shiftKey', 'altKey', 'ctrlKey', 'metaKey'),
    repeat,
    sourceEvent,
    onRelease: listener => addKeyReleaseListener(code, listener),
    preventDefault: () => sourceEvent.preventDefault(),
    stopImmediatePropagation: () => sourceEvent.stopImmediatePropagation(),
  })
  const handleKeyUp = (
    code: string,
    sourceEvent: KeyboardEvent | MouseEvent | null,
    cancelled = false,
  ) => {
    const listeners = keyReleaseListeners.get(code)
    if (!listeners) {
      return
    }
    keyReleaseListeners.delete(code)
    listeners.forEach(listener => listener({ sourceEvent, cancelled }))
  }
  const handleKeyDown = (e: KeyEvent) => {
    if (!config.enable) {
      return
    }
    config.bindings.forEach(binding => {
      if (binding.keys.length === 0) {
        return
      }

      const isTypingNow = isTyping()

      // 打字时无视快捷键
      if (binding.action.ignoreTyping !== false && isTypingNow) {
        return
      }

      // 忽略其他可聚焦元素
      const hasElementFocus = (() => {
        if (isTypingNow) {
          return true
        }
        const activeElement = getActiveElement()
        if (([document.body, null] as (Element | null)[]).includes(activeElement)) {
          return false
        }
        if (activeElement instanceof HTMLMediaElement) {
          return false
        }
        // 播放器内各种控制按钮的焦点
        if (
          activeElement instanceof HTMLDivElement &&
          activeElement.classList.contains('bpx-player-ctrl-btn')
        ) {
          return false
        }
        // 播放器内各种设置项按钮的焦点
        if (activeElement instanceof HTMLInputElement && activeElement.classList.contains('bui')) {
          return false
        }
        return true
      })()
      if (
        binding.action.ignoreFocus === false &&
        binding.action.ignoreTyping !== false &&
        hasElementFocus
      ) {
        return
      }

      const key = e.key.toLowerCase()

      // 全景视频禁用 WASD 快捷键
      const panoramaControl = dq('.bilibili-player-sphere-control') as HTMLElement
      if (
        panoramaControl !== null &&
        panoramaControl.style.display !== 'none' &&
        ['w', 'a', 's', 'd'].includes(key)
      ) {
        return
      }

      const modifyKeyNotMatch = modifyKeys.some(m => {
        const needModifyKey = binding.keys.includes(m)
        const optionalModifyKey = binding.keys.includes(`[${m}]`)
        if (optionalModifyKey) {
          return false
        }
        const isModifyKeyPressed = e[`${m}Key`]
        return needModifyKey !== isModifyKeyPressed
      })
      if (modifyKeyNotMatch) {
        return
      }
      const restKeys = binding.keys
        .filter(k => !modifyKeys.some(m => m === k.toLowerCase()))
        .map(k => k.toLowerCase())
      const keyMatch =
        restKeys.includes(e.key.toLowerCase()) || restKeys.includes(e.code.toLowerCase())
      if (!keyMatch) {
        return
      }

      const actionResult = binding.action.run({
        binding,
        isWatchlater,
        isMediaList,
        event: e,
        clickElement,
        changeVideoTime,
        showTip,
      })

      const actionSuccess = !lodash.isNil(actionResult)
      if (binding.action.prevent ?? actionSuccess) {
        e.stopImmediatePropagation()
        e.preventDefault()
      }
    })
  }

  const keyboardHandler = (event: KeyboardEvent) => {
    handleKeyDown(createKeyEvent(event, event.key, event.code, event.repeat))
    if (
      config.enable &&
      config.disableBilibiliPlayerShortcuts &&
      shouldBlockBilibiliPlayerShortcut(event)
    ) {
      event.stopImmediatePropagation()
      event.preventDefault()
    }
  }
  const keyboardUpHandler = (event: KeyboardEvent) => {
    handleKeyUp(event.code, event)
  }
  const mouseHandler = (event: MouseEvent) => {
    const key = mouseButtonKeys[event.button]
    if (!key) {
      return
    }
    handleKeyDown(createKeyEvent(event, key, key, false))
    if (!event.defaultPrevented) {
      return
    }
    consumedMouseButtons.add(event.button)
  }
  const mouseUpHandler = (event: MouseEvent) => {
    const key = mouseButtonKeys[event.button]
    if (!key) {
      return
    }
    handleKeyUp(key, event)
    if (!consumedMouseButtons.has(event.button)) {
      return
    }
    event.stopImmediatePropagation()
    event.preventDefault()
    window.setTimeout(() => consumedMouseButtons.delete(event.button))
  }
  const auxClickHandler = (event: MouseEvent) => {
    if (!consumedMouseButtons.delete(event.button)) {
      return
    }
    event.stopImmediatePropagation()
    event.preventDefault()
  }
  const blurHandler = () => {
    keyReleaseListeners.forEach((_, code) => handleKeyUp(code, null, true))
    consumedMouseButtons.clear()
  }

  document.body.addEventListener('keydown', keyboardHandler, { capture: true })
  document.body.addEventListener('keyup', keyboardUpHandler, { capture: true })
  document.body.addEventListener('mousedown', mouseHandler, { capture: true })
  document.body.addEventListener('mouseup', mouseUpHandler, { capture: true })
  document.body.addEventListener('auxclick', auxClickHandler, { capture: true })
  window.addEventListener('blur', blurHandler)
  shadowDomObserver.watchShadowDom({
    added: shadowDom => {
      shadowDom.shadowRoot.addEventListener('keydown', keyboardHandler, { capture: true })
      shadowDom.shadowRoot.addEventListener('keyup', keyboardUpHandler, { capture: true })
      shadowDom.shadowRoot.addEventListener('mousedown', mouseHandler, { capture: true })
      shadowDom.shadowRoot.addEventListener('mouseup', mouseUpHandler, { capture: true })
      shadowDom.shadowRoot.addEventListener('auxclick', auxClickHandler, { capture: true })
    },
  })
  return config
})
export type KeymapConfig = ReturnType<typeof loadKeymap>
