/**
 * 原生弹幕 tip 注入「时停 / 恢复」。
 * 合并弹幕 tip 仅保留：复制 + 时停，外观尽量复刻原生胶囊。
 */

import {
  parseSourceIdFromDmid,
  readDanmakuTextFromElement,
  readDmidFromContext,
} from './source-id'
import { getActiveSourceId } from './state'
import type { TimeStopDeps } from './types'

const BTN_ATTR = 'data-dm-merger-time-stop'
const LABEL_IDLE = '时停'
const LABEL_ACTIVE = '恢复'
const BTN_CLASS = 'dm-merger-time-stop-btn'
const TIP_HOST_CLASS = 'dm-merger-time-stop-tip'
const TIP_BUBBLE_CLASS = 'dm-merger-time-stop-tip-bubble'
const TIP_BG_CLASS = 'dm-merger-time-stop-tip-bg'

/** 两槽宽度：贴近原生「少按钮」胶囊，可完整盖住复制+时停 */
const MERGED_TIP_WIDTH = 108
const MERGED_TIP_HEIGHT = 42

const SVG_IDLE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" data-pointer="none" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#fff" d="M8 5.25c-.69 0-1.25.56-1.25 1.25v11c0 .69.56 1.25 1.25 1.25h1.5c.69 0 1.25-.56 1.25-1.25v-11c0-.69-.56-1.25-1.25-1.25H8Zm6.5 0c-.69 0-1.25.56-1.25 1.25v11c0 .69.56 1.25 1.25 1.25H16c.69 0 1.25-.56 1.25-1.25v-11c0-.69-.56-1.25-1.25-1.25h-1.5Z"/></svg>`
const SVG_ACTIVE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" data-pointer="none" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#fff" d="M8.25 5.43a1.5 1.5 0 0 1 2.28-1.28l9.12 5.82a1.5 1.5 0 0 1 0 2.56l-9.12 5.82A1.5 1.5 0 0 1 8.25 16.97V5.43Z"/></svg>`
const TITLE_IDLE = '时停'
const TITLE_ACTIVE = '恢复'

const TIP_ROOT_SELECTORS = ['.bpx-player-dm-tip', '.bilibili-player-dm-tip-wrap', '.bilibili-player-dm-tip']
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
let processTipsHandler: ClickHandler | null = null

const isActiveForSource = (sourceId: string): boolean => {
  const activeId = getActiveSourceId()
  return activeId !== null && activeId === sourceId
}

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

/** 取得 tip 定位参考系（原生 left/top 相对 offsetParent，不是 viewport） */
const getTipPositionParent = (tip: HTMLElement): HTMLElement => {
  const parent = (tip.offsetParent as HTMLElement | null) || tip.parentElement
  return parent || document.body
}

const toParentPoint = (tip: HTMLElement, clientX: number, clientY: number): { x: number; y: number } => {
  const parent = getTipPositionParent(tip)
  const pr = parent.getBoundingClientRect()
  return { x: clientX - pr.left, y: clientY - pr.top }
}

/** 合并弹幕 tip 布局：原生胶囊外观 + 仅复制/时停 */
const applyMergedTipLayout = (tipRoot: HTMLElement): void => {
  tipRoot.classList.add(TIP_HOST_CLASS)
  tipRoot.style.setProperty('width', `${MERGED_TIP_WIDTH}px`, 'important')
  tipRoot.style.setProperty('height', `${MERGED_TIP_HEIGHT}px`, 'important')
  tipRoot.style.setProperty('pointer-events', 'auto', 'important')
  tipRoot.style.setProperty('visibility', 'visible', 'important')
  tipRoot.style.setProperty('opacity', '1', 'important')
  tipRoot.style.setProperty('z-index', '1000000', 'important')

  // 隐藏原生 SVG（固定 162 拉伸会变形），改用复刻胶囊底板
  tipRoot.querySelectorAll('.bpx-player-dm-tip-svgm, .bpx-player-dm-tip-svgl').forEach(node => {
    if (node instanceof HTMLElement) {
      node.style.setProperty('display', 'none', 'important')
    }
  })

  let bg = tipRoot.querySelector(`.${TIP_BG_CLASS}`) as HTMLElement | null
  if (!bg) {
    bg = document.createElement('div')
    bg.className = TIP_BG_CLASS
    bg.setAttribute('data-pointer', 'none')
    tipRoot.insertBefore(bg, tipRoot.firstChild)
  }

  // 仅复制 + 时停
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
    copy.style.setProperty('left', '14px', 'important')
    copy.style.setProperty('top', '5px', 'important')
    copy.style.setProperty('width', '32px', 'important')
    copy.style.setProperty('height', '32px', 'important')
    copy.style.setProperty('pointer-events', 'auto', 'important')
    copy.style.setProperty('z-index', '3', 'important')
    copy.style.setProperty('cursor', 'pointer', 'important')
  }
}

const clearMergedTipLayout = (tipRoot: Element): void => {
  tipRoot.classList.remove(TIP_HOST_CLASS)
  tipRoot.querySelector(`.${TIP_BG_CLASS}`)?.remove()
  if (tipRoot instanceof HTMLElement) {
    tipRoot.style.removeProperty('width')
    tipRoot.style.removeProperty('height')
    tipRoot.style.removeProperty('pointer-events')
    tipRoot.style.removeProperty('visibility')
    tipRoot.style.removeProperty('opacity')
    tipRoot.style.removeProperty('z-index')
    tipRoot.style.removeProperty('transform')
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
        node.style.removeProperty('pointer-events')
        node.style.removeProperty('z-index')
        node.style.removeProperty('cursor')
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

  btn.style.setProperty('left', '58px', 'important')
  btn.style.setProperty('top', '5px', 'important')
  btn.style.setProperty('width', '32px', 'important')
  btn.style.setProperty('height', '32px', 'important')
  btn.style.setProperty('pointer-events', 'auto', 'important')
  btn.style.setProperty('z-index', '4', 'important')
  btn.style.setProperty('cursor', 'pointer', 'important')

  btn.__dmMergerTimeStopOnClick = options.onClick
  btn.dataset.sourceId = options.sourceId
  renderButtonContent(btn, options.isActiveForSource)
}

const isTipVisuallyActive = (tipRoot: Element): boolean => {
  if (!(tipRoot instanceof HTMLElement)) {
    return false
  }
  if (tipRoot.classList.contains('bpx-player-hide')) {
    // 我们手动显示时会去掉 hide；仍 hide 则视为不可用
    const op = Number(getComputedStyle(tipRoot).opacity || '0')
    if (op === 0) {
      return false
    }
  }
  const style = getComputedStyle(tipRoot)
  if (style.display === 'none') {
    return false
  }
  const rect = tipRoot.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

const processVisibleTips = (onClick: ClickHandler): void => {
  document.querySelectorAll(TIP_ROOT_SELECTOR).forEach(tipRoot => {
    if (!isTipVisuallyActive(tipRoot)) {
      tipRoot.querySelector(`[${BTN_ATTR}]`)?.remove()
      // 不清理 layout：forceShow 可能刚显示，下一帧再处理
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
            renderButtonContent(btnNow, getActiveSourceId() === currentId)
          }
        }
      },
    })
  })
}

const resolveSourceIdFromDanmakuNode = (dmNode: Element): string | null => {
  if (dmNode instanceof HTMLElement) {
    if (dmNode.dataset.dmMergerSourceId) {
      return dmNode.dataset.dmMergerSourceId
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
      // tip 本身不计入弹幕命中
      if (node.closest('.bpx-player-dm-tip')) {
        continue
      }
      const hit = node.closest(DANMAKU_HOVER_SELECTOR)
      if (hit instanceof HTMLElement && !hit.classList.contains('dm-merger-time-stop-hidden')) {
        return hit
      }
    }
  } catch {
    // ignore
  }
  return null
}

/**
 * 在弹幕下方/上方显示 tip。
 * 关键：left/top 必须相对 tip.offsetParent，与原生一致，并带 translateX(-50%)。
 */
const forceShowTipNearElement = (el: HTMLElement): void => {
  const tip = document.querySelector('.bpx-player-dm-tip') as HTMLElement | null
  if (!tip) {
    return
  }

  const dmRect = el.getBoundingClientRect()
  const parent = getTipPositionParent(tip)
  const parentRect = parent.getBoundingClientRect()

  // 先套合并布局，确保 tip 盒尺寸正确再算位置
  applyMergedTipLayout(tip)

  const tipW = MERGED_TIP_WIDTH
  const tipH = MERGED_TIP_HEIGHT
  const centerClientX = dmRect.left + dmRect.width / 2
  const placeBelow = dmRect.bottom + 8 + tipH < window.innerHeight - 8
  const centerClientY = placeBelow ? dmRect.bottom + 8 + tipH / 2 : dmRect.top - 8 - tipH / 2

  // 原生 tip 的 top 是盒子顶部，left 是中心（配合 translateX(-50%)）
  const left = centerClientX - parentRect.left
  const top = placeBelow
    ? dmRect.bottom + 8 - parentRect.top
    : dmRect.top - 8 - tipH - parentRect.top

  tip.classList.remove('bpx-player-hide')
  tip.classList.remove(placeBelow ? 'bpx-player-showT' : 'bpx-player-showB')
  tip.classList.add(placeBelow ? 'bpx-player-showB' : 'bpx-player-showT')
  tip.style.left = `${left}px`
  tip.style.top = `${Math.max(0, top)}px`
  tip.style.transform = 'translateX(-50%)'
  tip.style.visibility = 'visible'
  tip.style.opacity = '1'
  tip.style.pointerEvents = 'auto'
  tip.style.zIndex = '1000000'

  // 同步 source 并注入按钮
  if (processTipsHandler) {
    processVisibleTips(processTipsHandler)
  }
}

const isPointerOverTimeStopUi = (
  target: EventTarget | null,
  clientX?: number,
  clientY?: number,
): boolean => {
  if (target instanceof Element && target.closest(`.${BTN_CLASS}, .bpx-player-dm-tip`)) {
    return true
  }
  if (Number.isFinite(clientX) && Number.isFinite(clientY)) {
    const tip = document.querySelector('.bpx-player-dm-tip') as HTMLElement | null
    if (tip && !tip.classList.contains('bpx-player-hide')) {
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
      mouseoverTimer = window.setTimeout(() => scheduleProcess(), 16)
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
      if (m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length)) {
        scheduleProcess()
        return
      }
    }
  })
  const observeRoot = resolveObserveRoot()
  observer.observe(observeRoot, { childList: true, subtree: true })

  document.addEventListener('mouseover', onPointerSample, true)
  document.addEventListener('mousemove', onPointerSample, true)
  scheduleProcess()

  return () => {
    stopped = true
    if (rafId) {
      window.cancelAnimationFrame(rafId)
    }
    if (pointerSampleRaf) {
      window.cancelAnimationFrame(pointerSampleRaf)
    }
    window.clearTimeout(mouseoverTimer)
    observer.disconnect()
    document.removeEventListener('mouseover', onPointerSample, true)
    document.removeEventListener('mousemove', onPointerSample, true)
    document.querySelectorAll(`[${BTN_ATTR}]`).forEach(n => n.remove())
    document.querySelectorAll(`.${TIP_HOST_CLASS}`).forEach(n => clearMergedTipLayout(n))
    lastHoveredSourceId = null
    lastHoveredText = null
    resolveFromElement = null
    processTipsHandler = null
  }
}
