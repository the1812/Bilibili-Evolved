export type KeyBindingAction = (context: {
  binding: KeyBinding
  event: KeyboardEvent
  isWatchlater: boolean
  isMediaList: boolean
}) => void
export interface KeyBinding {
  keys: string[]
  action: KeyBindingAction
  prevent?: boolean
}
const modifyKeys = [
  'shift',
  'alt',
  'ctrl',
  'meta',
]
export const loadKeyBindings = _.once((bindings: KeyBinding[]) => {
  const isWatchlater = document.URL.startsWith('https://www.bilibili.com/watchlater/')
  const isMediaList = document.URL.startsWith('https://www.bilibili.com/medialist/play/')
  const config = {
    enable: true
  }
  document.body.addEventListener('keydown', (e: KeyboardEvent & { [key: string]: boolean }) => {
    if (!config.enable) {
      return
    }
    // 稍后再看页面无视快捷键
    if (isWatchlater && document.URL.endsWith('list')) {
      return
    }
    // 打字时无视快捷键
    if (document.activeElement && isTyping()) {
      return
    }
    const key = e.key.toLowerCase()

    // 全景视频禁用 WASD 快捷键
    const panoramaControl = dq('.bilibili-player-sphere-control') as HTMLElement
    if (panoramaControl !== null && panoramaControl.style.display !== 'none' && ['w', 'a', 's', 'd'].includes(key)) {
      return
    }

    bindings.forEach(binding => {
      if (binding.keys.length === 0) {
        return
      }
      const modifyKeyNotMatch = modifyKeys.some(m => {
        const needModifyKey = binding.keys.includes(m)
        const isModifyKeyPressed = e[m + 'Key']
        return needModifyKey !== isModifyKeyPressed
      })
      if (modifyKeyNotMatch) {
        return
      }
      const restKeys = binding.keys.filter(k => !modifyKeys.includes(k.toLowerCase())).map(k => k.toLowerCase())
      const keyMatch = restKeys.includes(e.key.toLowerCase()) || restKeys.includes(e.code.toLowerCase())
      if (!keyMatch) {
        return
      }

      if (binding?.prevent ?? true) {
        e.stopPropagation()
        e.preventDefault()
      }
      binding.action({
        binding,
        isWatchlater,
        isMediaList,
        event: e,
      })
    })
  })
  return config
})
