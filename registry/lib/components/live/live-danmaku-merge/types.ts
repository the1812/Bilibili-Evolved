export const DEFAULT_DURATION_MS = 12000

export const ROLL_DANMAKU_SELECTOR = '.bili-danmaku-x-dm, .bili-dm, .danmaku-item'
export const DANMAKU_CONTAINER_SELECTOR = '.danmaku-item-container'
export const INFLATED_IMG_SELECTOR = 'img:not(.fans-medal-item):not(.guard-icon):not(.admin-icon)'

export const SUBDOC_STYLE_ID = 'bili-danmaku-merge-style'
export const ACTIVE_INSTANCE_ATTR = 'data-be-dm-merge-active'
export const TAKEOVER_EVENT = 'be-live-danmaku-merge:takeover'

export const SYMBOL_SCALE_VAR = '--bili-dm-symbol-scale'
export const NUM_SCALE_VAR = '--bili-dm-num-scale'
export const SELF_BORDER_COLOR_VAR = '--bili-dm-self-border-color'
export const DM_SCALE_VAR = '--bili-dm-scale'
export const IMG_BASE_W_VAR = '--bili-dm-img-base-w'
export const IMG_BASE_H_VAR = '--bili-dm-img-base-h'

export const BADGE_CLASS = 'bili-dm-badge'
export const BADGE_HIDDEN_CLASS = 'bili-dm-badge-hidden'
export const BADGE_SYMBOL_HIDDEN_CLASS = 'bili-dm-badge-symbol-hidden'
export const BADGE_NUM_HIDDEN_CLASS = 'bili-dm-badge-num-hidden'
export const MERGED_HIDDEN_CLASS = 'bili-dm-merged-hidden'
export const SELF_MERGED_CLASS = 'bili-dm-self-merged'
export const INFLATED_CLASS = 'bili-dm-inflated'
export const IMG_W_SCALED_CLASS = 'bili-dm-img-w-scaled'
export const IMG_H_SCALED_CLASS = 'bili-dm-img-h-scaled'

export const DanmakuRole = {
  LEADER: 'LEADER',
  FOLLOWER: 'FOLLOWER',
} as const

export type DanmakuRoleType = (typeof DanmakuRole)[keyof typeof DanmakuRole]

export interface DanmakuNodeState {
  role: DanmakuRoleType
  normKey: string
  rawText: string
  birthTime: number
  durationMs: number
  originalFontSize: string | null
  appliedFontSize: string | null
  originalCssVarFontSize: string | null
  appliedCssVarFontSize: string | null
  originalTranslateX: string | null
  appliedTranslateX: string | null
  translateCompensated: boolean
  hasSelfBorder: boolean
  selfBorderInherited: boolean
  resetAbort: AbortController
  detachRootAbort?: () => void
}

export interface ActiveLeaderItem {
  el: HTMLElement
  count: number
  birthTime: number
  durationMs: number
  maxMergeAgeMs: number
  rawText: string
  baseFontSize: number
}

export interface DocInstance {
  targetDoc: Document
  activeDanmakus: Map<string, ActiveLeaderItem>
  syncBadges: () => void
  cleanup: () => void
}
