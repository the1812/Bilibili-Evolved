import { playerAgent } from '@/components/video/player-agent'
import { isTyping } from '@/core/utils'
import { matchCurrentPage, playerUrls } from '@/core/utils/urls'

const nativeGlobalShortcuts = new Set([
  'Escape',
  'ArrowLeft',
  'Numpad4',
  'ArrowRight',
  'Numpad6',
  'Space',
  'KeyF',
  'BracketLeft',
  'BracketRight',
  'KeyD',
  'KeyM',
  'KeyQ',
  'KeyW',
  'KeyE',
  'KeyR',
  'Digit1',
  'Digit2',
  'Digit3',
  'Digit4',
  'KeyG',
])
const nativeFocusedShortcuts = new Set([
  'ArrowUp',
  'Numpad8',
  'ArrowDown',
  'Numpad2',
  'Enter',
  'NumpadEnter',
])
const nativeShiftShortcuts = new Set(['Digit1', 'Numpad1', 'Digit2', 'Numpad2'])

export const shouldBlockBilibiliPlayerShortcut = (event: KeyboardEvent) => {
  if (!matchCurrentPage(playerUrls)) {
    return false
  }
  if (isTyping()) {
    return false
  }
  const player = playerAgent.query.bilibiliPlayer.sync()
  if (!player) {
    return false
  }
  const { shiftKey, altKey, ctrlKey, metaKey, code } = event
  if (shiftKey && !altKey && !ctrlKey && !metaKey) {
    return nativeShiftShortcuts.has(code)
  }
  if (shiftKey || altKey || ctrlKey || metaKey) {
    return false
  }
  if (nativeGlobalShortcuts.has(code)) {
    return true
  }
  return player.matches(':hover, :focus-within') && nativeFocusedShortcuts.has(code)
}
