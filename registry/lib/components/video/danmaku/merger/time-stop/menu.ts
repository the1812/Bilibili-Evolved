/**
 * 原生弹幕 tip 注入「时停 / 恢复」按钮。
 *
 * 本模块只负责 DOM 注入与点击回调，不进入 enter/release 业务逻辑。
 */

import {
  parseSourceIdFromDmid,
  readDanmakuTextFromElement,
  readDmidFromContext,
} from './source-id'
import { getActiveSourceId } from './state'
import type { TimeStopDeps } from './types'

/** 按钮标记属性，避免重复注入 */
const BTN_ATTR = 'data-dm-merger-time-stop'
/** 空闲 / 异源文案 */
const LABEL_IDLE = '时停'
/** 同源 active 文案 */
const LABEL_ACTIVE = '恢复'
/** 按钮 class（样式可在后续 scss 补齐） */
const BTN_CLASS = 'dm-merger-time-stop-btn'
/** tip 根节点标记：扩宽气泡并重排原生图标位 */
const TIP_HOST_CLASS = 'dm-merger-time-stop-tip'
/** 悬停说明气泡 class */
const TIP_BUBBLE_CLASS = 'dm-merger-time-stop-tip-bubble'

/** 时停：暂停双竖条（白填充，对齐原生 tip 图标风格） */
const SVG_IDLE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" data-pointer="none" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#fff" d="M8 5.25c-.69 0-1.25.56-1.25 1.25v11c0 .69.56 1.25 1.25 1.25h1.5c.69 0 1.25-.56 1.25-1.25v-11c0-.69-.56-1.25-1.25-1.25H8Zm6.5 0c-.69 0-1.25.56-1.25 1.25v11c0 .69.56 1.25 1.25 1.25H16c.69 0 1.25-.56 1.25-1.25v-11c0-.69-.56-1.25-1.25-1.25h-1.5Z"/></svg>`

/** 恢复：播放三角 */
const SVG_ACTIVE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" data-pointer="none" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#fff" d="M8.25 5.43a1.5 1.5 0 0 1 2.28-1.28l9.12 5.82a1.5 1.5 0 0 1 0 2.56l-9.12 5.82A1.5 1.5 0 0 1 8.25 16.97V5.43Z"/></svg>`

const TITLE_IDLE = '时停：定格该合并源弹幕，拖进度后点恢复写入时间偏移'
const TITLE_ACTIVE = '恢复：解除定格，并按拖动进度写入时间偏移'

/**
 * 原生 tip 根节点选择器（多版本探测）。
 * 默认：
 * - bpx 播放器：`.bpx-player-dm-tip`（见 player-agent/bpx.ts danmakuTipLayer）
 * - 旧版播放器：`.bilibili-player-dm-tip-wrap`
 */
const TIP_ROOT_SELECTORS = [
  '.bpx-player-dm-tip',
  '.bilibili-player-dm-tip-wrap',
  '.bilibili-player-dm-tip',
]

/**
 * tip 内动作区（优先插到动作区末尾，找不到则退回 tip 根节点）。
 * 2026-07-25 实测：bpx tip 子节点是 like/copy/recall 平铺，无独立 operation 容器。
 */
const TIP_ACTION_SELECTORS = [
  '.bpx-player-dm-tip-operation',
  '.bilibili-player-dm-tip-operation',
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
  /** 从弹幕节点反查合并源（bpx 无 data-dmid 时必需） */
  resolveSourceIdFromElement?: TimeStopDeps['resolveSourceIdFromElement']
}

interface ButtonHost extends HTMLElement {
  /** 当前绑定的点击处理（避免重复 addEventListener） */
  __dmMergerTimeStopOnClick?: () => void
}

/** 最近一次悬停到的合并源 id；tip 自身常无 dmid 时作回退 */
let lastHoveredSourceId: string | null = null
/** 最近一次悬停弹幕文案（调试与二次解析） */
let lastHoveredText: string | null = null
/** 运行时注入的节点反查 */
let resolveFromElement: TimeStopDeps['resolveSourceIdFromElement'] | null = null

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

  // tip 自身常无 dmid：回落到悬停弹幕反查结果
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
const renderButtonContent = (btn: HTMLElement, isActive: boolean): void => {
  btn.innerHTML = isActive ? SVG_ACTIVE : SVG_IDLE
  let bubble = btn.querySelector(`.${TIP_BUBBLE_CLASS}`) as HTMLElement | null
  if (!bubble) {
    bubble = document.createElement('div')
    bubble.className = TIP_BUBBLE_CLASS
    bubble.setAttribute('role', 'tooltip')
    btn.appendChild(bubble)
  }
  bubble.textContent = isActive ? TITLE_ACTIVE : TITLE_IDLE
  btn.setAttribute('aria-label', isActive ? LABEL_ACTIVE : LABEL_IDLE)
  // 不用原生 title，改用自定义弹层，避免系统 tooltip 抢戏
  btn.removeAttribute('title')
}

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
    tipRoot.classList.remove(TIP_HOST_CLASS)
    return
  }

  // 直接挂 tip 根：bpx 动作项均为 absolute，无独立 operation 容器
  tipRoot.classList.add(TIP_HOST_CLASS)

  let btn = tipRoot.querySelector(`[${BTN_ATTR}]`) as ButtonHost | null

  if (!btn) {
    btn = document.createElement('div') as ButtonHost
    btn.setAttribute(BTN_ATTR, '1')
    btn.className = BTN_CLASS
    btn.setAttribute('role', 'button')
    btn.setAttribute('tabindex', '0')
    // 阻止鼠标在按钮上时原生 tip 因 leave 弹幕而收起
    ;['mouseenter', 'mouseover', 'mousemove'].forEach(type => {
      btn!.addEventListener(type, e => {
        e.stopPropagation()
      })
    })
    btn.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      btn?.__dmMergerTimeStopOnClick?.()
    })
    // 与原生 like/copy/back 同级
    const back = tipRoot.querySelector('.bpx-player-dm-tip-back, .bpx-player-dm-tip-recall')
    if (back?.parentElement === tipRoot) {
      tipRoot.insertBefore(btn, back.nextSibling)
    } else {
      tipRoot.appendChild(btn)
    }
  } else if (btn.parentElement !== tipRoot) {
    tipRoot.appendChild(btn)
  }

  btn.__dmMergerTimeStopOnClick = options.onClick
  btn.dataset.sourceId = options.sourceId
  renderButtonContent(btn, options.isActiveForSource)
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
      tipRoot.classList.remove(TIP_HOST_CLASS)
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
          // 状态切换后立刻刷新本按钮文案（时停 ↔ 恢复）
          const btnNow = tipRoot.querySelector(`[${BTN_ATTR}]`) as HTMLElement | null
          if (btnNow) {
            const activeId = getActiveSourceId()
            renderButtonContent(btnNow, activeId === currentId)
          }
        }
      },
    })
  })
}

/** 从弹幕节点解析合并源 id */
const resolveSourceIdFromDanmakuNode = (dmNode: Element): string | null => {
  const dmid = readDmidFromContext(dmNode)
  let sourceId = parseSourceIdFromDmid(dmid)
  if (!sourceId && resolveFromElement) {
    sourceId = resolveFromElement(dmNode)
  }
  return sourceId
}

/**
 * bpx 画面弹幕节点 pointer-events:none，event.target 往往是 video。
 * 用坐标命中可见弹幕节点，再反查合并源。
 */
const hitDanmakuElementAtPoint = (clientX: number, clientY: number): Element | null => {
  const nodes = document.querySelectorAll(DANMAKU_HOVER_SELECTOR)
  let best: { node: Element; area: number } | null = null
  nodes.forEach(node => {
    if (!(node instanceof HTMLElement)) {
      return
    }
    const rect = node.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) {
      return
    }
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return
    }
    const area = rect.width * rect.height
    // 重叠时取面积更小的节点，减少大号居中弹幕误伤
    if (!best || area < best.area) {
      best = { node, area }
    }
  })
  return best?.node || null
}

/** 指针是否在 tip 胶囊 / 时停按钮上（不含胶囊外透明死区） */
const isPointerOverTimeStopUi = (target: EventTarget | null, clientX?: number, clientY?: number): boolean => {
  if (target instanceof Element) {
    // 只认 tip 根或我们的按钮，避免外扩热区
    if (target.closest(`.${BTN_CLASS}, .bpx-player-dm-tip, .bilibili-player-dm-tip-wrap, .bilibili-player-dm-tip`)) {
      // 若在 tip 上但落在右端透明区（按钮槽之外），不保活
      if (Number.isFinite(clientX) && Number.isFinite(clientY)) {
        const tip = target.closest('.bpx-player-dm-tip, .bilibili-player-dm-tip-wrap, .bilibili-player-dm-tip') as HTMLElement | null
        const btn = tip?.querySelector(`.${BTN_CLASS}`) as HTMLElement | null
        if (tip && btn) {
          const tipRect = tip.getBoundingClientRect()
          const btnRect = btn.getBoundingClientRect()
          // tip 内且 x 不超过按钮右缘 + 4
          if (
            clientX! >= tipRect.left &&
            clientX! <= Math.max(btnRect.right, tipRect.right) + 2 &&
            clientY! >= tipRect.top &&
            clientY! <= tipRect.bottom
          ) {
            return true
          }
          // 直接在按钮上
          if (
            clientX! >= btnRect.left &&
            clientX! <= btnRect.right &&
            clientY! >= btnRect.top &&
            clientY! <= btnRect.bottom
          ) {
            return true
          }
          return false
        }
      }
      return true
    }
  }
  if (Number.isFinite(clientX) && Number.isFinite(clientY)) {
    const tip = document.querySelector(`.${TIP_HOST_CLASS}`) as HTMLElement | null
    const btn = tip?.querySelector(`.${BTN_CLASS}`) as HTMLElement | null
    if (tip) {
      const tipRect = tip.getBoundingClientRect()
      const btnRect = btn?.getBoundingClientRect()
      const right = btnRect ? Math.max(btnRect.right, tipRect.left + 200) : tipRect.right
      if (
        clientX! >= tipRect.left &&
        clientX! <= right + 2 &&
        clientY! >= tipRect.top &&
        clientY! <= tipRect.bottom
      ) {
        return true
      }
    }
  }
  return false
}

/** 从事件目标或坐标回溯弹幕节点并更新 lastHoveredSourceId */
const updateHoveredSourceFromEvent = (event: Event): void => {
  const target = event.target
  const clientX = 'clientX' in event ? Number((event as MouseEvent).clientX) : NaN
  const clientY = 'clientY' in event ? Number((event as MouseEvent).clientY) : NaN

  // 仍在 tip/按钮热区内：保持上一次合并源，防止 tip 因鼠标移入按钮而消失
  if (isPointerOverTimeStopUi(target, clientX, clientY)) {
    return
  }

  let dmNode: Element | null = null
  if (target instanceof Element) {
    dmNode = target.closest(DANMAKU_HOVER_SELECTOR)
  }

  // 画面层 pe:none：用 mouse 坐标扫可见弹幕盒
  if (!dmNode && Number.isFinite(clientX) && Number.isFinite(clientY)) {
    dmNode = hitDanmakuElementAtPoint(clientX, clientY)
  }

  if (!dmNode) {
    return
  }

  const sourceId = resolveSourceIdFromDanmakuNode(dmNode)
  lastHoveredText = readDanmakuTextFromElement(dmNode) || lastHoveredText
  // 仅记录合并源；原生弹幕清空，避免 tip 误用上一次合并源
  lastHoveredSourceId = sourceId
}

/**
 * 启动 tip 观察与 mouseover 注入。
 * @returns 停止函数（disconnect observer、移除监听、清理按钮）
 */
export const startTimeStopMenu = (options: TimeStopMenuOptions): (() => void) => {
  const { onClick } = options
  resolveFromElement = options.resolveSourceIdFromElement || null
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

  // 指针在 video 上移动时 target 不变，必须用 mousemove 持续命中弹幕盒
  let pointerSampleRaf = 0
  let lastPointerEvent: Event | null = null
  const onPointerSample = (event: Event) => {
    lastPointerEvent = event
    if (pointerSampleRaf) {
      return
    }
    pointerSampleRaf = window.requestAnimationFrame(() => {
      pointerSampleRaf = 0
      if (stopped || !lastPointerEvent) {
        return
      }
      updateHoveredSourceFromEvent(lastPointerEvent)
      // tip 常在悬停后异步挂载，短延迟再扫一次
      window.clearTimeout(mouseoverTimer)
      mouseoverTimer = window.setTimeout(() => {
        scheduleProcess()
      }, 50)
    })
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

  document.addEventListener('mouseover', onPointerSample, true)
  document.addEventListener('mousemove', onPointerSample, true)

  // 首扫：页面上若已有 tip
  scheduleProcess()

  return () => {
    stopped = true
    if (rafId) {
      window.cancelAnimationFrame(rafId)
      rafId = 0
    }
    window.clearTimeout(mouseoverTimer)
    if (pointerSampleRaf) {
      window.cancelAnimationFrame(pointerSampleRaf)
      pointerSampleRaf = 0
    }
    lastPointerEvent = null
    observer.disconnect()
    bodyObserver?.disconnect()
    bodyObserver = null
    document.removeEventListener('mouseover', onPointerSample, true)
    document.removeEventListener('mousemove', onPointerSample, true)
    document.querySelectorAll(`[${BTN_ATTR}]`).forEach(node => node.remove())
    document.querySelectorAll(`.${TIP_HOST_CLASS}`).forEach(node => {
      node.classList.remove(TIP_HOST_CLASS)
    })
    lastHoveredSourceId = null
    lastHoveredText = null
    resolveFromElement = null
  }
}

