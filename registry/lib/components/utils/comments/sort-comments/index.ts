import { defineComponentMetadata } from '@/components/define'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import {
  CommentArea,
  CommentItem,
  CommentReplyItem,
  forEachCommentArea,
  forEachCommentItem,
  commentAreaManager,
} from '@/components/utils/comment-apis'
import { mountVueComponent } from '@/core/utils'
import { CommentSortMode, SortCommentsOptions, sortCommentsOptions } from './options'

// ============ 辅助函数 ============

const getUserLevel = (item: CommentReplyItem): number => {
  const props = item.frameworkSpecificProps
  if (!props) {
    return 0
  }
  if (props.member?.level_info?.current_level !== undefined) {
    return props.member.level_info.current_level
  }
  return 0
}

const getTime = (item: CommentReplyItem): number => item.time ?? 0

type CompareFn = (a: CommentItem, b: CommentItem) => number

const compareFns: Record<CommentSortMode, CompareFn> = {
  [CommentSortMode.Default]: (a, b) => {
    const idA = parseInt(a.id)
    const idB = parseInt(b.id)
    if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
      return idA - idB
    }
    return 0
  },
  [CommentSortMode.LikesDescending]: (a, b) => b.likes - a.likes || parseInt(a.id) - parseInt(b.id),
  [CommentSortMode.LikesAscending]: (a, b) => a.likes - b.likes || parseInt(a.id) - parseInt(b.id),
  [CommentSortMode.TimeDescending]: (a, b) =>
    getTime(b) - getTime(a) || parseInt(a.id) - parseInt(b.id),
  [CommentSortMode.TimeAscending]: (a, b) =>
    getTime(a) - getTime(b) || parseInt(a.id) - parseInt(b.id),
  [CommentSortMode.LevelDescending]: (a, b) =>
    getUserLevel(b) - getUserLevel(a) || parseInt(a.id) - parseInt(b.id),
  [CommentSortMode.LevelAscending]: (a, b) =>
    getUserLevel(a) - getUserLevel(b) || parseInt(a.id) - parseInt(b.id),
}

// ============ CSS order 排序（避免 DOM 移动导致 Lit 重渲染闪烁） ============

const ensureFlexContainer = (area: CommentArea) => {
  if (area.items.length === 0) {
    return null
  }
  const parent = area.items[0].element.parentElement
  if (!parent) {
    return null
  }
  if (!parent.dataset.sortCommentsFlex) {
    parent.dataset.sortCommentsFlex = '1'
    parent.style.display = 'flex'
    parent.style.flexDirection = 'column'
  }
  return parent
}

const applySortByCssOrder = (area: CommentArea, mode: CommentSortMode) => {
  if (area.items.length === 0) {
    return
  }
  const parent = ensureFlexContainer(area)
  if (!parent) {
    return
  }
  area.items.forEach(item => {
    item.element.style.order = ''
  })
  if (mode === CommentSortMode.Default) {
    return
  }
  const sorted = [...area.items].sort(compareFns[mode])
  sorted.forEach((item, index) => {
    item.element.style.order = String(index)
  })
}

const sortAllAreas = (mode: CommentSortMode) => {
  commentAreaManager.commentAreas.forEach(area => {
    applySortByCssOrder(area, mode)
  })
}

const cleanupAllStyles = () => {
  commentAreaManager.commentAreas.forEach(area => {
    area.items.forEach(item => {
      item.element.style.order = ''
    })
    if (area.items.length > 0) {
      const parent = area.items[0].element.parentElement
      if (parent?.dataset.sortCommentsFlex) {
        delete parent.dataset.sortCommentsFlex
        parent.style.display = ''
        parent.style.flexDirection = ''
      }
    }
  })
}

// ============ 状态 ============

let currentMode = CommentSortMode.Default
let autoSort = true
let panelVisible = true
let panelInstance: Vue | null = null
let panelContainer: HTMLElement | null = null
let sortScheduled = false

const scheduleSort = () => {
  if (sortScheduled || !autoSort) {
    return
  }
  sortScheduled = true
  requestAnimationFrame(() => {
    sortScheduled = false
    if (!autoSort) {
      return
    }
    sortAllAreas(currentMode)
  })
}

const updatePanelProps = () => {
  if (!panelInstance) {
    return
  }
  const vm = panelInstance as any
  vm.currentMode = currentMode
  vm.autoSort = autoSort
  vm.panelVisible = panelVisible
}

const setSortMode = (mode: CommentSortMode) => {
  currentMode = mode
  const settings = getComponentSettings<SortCommentsOptions>('sortComments')
  if (settings) {
    settings.options.sortMode = mode
  }
  sortAllAreas(mode)
  updatePanelProps()
}

const createPanel = async () => {
  if (panelInstance) {
    return
  }
  panelContainer = document.createElement('div')
  panelContainer.id = 'sort-comments-panel-container'
  document.body.appendChild(panelContainer)
  const SortPanel = await import('./SortPanel.vue')
  panelInstance = mountVueComponent(SortPanel, panelContainer)
  const vm = panelInstance as any
  vm.$on('mode-change', (mode: CommentSortMode) => {
    setSortMode(mode)
  })
  vm.$on('auto-toggle', (value: boolean) => {
    autoSort = value
    const settings = getComponentSettings<SortCommentsOptions>('sortComments')
    if (settings) {
      settings.options.autoSort = value
    }
    updatePanelProps()
  })
  updatePanelProps()
}

const destroyPanel = () => {
  if (panelInstance) {
    panelInstance.$destroy()
    panelInstance = null
  }
  if (panelContainer) {
    panelContainer.remove()
    panelContainer = null
  }
}

// ============ 入口 ============

const entry = async () => {
  const settings = getComponentSettings<SortCommentsOptions>('sortComments')
  currentMode = settings.options.sortMode
  autoSort = settings.options.autoSort
  panelVisible = settings.options.showPanel

  addComponentListener(
    'sortComments.sortMode',
    (mode: CommentSortMode) => {
      currentMode = mode
      sortAllAreas(mode)
      updatePanelProps()
    },
    true,
  )

  addComponentListener(
    'sortComments.autoSort',
    (value: boolean) => {
      autoSort = value
      updatePanelProps()
    },
    true,
  )

  addComponentListener(
    'sortComments.showPanel',
    (value: boolean) => {
      panelVisible = value
      updatePanelProps()
    },
    true,
  )

  // 始终创建面板，通过 hidden class 控制显示
  await createPanel()

  // 排序已有评论区
  forEachCommentArea(area => {
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
  reload: async () => {
    const settings = getComponentSettings<SortCommentsOptions>('sortComments')
    autoSort = settings.options.autoSort
    panelVisible = settings.options.showPanel
    currentMode = settings.options.sortMode
    await createPanel()
    updatePanelProps()
    sortAllAreas(currentMode)
  },
  unload: () => {
    destroyPanel()
    cleanupAllStyles()
  },
  author: {
    name: 'ChairKeter',
    link: 'https://github.com/ChairKeter',
  },
  urlInclude: [
    '//www.bilibili.com/video/',
    '//www.bilibili.com/bangumi/',
    '//t.bilibili.com/',
    '//www.bilibili.com/read/',
    '//www.bilibili.com/audio/',
    '//www.bilibili.com/opus/',
  ],
})