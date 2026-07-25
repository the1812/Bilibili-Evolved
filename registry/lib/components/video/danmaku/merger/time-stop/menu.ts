/**
 * 原生弹幕 tip 注入「时停 / 恢复」按钮。
 *
 * 本模块只负责 DOM 注入与点击回调，不进入 enter/release 业务逻辑。
 */

import { parseSourceIdFromDmid, readDmidFromContext } from './source-id'
import { getActiveSourceId } from './state'

/** 按钮标记属性，避免重复注入 */
const BTN_ATTR = 'data-dm-merger-time-stop'
/** 空闲 / 异源文案 */
const LABEL_IDLE = '时停'
/** 同源 active 文案 */
const LABEL_ACTIVE = '恢复'
/** 按钮 class（样式可在后续 scss 补齐） */
const BTN_CLASS = 'dm-merger-time-stop-btn'

/**
 * 原生 tip 根节点选择器（多版本探测）。
 * 默认：
 * - bpx 播放器：`.bpx-player-dm-tip`（见 player-agent/bpx.ts danmakuTipLayer）
 * - 旧版播放器：`.bilibili-player-dm-tip-wrap`
 * 子结构（点赞数等）实测见 GreasyFork 脚本引用 `bpx-player-dm-tip-like-num`；
 * 完整动作区 class 未在仓库内锁定，任务 6 浏览器验收前以本列表为准。
 */
const TIP_ROOT_SELECTORS = [
  '.bpx-player-dm-tip',
  '.bilibili-player-dm-tip-wrap',
  '.bilibili-player-dm-tip',
]

/**
 * tip 内动作区（优先插到动作区末尾，找不到则退回 tip 根节点）。
 * 默认值按常见 bpx 命名启发式；实测后可增删。
 */
const TIP_ACTION_SELECTORS = [
  '.bpx-player-dm-tip-operation',
  '.bpx-player-dm-tip-btns',
  '.bpx-player-dm-tip-action',
  '.bpx-player-dm-tip-ops',
  '.bilibili-player-dm-tip-operation',
  '.bilibili-player-dm-tip-btns',
]

/**
 * 弹幕节点选择器，用于 mouseover 记录当前悬停源。
 * 与 view.ts 主选择器对齐。
 */
const DANMAKU_HOVER_SELECTORS = [
  '.bili-danmaku-x-dm',
  '.bili-dm',
  '.b-danmaku',
  '.bpx-player-dm-itm',
]

/** 观察挂载点：播放器区域优先，缺失则退回 body */
const PLAYER_AREA_SELECTORS = [
  '.bpx-player-primary-area',
  '.bpx-player-container',
  '.bilibili-player',
  '#bilibili-player',
  '.player-wrap',
]

/** 合并选择器字符串 */
const TIP_ROOT_SELECTOR = TIP_ROOT_SELECTORS.join(', ')
const DANMAKU_HOVER_SELECTOR = DANMAKU_HOVER_SELECTORS.join(', ')

type ClickHandler = (sourceId: string) => void

export interface TimeStopMenuOptions {
  /** 用户点击时停/恢复时回调；enter/release 由 controller 处理 */
  onClick: ClickHandler
}

interface ButtonHost extends HTMLElement {
  /** 当前绑定的点击处理（避免重复 addEventListener） */
  __dmMergerTimeStopOnClick?: () => void
}

/** 最近一次悬停到的合并源 id；tip 自身常无 dmid 时作回退 */
let lastHoveredSourceId: string | null = null

/** 从 tip 或其祖先/子树尽量解析 sourceId */
const resolveSourceIdFromTip = (tipRoot: Element): string | null => {
  const fromTip = parseSourceIdFromDmid(readDmidFromContext(tipRoot))
  if (fromTip) {
    return fromTip
  }

  const withData = tipRoot.querySelector('[data-dmid],[data-id-str],[data-id]')
  if (withData) {
    const fromChild = parseSourceIdFromDmid(readDmidFromContext(withData))
    if (fromChild) {
      return fromChild
    }
  }

  return lastHoveredSourceId
}

/** 是否同源且当前时停 active → 显示「恢复」 */
const isActiveForSource = (sourceId: string): boolean => {
  const activeId = getActiveSourceId()
  return activeId !== null && activeId === sourceId
}

/** 选择 tip 内动作挂载点 */
const resolveActionMount = (tipRoot: Element): Element => {
  for (const sel of TIP_ACTION_SELECTORS) {
    const found = tipRoot.querySelector(sel)
    if (found) {
      return found
    }
  }
  return tipRoot
}

/**
 * 在 tip 根上确保存在时停按钮，并按状态更新文案。
 * sourceId 为空时移除按钮（原生弹幕 / 无法识别的合并源）。
 */
export const ensureTimeStopButton = (
  tipRoot: Element,
  options: {
    sourceId: string | null
    isActiveForSource: boolean
    onClick: () => void
  },
): void => {
  if (!options.sourceId) {
    tipRoot.querySelector(`[${BTN_ATTR}]`)?.remove()
    return
  }

  const mount = resolveActionMount(tipRoot)
  let btn = (tipRoot.querySelector(`[${BTN_ATTR}]`) ||
    mount.querySelector(`[${BTN_ATTR}]`)) as ButtonHost | null

  if (!btn) {
    btn = document.createElement('div') as ButtonHost
    btn.setAttribute(BTN_ATTR, '1')
    btn.className = BTN_CLASS
    btn.setAttribute('role', 'button')
    btn.setAttribute('tabindex', '0')
    btn.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      btn?.__dmMergerTimeStopOnClick?.()
    })
    // 插入到 tip 动作区最右侧
    mount.appendChild(btn)
  } else if (btn.parentElement !== mount && mount !== tipRoot) {
    // tip 内部结构重建后把按钮挪回动作区
    mount.appendChild(btn)
  }

  btn.__dmMergerTimeStopOnClick = options.onClick
  btn.textContent = options.isActiveForSource ? LABEL_ACTIVE : LABEL_IDLE
  btn.dataset.sourceId = options.sourceId
}

/** tip 是否当前可见（有盒模型且未 display:none / visibility:hidden） */
const isTipVisuallyActive = (tipRoot: Element): boolean => {
  if (!(tipRoot instanceof HTMLElement)) {
    return false
  }
  const style = getComputedStyle(tipRoot)
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false
  }
  // opacity:0 的 tip 通常表示关闭态；仍允许极小透明度
  if (Number(style.opacity || '1') === 0) {
    return false
  }
  const rect = tipRoot.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

/** 扫描文档中已出现的 tip 并注入/刷新按钮 */
const processVisibleTips = (onClick: ClickHandler): void => {
  document.querySelectorAll(TIP_ROOT_SELECTOR).forEach(tipRoot => {
    // 隐藏中的 tip 节点可能仍留在 DOM；只处理当前可见实例
    if (!isTipVisuallyActive(tipRoot)) {
      // 隐藏 tip 上若残留按钮则清掉，避免下次显示瞬间错文案
      tipRoot.querySelector(`[${BTN_ATTR}]`)?.remove()
      return
    }

    const sourceId = resolveSourceIdFromTip(tipRoot)
    ensureTimeStopButton(tipRoot, {
      sourceId,
      isActiveForSource: sourceId ? isActiveForSource(sourceId) : false,
      onClick: () => {
        // 点击时重新解析，避免闭包拿到过期 sourceId
        const currentId = resolveSourceIdFromTip(tipRoot) || sourceId
        if (currentId) {
          onClick(currentId)
        }
      },
    })
  })
}

/** 从事件目标回溯弹幕节点并更新 lastHoveredSourceId */
const updateHoveredSourceFromEvent = (target: EventTarget | null): void => {
  if (!(target instanceof Element)) {
    return
  }
  const dmNode = target.closest(DANMAKU_HOVER_SELECTOR)
  if (!dmNode) {
    return
  }
  const dmid = readDmidFromContext(dmNode)
  const sourceId = parseSourceIdFromDmid(dmid)
  // 仅记录合并源；原生弹幕清空，避免 tip 误用上一次合并源
  lastHoveredSourceId = sourceId
}

/**
 * 启动 tip 观察与 mouseover 注入。
 * @returns 停止函数（disconnect observer、移除监听、清理按钮）
 */
export const startTimeStopMenu = (options: TimeStopMenuOptions): (() => void) => {
  const { onClick } = options
  let stopped = false
  let rafId = 0
  let mouseoverTimer = 0

  const scheduleProcess = () => {
    if (stopped) {
      return
    }
    if (rafId) {
      return
    }
    rafId = window.requestAnimationFrame(() => {
      rafId = 0
      if (!stopped) {
        processVisibleTips(onClick)
      }
    })
  }

  const onMouseOver = (event: Event) => {
    updateHoveredSourceFromEvent(event.target)
    // tip 常在悬停后异步挂载，短延迟再扫一次
    window.clearTimeout(mouseoverTimer)
    mouseoverTimer = window.setTimeout(() => {
      scheduleProcess()
    }, 50)
  }

  const resolveObserveRoot = (): Element => {
    for (const sel of PLAYER_AREA_SELECTORS) {
      const el = document.querySelector(sel)
      if (el) {
        return el
      }
    }
    return document.body
  }

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type !== 'childList') {
        continue
      }
      // 任意子树变更都可能是 tip 挂载；合并到下一帧处理
      if (m.addedNodes.length > 0 || m.removedNodes.length > 0) {
        scheduleProcess()
        return
      }
    }
  })

  const observeRoot = resolveObserveRoot()
  observer.observe(observeRoot, { childList: true, subtree: true })

  // 播放器区域晚于组件启动时，补挂 body 一层保险
  let bodyObserver: MutationObserver | null = null
  if (observeRoot !== document.body) {
    bodyObserver = new MutationObserver(() => {
      scheduleProcess()
    })
    bodyObserver.observe(document.body, { childList: true, subtree: false })
  }

  document.addEventListener('mouseover', onMouseOver, true)

  // 首扫：页面上若已有 tip
  scheduleProcess()

  return () => {
    stopped = true
    if (rafId) {
      window.cancelAnimationFrame(rafId)
      rafId = 0
    }
    window.clearTimeout(mouseoverTimer)
    observer.disconnect()
    bodyObserver?.disconnect()
    bodyObserver = null
    document.removeEventListener('mouseover', onMouseOver, true)
    document.querySelectorAll(`[${BTN_ATTR}]`).forEach(node => node.remove())
    lastHoveredSourceId = null
  }
}
