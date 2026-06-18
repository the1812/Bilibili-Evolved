/**
 * 弹幕合并器 UI 契约
 *
 * Vue 组件仅依赖本文件与 `shared/`、`notify.ts`、`merger.scss`，
 * 禁止 import `runtime/` 或 `danmaku/inject`。
 */

// ── §5.2 核心类型 ──────────────────────────────────────────────

/** Toast 级别，与 `ui/notify.ts` 的 `mergerToast` 对齐 */
export type MergerToastLevel = 'info' | 'success' | 'warn' | 'error'

/** 已合并弹幕源摘要（管理弹窗 / 角标展示） */
export interface MergerSourceSummary {
  bvid: string
  title: string
  count: number
  pages?: number
}

/**
 * 搜索结果卡片数据（与 `SearchVideoItem` 字段一致，供 Vue 层使用）
 * @see SearchVideoItem
 */
export interface MergerSearchVideo {
  bvid: string
  title: string
  pic: string
  author: string
  duration?: number | string
  play?: number
  video_review?: number
}

/**
 * runtime 提供给 Vue 弹窗 / 角标的宿主 API。
 *
 * 由 `ui/vue-host.ts` 实现并通过闭包注入。Vue 组件不得自行实现搜索、合并、存储逻辑。
 */
export interface MergerUiHost {
  /** 打开搜索合并弹窗 */
  openSearchModal(): void
  /** 打开已合并源管理弹窗 */
  openManagerModal(): void
  /** 打开指定 BV 的弹幕预览弹窗 */
  openPreviewModal(bvid: string): void
  /** 按 BV 聚合的已合并源列表（管理弹窗数据源） */
  getSourceSummaries(): MergerSourceSummary[]
  /** 当前页已合并弹幕总条数（角标） */
  getTotalMergedCount(): number
}

// ── api/types 再导出（避免 Vue 层重复定义）──────────────────────

export type { SearchVideoItem, ViewResult, ViewPageItem, PageItem } from '../api/types'

// ── 分 P UI 模型 ───────────────────────────────────────────────

/**
 * 顺延方向：`1` = 推迟，`−1` = 提前（与 runtime `.dm-offset-type` option value 一致）
 */
export type MergerOffsetType = 1 | -1

/** 弹幕预览列表行 */
export interface MergerPreviewItem {
  time: number
  text: string
}

/** 管理弹窗分 P 行 */
export interface MergerManagerSourceItem extends MergerSourceSummary {
  id: string
  offset?: number
}

/** 管理弹窗按 BV 聚合的分组 */
export interface MergerManagerGroup {
  groupKey: string
  bvid: string
  title: string
  cover: string
  author: string
  items: MergerManagerSourceItem[]
}

/** 分 P 列表行（`PagePartList.vue` / 搜索弹窗内联分 P 区） */
export interface MergerPagePart {
  cid: number
  page: number
  part: string
  /** B 站分 P 片长（秒），仅供展示对照 */
  duration?: number
  /** 是否勾选参与批量合并 */
  selected?: boolean
  /** 合并时时间轴偏移（秒，正负由 offsetType 决定） */
  offset?: number
  /** 偏移方向，默认 `1`（推迟） */
  offsetType?: MergerOffsetType
}

/** 分 P 列表行扩展字段（`PagePartList.vue`） */
export interface PagePartListRow extends MergerPagePart {
  offsetPreview?: string
  partDurationText?: string
  danmakuCount?: number
  danmakuError?: boolean
}

/** 批量合并单条任务（`MergerModal` emit `batch-merge` 载荷元素） */
export interface MergerBatchMergeItem {
  bvid: string
  title: string
  pic?: string
  author?: string
  groupTitle?: string
  cid?: number | string
  offset?: number
  /** 为 true 时表示仅勾选整 BV、需 runtime 拉取 view / pagelist */
  fetchRequired?: boolean
}

// ── Vue emit 事件名常量（Wave 2 统一引用，避免字符串漂移）──────

/** `MergerButton.vue` */
export const MERGER_BUTTON_EVENTS = {
  OPEN: 'open',
} as const

/** `MergerModal.vue`（搜索合并弹窗） */
export const MERGER_MODAL_EVENTS = {
  SEARCH: 'search',
  LOAD_MORE: 'load-more',
  BATCH_MERGE: 'batch-merge',
  CLOSE: 'close',
  SELECTION_CHANGE: 'selection-change',
  /** 展开某 BV 的分 P 列表（runtime 负责拉取 view / pagelist） */
  EXPAND_VIDEO: 'expand-video',
  /** 收起分 P 列表 */
  COLLAPSE_VIDEO: 'collapse-video',
} as const

/** `ManagerModal.vue`（已合并源管理） */
export const MANAGER_MODAL_EVENTS = {
  CLOSE: 'close',
  SELECTION_CHANGE: 'selection-change',
  SELECT_ALL: 'select-all',
  BATCH_DELETE: 'batch-delete',
  CLEAR_ALL: 'clear-all',
  ADD_MORE: 'add-more',
  TOGGLE_GROUP: 'toggle-group',
  UPDATE_OFFSET: 'update-offset',
  REMOVE_SOURCE: 'remove-source',
  PREVIEW_SOURCE: 'preview-source',
} as const

/** `PreviewModal.vue`（弹幕预览） */
export const PREVIEW_MODAL_EVENTS = {
  CLOSE: 'close',
  SORT_TOGGLE: 'sort-toggle',
  LOAD_MORE: 'load-more',
} as const

/** `MergerCountBadge.vue`（播放器角标） */
export const MERGER_COUNT_BADGE_EVENTS = {
  OPEN: 'open',
} as const

/** `PagePartList.vue`（共享分 P 列表，纯展示 + emit） */
export const PAGE_PART_LIST_EVENTS = {
  SELECTION_CHANGE: 'selection-change',
  OFFSET_CHANGE: 'offset-change',
  PART_MODE_TOGGLE: 'part-mode-toggle',
  CALCULATE_OFFSETS: 'calculate-offsets',
  SELECT_ALL_PARTS: 'select-all-parts',
  DURATION_CHANGE: 'duration-change',
} as const

/** `QuickMergeButton.vue`（推荐位快合，Phase 2b） */
export const QUICK_MERGE_BUTTON_EVENTS = {
  TOGGLE_MERGE: 'toggle-merge',
} as const

/** `VideoResultCard.vue`（搜索结果行） */
export const VIDEO_RESULT_CARD_EVENTS = {
  TOGGLE: 'toggle',
  EXPAND: 'expand',
} as const

/** `ModalShell.vue`（弹窗壳） */
export const MODAL_SHELL_EVENTS = {
  CLOSE: 'close',
} as const

// ── emit 载荷类型（供 `$emit` 与 runtime 监听器对齐）────────────

export interface MergerModalEventPayloads {
  [MERGER_MODAL_EVENTS.SEARCH]: { keyword: string; page?: number }
  [MERGER_MODAL_EVENTS.LOAD_MORE]: { keyword: string; page: number }
  [MERGER_MODAL_EVENTS.BATCH_MERGE]: { items: MergerBatchMergeItem[] }
  [MERGER_MODAL_EVENTS.CLOSE]: void
  [MERGER_MODAL_EVENTS.SELECTION_CHANGE]: { selectedBvids: string[] }
  [MERGER_MODAL_EVENTS.EXPAND_VIDEO]: { bvid: string }
  [MERGER_MODAL_EVENTS.COLLAPSE_VIDEO]: { bvid: string }
}

export interface ManagerModalEventPayloads {
  [MANAGER_MODAL_EVENTS.CLOSE]: void
  [MANAGER_MODAL_EVENTS.SELECTION_CHANGE]: { selectedIds: string[] }
  [MANAGER_MODAL_EVENTS.SELECT_ALL]: { select: boolean }
  [MANAGER_MODAL_EVENTS.BATCH_DELETE]: { ids: string[] }
  [MANAGER_MODAL_EVENTS.CLEAR_ALL]: void
  [MANAGER_MODAL_EVENTS.ADD_MORE]: void
  [MANAGER_MODAL_EVENTS.TOGGLE_GROUP]: { groupKey: string; expanded: boolean }
  [MANAGER_MODAL_EVENTS.UPDATE_OFFSET]: { sourceId: string; offset: number }
  [MANAGER_MODAL_EVENTS.REMOVE_SOURCE]: { sourceId: string }
  [MANAGER_MODAL_EVENTS.PREVIEW_SOURCE]: { sourceId: string }
}

export interface PreviewModalEventPayloads {
  [PREVIEW_MODAL_EVENTS.CLOSE]: void
  [PREVIEW_MODAL_EVENTS.SORT_TOGGLE]: { order: 1 | -1 }
  [PREVIEW_MODAL_EVENTS.LOAD_MORE]: void
}

export interface PagePartListEventPayloads {
  [PAGE_PART_LIST_EVENTS.SELECTION_CHANGE]: { bvid: string; parts: MergerPagePart[] }
  [PAGE_PART_LIST_EVENTS.OFFSET_CHANGE]: {
    bvid: string
    cid: number
    offset: number
    offsetType: MergerOffsetType
  }
  [PAGE_PART_LIST_EVENTS.PART_MODE_TOGGLE]: { bvid: string; enabled: boolean }
  [PAGE_PART_LIST_EVENTS.CALCULATE_OFFSETS]: { bvid: string; parts: MergerPagePart[] }
  [PAGE_PART_LIST_EVENTS.SELECT_ALL_PARTS]: { bvid: string; select: boolean }
  [PAGE_PART_LIST_EVENTS.DURATION_CHANGE]: { bvid: string; cid: number; durationText: string }
}

export interface QuickMergeButtonEventPayloads {
  [QUICK_MERGE_BUTTON_EVENTS.TOGGLE_MERGE]: { bvid: string }
}

export type MergerModalEventName = keyof MergerModalEventPayloads
export type ManagerModalEventName = keyof ManagerModalEventPayloads
export type PreviewModalEventName = keyof PreviewModalEventPayloads
export type PagePartListEventName = keyof PagePartListEventPayloads
export type QuickMergeButtonEventName = keyof QuickMergeButtonEventPayloads
