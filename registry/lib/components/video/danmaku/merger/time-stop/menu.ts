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
/** 按钮 class */
const BTN_CLASS = 'dm-merger-time-stop-btn'
/** tip 根节点标记：合并弹幕专用布局 */
const TIP_HOST_CLASS = 'dm-merger-time-stop-tip'
/** 悬停说明气泡 class */
const TIP_BUBBLE_CLASS = 'dm-merger-time-stop-tip-bubble'

/** 时停：暂停双竖条 */
const SVG_IDLE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" data-pointer="none" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#fff" d="M8 5.25c-.69 0-1.25.56-1.25 1.25v11c0 .69.56 1.25 1.25 1.25h1.5c.69 0 1.25-.56 1.25-1.25v-11c0-.69-.56-1.25-1.25-1.25H8Zm6.5 0c-.69 0-1.25.56-1.25 1.25v11c0 .69.56 1.25 1.25 1.25H16c.69 0 1.25-.56 1.25-1.25v-11c0-.69-.56-1.25-1.25-1.25h-1.5Z"/></svg>`

/** 恢复：播放三角 */
const SVG_ACTIVE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" data-pointer="none" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#fff" d="M8.25 5.43a1.5 1.5 0 0 1 2.28-1.28l9.12 5.82a1.5 1.5 0 0 1 0 2.56l-9.12 5.82A1.5 1.5 0 0 1 8.25 16.97V5.43Z"/></svg>`

const TITLE_IDLE = '时停：定格该合并源弹幕，拖进度后点恢复写入时间偏移'
const TITLE_ACTIVE = '恢复：解除定格，并按拖动进度写入时间偏移'

/** 合并弹幕 tip 宽度：仅复制 + 时停两槽 */
const MERGED_TIP_WIDTH = 120

const TIP_ROOT_SELECTORS = [
  '.bpx-player-dm-tip',
  '.bilibili-player-dm-tip-wrap',
  '.bilibili-player-dm-tip',
]

const DANMAKU_HOVER_SELECTORS = [
  '.bili-danmaku-x-dm',
  '.bili-dm',
  '.b-danmaku',
  '.bpx-player-dm-itm',
  '.dm-merger-time-stop-clone',
]

const PLAYER_AREA_SELECTORS = [
  '.bpx-player-primary-area',
  '.bpx-player-container',
  '.bilibili-player',
  '#bilibili-player',
  '.player-wrap',
]

const TIP_ROOT_SELECTOR = TIP_ROOT_SELECTORS.join(', ')
const DANMAKU_HOVER_SELECTOR = DANMAKU_HOVER_SELECTORS.join(', ')

type ClickHandler = (sourceId: string) => void

export interface TimeStopMenuOptions {
  onClick: ClickHandler
  resolveSourceIdFromElement?: TimeStopDeps['resolveSourceIdFromElement']
}

interface ButtonHost extends HTMLElement {
  __dmMergerTimeStopOnClick?: () => void
}

let lastHoveredSourceId: string | null = null
let lastHoveredText: string | null = null
let resolveFromElement: TimeStopDeps['resolveSourceIdFromElement'] | null = null
/** 供 forceShowTip 后立即刷新按钮 */
let processTipsHandler: ClickHandler | null = null

const parseSourceIdFromTip = (tipRoot: Element): string | null => {
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

const isActiveForSource = (sourceId: string): boolean => {
  const activeId = getActiveSourceId()
  return activeId !== null && activeId === sourceId
}

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
  btn.removeAttribute('title')
}

/** 合并弹幕 tip：只保留复制 + 时停，贴近原生胶囊 */
const applyMergedTipLayout = (tipRoot: HTMLElement): void => {
  tipRoot.classList.add(TIP_HOST_CLASS)
  tipRoot.style.setProperty('width', `${MERGED_TIP_WIDTH}px`, 'important')
  tipRoot.style.setProperty('height', '48px', 'important')

  // 拉伸原生 SVG 胶囊，保留箭头，贴近原生外观
  tipRoot.querySelectorAll('.bpx-player-dm-tip-svgm, .bpx-player-dm-tip-svgl').forEach(node => {
    if (!(node instanceof HTMLElement)) {
      return
    }
    node.style.removeProperty('opacity')
    node.style.removeProperty('pointer-events')
    node.style.setProperty('width', '100%', 'important')
    node.style.setProperty('height', '100%', 'important')
    node.style.setProperty('left', '0', 'important')
    node.style.setProperty('top', '0', 'important')
    const svg = node.querySelector('svg')
    if (svg) {
      svg.setAttribute('preserveAspectRatio', 'none')
      svg.style.setProperty('width', '100%', 'important')
      svg.style.setProperty('height', '100%', 'important')
      svg.style.setProperty('display', 'block', 'important')
    }
  })

  // 合并弹幕：隐藏点赞 / 举报，只留复制
  tipRoot
    .querySelectorAll(
      '.bpx-player-dm-tip-like, .bpx-player-dm-tip-like-num, .bpx-player-dm-tip-recall, .bpx-player-dm-tip-back',
    )
    .forEach(node => {
      if (node instanceof HTMLElement) {
        node.style.setProperty('display', 'none', 'important')
      }
    })

  const copy = tipRoot.querySelector('.bpx-player-dm-tip-copy') as HTMLElement | null
  if (copy) {
    copy.style.setProperty('display', 'flex', 'important')
    copy.style.setProperty('left', '18px', 'important')
    copy.style.setProperty('top', '8px', 'important')
    copy.style.setProperty('width', '32px', 'important')
    copy.style.setProperty('height', '32px', 'important')
  }
}

const clearMergedTipLayout = (tipRoot: Element): void => {
  tipRoot.classList.remove(TIP_HOST_CLASS)
  if (tipRoot instanceof HTMLElement) {
    tipRoot.style.removeProperty('width')
    tipRoot.style.removeProperty('height')
  }
  tipRoot
    .querySelectorAll(
      '.bpx-player-dm-tip-like, .bpx-player-dm-tip-like-num, .bpx-player-dm-tip-recall, .bpx-player-dm-tip-back, .bpx-player-dm-tip-copy, .bpx-player-dm-tip-svgm, .bpx-player-dm-tip-svgl',
    )
    .forEach(node => {
      if (node instanceof HTMLElement) {
        node.style.removeProperty('display')
        node.style.removeProperty('left')
        node.style.removeProperty('top')
        node.style.removeProperty('width')
        node.style.removeProperty('height')
        node.style.removeProperty('opacity')
        node.style.removeProperty('pointer-events')
      }
    })
  tipRoot.querySelectorAll('.bpx-player-dm-tip-svgm svg, .bpx-player-dm-tip-svgl svg').forEach(svg => {
    if (svg instanceof SVGElement) {
      svg.removeAttribute('preserveAspectRatio')
      svg.style.removeProperty('width')
      svg.style.removeProperty('height')
      svg.style.removeProperty('display')
    }
  })
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
    clearMergedTipLayout(tipRoot)
    return
  }

  if (tipRoot instanceof HTMLElement) {
    applyMergedTipLayout(tipRoot)
  }

  let btn = tipRoot.querySelector(`[${BTN_ATTR}]`) as ButtonHost | null
  if (!btn) {
    btn = document.createElement('div') as ButtonHost
    btn.setAttribute(BTN_ATTR, '1')
    btn.className = BTN_CLASS
    btn.setAttribute('role', 'button')
    btn.setAttribute('tabindex', '0')
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
    tipRoot.appendChild(btn)
  } else if (btn.parentElement !== tipRoot) {
    tipRoot.appendChild(btn)
  }

  // 与复制并排：复制 left=18，时停 left=66
  btn.style.setProperty('left', '66px', 'important')
  btn.style.setProperty('top', '8px', 'important')
  btn.style.setProperty('width', '32px', 'important')
  btn.style.setProperty('height', '32px', 'important')

  btn.__dmMergerTimeStopOnClick = options.onClick
  btn.dataset.sourceId = options.sourceId
  renderButtonContent(btn, options.isActiveForSource)
}

const isTipVisuallyActive = (tipRoot: Element): boolean => {
  if (!(tipRoot instanceof HTMLElement)) {
    return false
  }
  const style = getComputedStyle(tipRoot)
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false
  }
  if (Number(style.opacity || '1') === 0) {
    return false
  }
  const rect = tipRoot.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

const processVisibleTips = (onClick: ClickHandler): void => {
  document.querySelectorAll(TIP_ROOT_SELECTOR).forEach(tipRoot => {
    if (!isTipVisuallyActive(tipRoot)) {
      tipRoot.querySelector(`[${BTN_ATTR}]`)?.remove()
      clearMergedTipLayout(tipRoot)
      return
    }

    const sourceId = parseSourceIdFromTip(tipRoot)
    ensureTimeStopButton(tipRoot, {
      sourceId,
      isActiveForSource: sourceId ? isActiveForSource(sourceId) : false,
      onClick: () => {
        const currentId = parseSourceIdFromTip(tipRoot) || sourceId
        if (currentId) {
          onClick(currentId)
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

const resolveSourceIdFromDanmakuNode = (dmNode: Element): string | null => {
  if (dmNode instanceof HTMLElement) {
    const fromDataset = dmNode.dataset.dmMergerSourceId
    if (fromDataset) {
      return fromDataset
    }
    const active = getActiveSourceId()
    if (dmNode.classList.contains('dm-merger-time-stop-clone') && active) {
      return active
    }
  }

  const dmid =
    readDmidFromContext(dmNode) ||
    (dmNode instanceof HTMLElement ? dmNode.dataset.dmMergerDmid || null : null)
  let sourceId = parseSourceIdFromDmid(dmid)
  if (!sourceId && resolveFromElement) {
    sourceId = resolveFromElement(dmNode)
  }
  return sourceId
}

const hitDanmakuElementAtPoint = (clientX: number, clientY: number): Element | null => {
  try {
    const stack = document.elementsFromPoint(clientX, clientY)
    for (const node of stack) {
      if (!(node instanceof Element)) {
        continue
      }
      const hit = node.closest(DANMAKU_HOVER_SELECTOR)
      if (hit instanceof HTMLElement) {
        if (hit.classList.contains('dm-merger-time-stop-hidden')) {
          continue
        }
        return hit
      }
    }
  } catch {
    // fallthrough
  }

  let best: { node: Element; area: number } | null = null
  document.querySelectorAll(DANMAKU_HOVER_SELECTOR).forEach(node => {
    if (!(node instanceof HTMLElement)) {
      return
    }
    if (node.classList.contains('dm-merger-time-stop-hidden')) {
      return
    }
    const style = getComputedStyle(node)
    if (style.visibility === 'hidden' || style.display === 'none') {
      return
    }
    const rect = node.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) {
      return
    }
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      return
    }
    const area = rect.width * rect.height
    if (!best || area < best.area) {
      best = { node, area }
    }
  })
  return best?.node || null
}

/** 手动显示原生 tip 到目标附近（时停克隆 / 合并弹幕悬停） */
const forceShowTipNearElement = (el: HTMLElement): void => {
  const tip = document.querySelector('.bpx-player-dm-tip') as HTMLElement | null
  if (!tip) {
    return
  }
  const rect = el.getBoundingClientRect()
  const tipW = MERGED_TIP_WIDTH
  const tipH = 48
  let top = rect.bottom + 10
  const vh = window.innerHeight
  if (top + tipH > vh - 8) {
    top = Math.max(8, rect.top - tipH - 10)
    tip.classList.remove('bpx-player-showB')
    tip.classList.add('bpx-player-showT')
  } else {
    tip.classList.remove('bpx-player-showT')
    tip.classList.add('bpx-player-showB')
  }
  const left = rect.left + rect.width / 2
  tip.style.left = `${left}px`
  tip.style.top = `${top}px`
  tip.style.transform = 'translateX(-50%)'
  tip.classList.remove('bpx-player-hide')
  tip.style.visibility = 'visible'
  tip.style.opacity = '1'
  tip.style.pointerEvents = 'auto'
  tip.style.setProperty('width', `${tipW}px`, 'important')
  tip.style.setProperty('height', '48px', 'important')

  // 立刻注入按钮
  if (processTipsHandler) {
    processVisibleTips(processTipsHandler)
  }
}

const isPointerOverTimeStopUi = (
  target: EventTarget | null,
  clientX?: number,
  clientY?: number,
): boolean => {
  if (target instanceof Element) {
    if (target.closest(`.${BTN_CLASS}, .bpx-player-dm-tip, .bilibili-player-dm-tip-wrap, .bilibili-player-dm-tip`)) {
      return true
    }
  }
  if (Number.isFinite(clientX) && Number.isFinite(clientY)) {
    const tip = document.querySelector(`.${TIP_HOST_CLASS}, .bpx-player-dm-tip`) as HTMLElement | null
    if (tip) {
      const r = tip.getBoundingClientRect()
      if (clientX! >= r.left && clientX! <= r.right && clientY! >= r.top && clientY! <= r.bottom) {
        return true
      }
    }
  }
  return false
}

const updateHoveredSourceFromEvent = (event: Event): void => {
  const target = event.target
  const clientX = 'clientX' in event ? Number((event as MouseEvent).clientX) : NaN
  const clientY = 'clientY' in event ? Number((event as MouseEvent).clientY) : NaN

  if (isPointerOverTimeStopUi(target, clientX, clientY)) {
    return
  }

  let dmNode: Element | null = null
  if (target instanceof Element) {
    dmNode = target.closest(DANMAKU_HOVER_SELECTOR)
  }
  if (!dmNode && Number.isFinite(clientX) && Number.isFinite(clientY)) {
    dmNode = hitDanmakuElementAtPoint(clientX, clientY)
  }
  if (!dmNode) {
    return
  }

  const sourceId = resolveSourceIdFromDanmakuNode(dmNode)
  lastHoveredText = readDanmakuTextFromElement(dmNode) || lastHoveredText
  lastHoveredSourceId = sourceId

  // 合并弹幕（含时停克隆）：主动唤起 tip 并注入「复制 + 时停」
  if (sourceId && dmNode instanceof HTMLElement) {
    forceShowTipNearElement(dmNode)
  }
}

export const startTimeStopMenu = (options: TimeStopMenuOptions): (() => void) => {
  const { onClick } = options
  resolveFromElement = options.resolveSourceIdFromElement || null
  processTipsHandler = onClick
  let stopped = false
  let rafId = 0
  let mouseoverTimer = 0
  let pointerSampleRaf = 0
  let lastPointerEvent: Event | null = null

  const scheduleProcess = () => {
    if (stopped || rafId) {
      return
    }
    rafId = window.requestAnimationFrame(() => {
      rafId = 0
      if (!stopped) {
        processVisibleTips(onClick)
      }
    })
  }

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
      window.clearTimeout(mouseoverTimer)
      mouseoverTimer = window.setTimeout(() => {
        scheduleProcess()
      }, 30)
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
      if (m.type === 'childList' && (m.addedNodes.length > 0 || m.removedNodes.length > 0)) {
        scheduleProcess()
        return
      }
    }
  })

  const observeRoot = resolveObserveRoot()
  observer.observe(observeRoot, { childList: true, subtree: true })

  let bodyObserver: MutationObserver | null = null
  if (observeRoot !== document.body) {
    bodyObserver = new MutationObserver(() => {
      scheduleProcess()
    })
    bodyObserver.observe(document.body, { childList: true, subtree: false })
  }

  document.addEventListener('mouseover', onPointerSample, true)
  document.addEventListener('mousemove', onPointerSample, true)
  scheduleProcess()

  return () => {
    stopped = true
    if (rafId) {
      window.cancelAnimationFrame(rafId)
      rafId = 0
    }
    if (pointerSampleRaf) {
      window.cancelAnimationFrame(pointerSampleRaf)
      pointerSampleRaf = 0
    }
    lastPointerEvent = null
    window.clearTimeout(mouseoverTimer)
    observer.disconnect()
    bodyObserver?.disconnect()
    document.removeEventListener('mouseover', onPointerSample, true)
    document.removeEventListener('mousemove', onPointerSample, true)
    document.querySelectorAll(`[${BTN_ATTR}]`).forEach(node => node.remove())
    document.querySelectorAll(`.${TIP_HOST_CLASS}`).forEach(node => {
      clearMergedTipLayout(node)
    })
    lastHoveredSourceId = null
    lastHoveredText = null
    resolveFromElement = null
    processTipsHandler = null
  }
}
