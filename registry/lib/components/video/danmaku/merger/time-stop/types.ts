export type TimeStopStatus = 'idle' | 'active'

export interface PinnedDanmakuRef {
  dmid: string
  el: HTMLElement
  /** 钉住前的 inline style 备份，discard/release 时还原 */
  prevStyle: {
    transform: string
    left: string
    top: string
    animationPlayState: string
  }
}

export interface TimeStopIdleState {
  status: 'idle'
}

export interface TimeStopActiveState {
  status: 'active'
  sourceId: string
  /** 进入时停时的播放进度（秒） */
  t0: number
  pinned: PinnedDanmakuRef[]
  /** 可选：实时显示用 */
  deltaHintEl?: HTMLElement | null
}

export type TimeStopState = TimeStopIdleState | TimeStopActiveState

export interface TimeStopDeps {
  /** 返回当前播放进度秒 */
  getCurrentTime: () => number
  /** 源是否存在 */
  hasSource: (sourceId: string) => boolean
  /** 累加并应用 offset；内部应 updateSource + rebuild/sync */
  applyOffsetDelta: (sourceId: string, deltaSeconds: number) => void | Promise<void>
  /** 轻提示 */
  toast: (message: string, level?: 'info' | 'success' | 'error' | 'warn') => void
}
