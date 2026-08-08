import { defineComponentMetadata } from '@/components/define'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import {
  CommentArea,
  CommentItem,
  CommentReplyItem,
  forEachCommentArea,
  forEachCommentItem,
} from '@/components/utils/comment-apis'
import { CommentSortMode, SortCommentsOptions, sortCommentsOptions } from './options'

// ============ 辅助函数 ============

const getUserLevel = (item: CommentReplyItem): number => {
  const props = item.frameworkSpecificProps
  if (!props) return 0
  if (props.member?.level_info?.current_level !== undefined) {
    return props.member.level_info.current_level
  }
  return 0
}

const getTime = (item: CommentReplyItem): number => item.time ?? 0

type CompareFn = (a: CommentItem, b: CommentItem) => number

const compareFns: Record<CommentSortMode, CompareFn> = {
  [CommentSortMode.Default]: (a, b) => {
    const idA = parseInt(a.id, 10)
    const idB = parseInt(b.id, 10)
    if (!Number.isNaN(idA) && !Number.isNaN(idB)) return idA - idB
    return 0
  },
  [CommentSortMode.LikesDescending]: (a, b) => b.likes - a.likes || parseInt(a.id) - parseInt(b.id),
  [CommentSortMode.LikesAscending]: (a, b) => a.likes - b.likes || parseInt(a.id) - parseInt(b.id),
  [CommentSortMode.TimeDescending]: (a, b) => getTime(b) - getTime(a) || parseInt(a.id) - parseInt(b.id),
  [CommentSortMode.TimeAscending]: (a, b) => getTime(a) - getTime(b) || parseInt(a.id) - parseInt(b.id),
  [CommentSortMode.LevelDescending]: (a, b) => getUserLevel(b) - getUserLevel(a) || parseInt(a.id) - parseInt(b.id),
  [CommentSortMode.LevelAscending]: (a, b) => getUserLevel(a) - getUserLevel(b) || parseInt(a.id) - parseInt(b.id),
}

// ============ CSS order 排序（避免 DOM 移动导致 Lit 重渲染闪烁） ============

const FLEX_CONTAINER_STYLE_ID = 'sort-comments-flex-container'

const ensureFlexContainer = (area: CommentArea) => {
  if (area.items.length === 0) return null
  const parent = area.items[0].element.parentElement
  if (!parent) return null

  if (!parent.dataset.sortCommentsFlex) {
    parent.dataset.sortCommentsFlex = '1'
    parent.style.display = 'flex'
    parent.style.flexDirection = 'column'
  }
  return parent
}

const applySortByCssOrder = (area: CommentArea, mode: CommentSortMode) => {
  if (area.items.length === 0) return
  const parent = ensureFlexContainer(area)
  if (!parent) return

  const compareFn = compareFns[mode]
  area.items.forEach(item => {
    item.element.style.order = ''
  })

  if (mode === CommentSortMode.Default) return

  const sorted = [...area.items].sort(compareFn)
  sorted.forEach((item, index) => {
    item.element.style.order = String(index)
  })
}

// ============ 悬浮面板 ============

const PANEL_ID = 'sort-comments-panel'
const MODE_LABELS: Record<CommentSortMode, string> = {
  [CommentSortMode.Default]: '默认',
  [CommentSortMode.LikesDescending]: '👍高',
  [CommentSortMode.LikesAscending]: '👍低',
  [CommentSortMode.TimeDescending]: '🕐新',
  [CommentSortMode.TimeAscending]: '🕐旧',
  [CommentSortMode.LevelDescending]: '⭐高',
  [CommentSortMode.LevelAscending]: '⭐低',
}

const MODE_CYCLE: CommentSortMode[] = [
  CommentSortMode.Default,
  CommentSortMode.LikesDescending,
  CommentSortMode.TimeDescending,
  CommentSortMode.LevelDescending,
]

let currentMode = CommentSortMode.Default
let autoSort = true
let panelVisible = true

const createPanel = () => {
  if (document.getElementById(PANEL_ID)) return

  const panel = document.createElement('div')
  panel.id = PANEL_ID
  panel.innerHTML = `
    <style>
      #${PANEL_ID} {
        position: fixed;
        bottom: 120px;
        right: 20px;
        z-index: 99999;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        border-radius: 12px;
        padding: 8px 10px;
        color: #fff;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 140px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        transition: opacity 0.2s, transform 0.2s;
        user-select: none;
        -webkit-user-select: none;
      }
      #${PANEL_ID}.hidden {
        opacity: 0;
        transform: translateX(20px);
        pointer-events: none;
      }
      #${PANEL_ID} .panel-header {
        font-weight: 600;
        font-size: 12px;
        opacity: 0.7;
        text-align: center;
        letter-spacing: 1px;
      }
      #${PANEL_ID} .panel-btn {
        background: rgba(255,255,255,0.1);
        border: none;
        border-radius: 6px;
        color: #fff;
        padding: 6px 8px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.15s;
        text-align: center;
        white-space: nowrap;
      }
      #${PANEL_ID} .panel-btn:hover {
        background: rgba(255,255,255,0.25);
      }
      #${PANEL_ID} .panel-btn.active {
        background: rgba(0, 161, 214, 0.5);
      }
      #${PANEL_ID} .panel-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        font-size: 11px;
        opacity: 0.8;
        cursor: pointer;
        padding: 3px 0;
      }
      #${PANEL_ID} .panel-toggle:hover {
        opacity: 1;
      }
      #${PANEL_ID} .panel-toggle .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #4caf50;
        transition: background 0.2s;
      }
      #${PANEL_ID} .panel-toggle .dot.manual {
        background: #ff9800;
      }
    </style>
    <div class="panel-header">评论排序</div>
    <div class="panel-modes"></div>
    <div class="panel-toggle" id="sort-auto-toggle">
      <span class="dot" id="sort-auto-dot"></span>
      <span id="sort-auto-label">自动</span>
    </div>
  `
  document.body.appendChild(panel)

  // 渲染模式按钮
  const modesContainer = panel.querySelector('.panel-modes')!
  const renderModes = () => {
    modesContainer.innerHTML = ''
    MODE_CYCLE.forEach(mode => {
      const btn = document.createElement('button')
      btn.className = `panel-btn${mode === currentMode ? ' active' : ''}`
      btn.textContent = MODE_LABELS[mode]
      btn.addEventListener('click', () => {
        setSortMode(mode)
      })
      modesContainer.appendChild(btn)
    })
  }

  // 自动/手动切换
  const autoToggle = panel.querySelector('#sort-auto-toggle') as HTMLElement
  const autoDot = panel.querySelector('#sort-auto-dot') as HTMLElement
  const autoLabel = panel.querySelector('#sort-auto-label') as HTMLElement

  const updateAutoToggle = () => {
    if (autoSort) {
      autoDot.classList.remove('manual')
      autoLabel.textContent = '自动排序'
    } else {
      autoDot.classList.add('manual')
      autoLabel.textContent = '点击排序'
    }
  }

  autoToggle.addEventListener('click', () => {
    autoSort = !autoSort
    updateAutoToggle()
    // 同步到设置
    const settings = getComponentSettings<SortCommentsOptions>('sortComments')
    if (settings) {
      settings.options.autoSort = autoSort
    }
  })

  const updatePanel = () => {
    renderModes()
    updateAutoToggle()
    if (!panelVisible) {
      panel.classList.add('hidden')
    } else {
      panel.classList.remove('hidden')
    }
  }

  updatePanel()
  return { updatePanel, panel }
}

let panelApi: ReturnType<typeof createPanel> | null = null

const setSortMode = (mode: CommentSortMode) => {
  currentMode = mode
  const settings = getComponentSettings<SortCommentsOptions>('sortComments')
  if (settings) {
    settings.options.sortMode = mode
  }
  // 立即排序所有已观察区域
  observedAreas.forEach(area => applySortByCssOrder(area, mode))
  panelApi?.updatePanel()
}

// ============ 主逻辑 ============

const observedAreas: Set<CommentArea> = new Set()
let sortScheduled = false

const scheduleSort = () => {
  if (sortScheduled || !autoSort) return
  sortScheduled = true
  requestAnimationFrame(() => {
    sortScheduled = false
    if (!autoSort) return
    observedAreas.forEach(area => applySortByCssOrder(area, currentMode))
  })
}

const entry = async () => {
  const settings = getComponentSettings<SortCommentsOptions>('sortComments')
  currentMode = settings.options.sortMode
  autoSort = settings.options.autoSort
  panelVisible = settings.options.showPanel

  // 监听设置面板中的排序方式变更
  addComponentListener(
    'sortComments.sortMode',
    (mode: CommentSortMode) => {
      currentMode = mode
      observedAreas.forEach(area => applySortByCssOrder(area, mode))
      panelApi?.updatePanel()
    },
    true,
  )

  // 监听自动排序开关
  addComponentListener(
    'sortComments.autoSort',
    (value: boolean) => {
      autoSort = value
      panelApi?.updatePanel()
    },
    true,
  )

  // 监听面板显示开关
  addComponentListener(
    'sortComments.showPanel',
    (value: boolean) => {
      panelVisible = value
      panelApi?.updatePanel()
    },
    true,
  )

  // 创建悬浮面板
  if (panelVisible) {
    panelApi = createPanel()
  }

  // 监听评论区
  forEachCommentArea(area => {
    observedAreas.add(area)
    if (autoSort) {
      applySortByCssOrder(area, currentMode)
    }
  })

  // 新评论加载时触发排序
  forEachCommentItem({
    added: () => {
      scheduleSort()
    },
  })
}

export const component = defineComponentMetadata({
  name: 'sortComments',
  displayName: '评论区评论排序',
  tags: [componentsTags.utils],
  options: sortCommentsOptions,
  entry,
  author: {
    name: 'ChairKeter',
    link: 'https://github.com/ChairKeter',
  },
})