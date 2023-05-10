export type PlayerMode = 'normal' | 'wide' | 'web' | 'full'

export const playerModeChange = (mode: PlayerMode) =>
  new CustomEvent('playerModeChange', {
    detail: { mode, bubbles: true, cancelable: true },
  })
