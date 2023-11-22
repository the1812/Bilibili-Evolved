import { registerAndGetData } from '@/plugins/data'

export const presetBase: Record<string, string> = {
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
  jumpBackward: '',
  jumpForward: '',
  danmaku: 'd',
  seekBegin: '0',
  sendComment: 'ctrl enter',
}
export const builtInPresets: Record<string, Record<string, string>> = {
  Default: {},
  YouTube: {
    like: '',
    pause: 'space k',
    longJumpForward: 'l',
    longJumpBackward: 'j',
    seekBegin: '0 Home',
  },
  HTML5Player: {
    coin: 'shift c',
    danmaku: 'shift d',
    fullscreen: 'enter',
    webFullscreen: 'shift enter',
    pictureInPicture: 'shift p',
    longJumpBackward: 'ctrl arrowLeft',
    longJumpForward: 'ctrl arrowRight',
  },
  PotPlayer: {
    coin: 'shift c',
    danmaku: 'shift d',
    fullscreen: 'enter',
    webFullscreen: '6',
    longJumpBackward: 'ctrl arrowLeft',
    longJumpForward: 'ctrl arrowRight',
    seekBegin: 'backspace',
  },
}
export const [, presets] = registerAndGetData('keymap.presets', presetBase, builtInPresets)
