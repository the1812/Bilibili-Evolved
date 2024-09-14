import { isTyping, matchUrlPattern } from '@/core/utils'
import { mediaListUrls, watchlaterUrls } from '@/core/utils/urls'
import { clickElement, changeVideoTime, showTip } from './actions'
import { shadowDomObserver } from '@/core/shadow-root'

export interface KeyBindingActionContext {
  binding: KeyBinding
  event: KeyboardEvent
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
  ignoreTyping?: boolean
}
export interface KeyBinding {
  keys: string[]
  action: KeyBindingAction
}
const modifyKeys = ['shift', 'alt', 'ctrl', 'meta']
export const loadKeyBindings = lodash.once((bindings: KeyBinding[]) => {
  const isWatchlater = watchlaterUrls.some(url => matchUrlPattern(url))
  const isMediaList = mediaListUrls.some(url => matchUrlPattern(url))
  const config = {
    enable: true,
    bindings,
  }
  const keyboardHandler = (e: KeyboardEvent & { [key: string]: boolean }) => {
    if (!config.enable) {
      return
    }
    config.bindings.forEach(binding => {
      if (binding.keys.length === 0) {
        return
      }

      // 打字时无视快捷键
      if (binding.action.ignoreTyping !== false && isTyping()) {
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
        .filter(k => !modifyKeys.includes(k.toLowerCase()))
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
  document.body.addEventListener('keydown', keyboardHandler, { capture: true })
  shadowDomObserver.watchShadowDom({
    added: shadowDom =>
      shadowDom.shadowRoot.addEventListener('keydown', keyboardHandler, { capture: true }),
  })
  return config
})
export type KeyBindingConfig = ReturnType<typeof loadKeyBindings>
