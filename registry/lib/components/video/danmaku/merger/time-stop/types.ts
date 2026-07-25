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
  /**
   * 从弹幕节点反查合并源 ID。
   * bpx 画面层通常不挂 data-dmid，需用文案/运行时对象回落识别。
   */
  resolveSourceIdFromElement: (el: Element) => string | null
  /** 判断画面弹幕节点是否属于指定合并源（用于钉住/隐藏） */
  isElementOfSource: (sourceId: string, el: HTMLElement) => boolean
  /** 累加并应用 offset；内部应 updateSource + rebuild/sync */
  applyOffsetDelta: (sourceId: string, deltaSeconds: number) => void | Promise<void>
  /** 轻提示 */
  toast: (message: string, level?: 'info' | 'success' | 'error' | 'warn') => void
}
