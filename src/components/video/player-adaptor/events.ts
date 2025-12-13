export enum PlayerMode {
  Normal = 'normal',
  WideScreen = 'wide',
  WebFullscreen = 'web',
  Fullscreen = 'full',
  Mini = 'mini',
}

export const createPlayerModeChangeEvent = (mode: PlayerMode) =>
  new CustomEvent('playerModeChange', {
    detail: { mode, bubbles: true, cancelable: true },
  })
