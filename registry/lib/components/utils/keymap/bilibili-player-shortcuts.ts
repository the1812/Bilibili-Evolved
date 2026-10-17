import { playerAgent } from '@/components/video/player-agent'
import { isTyping } from '@/core/utils'
import { matchCurrentPage, playerUrls } from '@/core/utils/urls'

export const bilibiliPlayerShortcuts = [
  { id: 'ArrowLeft', displayName: '后退 5 秒', keyDisplayName: '←' },
  { id: 'Numpad4', displayName: '后退 5 秒', keyDisplayName: 'Num 4' },
  { id: 'ArrowRight', displayName: '前进 5 秒 / 长按倍速播放', keyDisplayName: '→' },
  { id: 'Numpad6', displayName: '前进 5 秒 / 长按倍速播放', keyDisplayName: 'Num 6' },
  { id: 'Space', displayName: '播放 / 暂停', keyDisplayName: 'Space' },
  { id: 'KeyF', displayName: '全屏', keyDisplayName: 'F' },
  { id: 'BracketLeft', displayName: '上一集 / 上一 P', keyDisplayName: '[' },
  { id: 'BracketRight', displayName: '下一集 / 下一 P', keyDisplayName: ']' },
  { id: 'KeyD', displayName: '弹幕开关', keyDisplayName: 'D' },
  { id: 'KeyM', displayName: '静音', keyDisplayName: 'M' },
  { id: 'KeyQ', displayName: '点赞 / 长按一键三连', keyDisplayName: 'Q' },
  { id: 'KeyW', displayName: '投币', keyDisplayName: 'W' },
  { id: 'KeyE', displayName: '收藏', keyDisplayName: 'E' },
  { id: 'KeyR', displayName: '长按一键三连', keyDisplayName: 'R' },
  { id: 'Digit1', displayName: '选择弹幕投票选项 1', keyDisplayName: '1' },
  { id: 'Digit2', displayName: '选择弹幕投票选项 2', keyDisplayName: '2' },
  { id: 'Digit3', displayName: '选择弹幕投票选项 3', keyDisplayName: '3' },
  { id: 'Digit4', displayName: '选择弹幕投票选项 4', keyDisplayName: '4' },
  { id: 'KeyG', displayName: '关注 UP 主', keyDisplayName: 'G' },
  { id: 'ArrowUp', displayName: '增加音量', keyDisplayName: '↑' },
  { id: 'Numpad8', displayName: '增加音量', keyDisplayName: 'Num 8' },
  { id: 'ArrowDown', displayName: '降低音量', keyDisplayName: '↓' },
  { id: 'Numpad2', displayName: '降低音量', keyDisplayName: 'Num 2' },
  { id: 'Enter', displayName: '聚焦 / 取消聚焦弹幕输入框', keyDisplayName: 'Enter' },
  {
    id: 'NumpadEnter',
    displayName: '聚焦 / 取消聚焦弹幕输入框',
    keyDisplayName: 'Num Enter',
  },
  { id: 'Shift+Digit1', displayName: '切换至 1.0× 播放', keyDisplayName: 'Shift + 1' },
  {
    id: 'Shift+Numpad1',
    displayName: '切换至 1.0× 播放',
    keyDisplayName: 'Shift + Num 1',
  },
  { id: 'Shift+Digit2', displayName: '切换至 2.0× 播放', keyDisplayName: 'Shift + 2' },
  {
    id: 'Shift+Numpad2',
    displayName: '切换至 2.0× 播放',
    keyDisplayName: 'Shift + Num 2',
  },
] as const

const nativeGlobalShortcuts = new Set([
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
const nativeShiftShortcuts = new Set([
  'Shift+Digit1',
  'Shift+Numpad1',
  'Shift+Digit2',
  'Shift+Numpad2',
])

export const shouldBlockBilibiliPlayerShortcut = (
  event: KeyboardEvent,
  blockedShortcuts: ReadonlySet<string>,
) => {
  const { shiftKey, altKey, ctrlKey, metaKey, code } = event
  let shortcutId = code
  let requiresPlayerFocus = false
  if (shiftKey && !altKey && !ctrlKey && !metaKey) {
    shortcutId = `Shift+${code}`
    if (!nativeShiftShortcuts.has(shortcutId)) {
      return false
    }
  } else if (shiftKey || altKey || ctrlKey || metaKey) {
    return false
  } else if (nativeFocusedShortcuts.has(code)) {
    requiresPlayerFocus = true
  } else if (!nativeGlobalShortcuts.has(code)) {
    return false
  }
  if (!blockedShortcuts.has(shortcutId)) {
    return false
  }
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
  return !requiresPlayerFocus || player.matches(':hover, :focus-within')
}
