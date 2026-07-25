/**
 * 合并弹幕 tip：复用原生胶囊 SVG，只保留「复制 + 时停」。
 * 不替换底板、不硬抢显示动画，减少闪烁。
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

const SVG_IDLE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" data-pointer="none" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#fff" d="M8 5.25c-.69 0-1.25.56-1.25 1.25v11c0 .69.56 1.25 1.25 1.25h1.5c.69 0 1.25-.56 1.25-1.25v-11c0-.69-.56-1.25-1.25-1.25H8Zm6.5 0c-.69 0-1.25.56-1.25 1.25v11c0 .69.56 1.25 1.25 1.25H16c.69 0 1.25-.56 1.25-1.25v-11c0-.69-.56-1.25-1.25-1.25h-1.5Z"/></svg>`
const SVG_ACTIVE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" data-pointer="none" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#fff" d="M8.25 5.43a1.5 1.5 0 0 1 2.28-1.28l9.12 5.82a1.5 1.5 0 0 1 0 2.56l-9.12 5.82A1.5 1.5 0 0 1 8.25 16.97V5.43Z"/></svg>`

const TIP_ROOT_SELECTORS = ['.bpx-player-dm-tip']
const DANMAKU_HOVER_SELECTORS = [
  '.bili-danmaku-x-dm',
  '.bili-dm',
  '.b-danmaku',
  '.bpx-player-dm-itm',
  '.dm-merger-time-stop-clone',
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
let lastHoveredEl: HTMLElement | null = null
let resolveFromElement: TimeStopDeps['resolveSourceIdFromElement'] | null = null
let onClickHandler: ClickHandler | null = null
let holdTipUntil = 0

const isActiveForSource = (sourceId: string): boolean => getActiveSourceId() === sourceId

const renderButtonContent = (btn: HTMLElement, isActive: boolean): void => {
  const label = isActive ? LABEL_ACTIVE : LABEL_IDLE
  btn.innerHTML = isActive ? SVG_ACTIVE : SVG_IDLE
  let bubble = btn.querySelector(`.${TIP_BUBBLE_CLASS}`) as HTMLElement | null
  if (!bubble) {
    bubble = document.createElement('div')
    bubble.className = TIP_BUBBLE_CLASS
    bubble.setAttribute('role', 'tooltip')
    btn.appendChild(bubble)
  }
  bubble.textContent = label
  btn.setAttribute('aria-label', label)
  btn.removeAttribute('title')
}

/**
 * 只用原生 tip 外壳：
 * - 保留原生 svgm 胶囊（不改 SVG、不自定义底板）
 * - 隐藏点赞/举报
 * - 复制 + 时停按原生三槽中间两格位置排布
 */
const applyMergedTipLayout = (tip: HTMLElement): void => {
  tip.classList.add(TIP_HOST_CLASS)
  // 去掉我们以前写坏的尺寸/强制显示
  tip.style.removeProperty('width')
  tip.style.removeProperty('height')
  tip.querySelector(`.dm-merger-time-stop-tip-bg`)?.remove()

  // 确保原生胶囊可见
  tip.querySelectorAll('.bpx-player-dm-tip-svgm, .bpx-player-dm-tip-svgl').forEach(node => {
    if (node instanceof HTMLElement) {
      node.style.removeProperty('display')
      node.style.removeProperty('opacity')
      node.style.removeProperty('width')
      node.style.removeProperty('height')
    }
  })
  // 双按钮时用中等胶囊 svgl（原生 145），更接近两动作密度
  const svgm = tip.querySelector('.bpx-player-dm-tip-svgm') as HTMLElement | null
  const svgl = tip.querySelector('.bpx-player-dm-tip-svgl') as HTMLElement | null
  if (svgm && svgl) {
    // showB/showT 用 svgm；showL/R 用 svgl。常规下方 tip 保持 svgm
    // 不改 path，仅确保当前朝向那张显示
  }

  tip
    .querySelectorAll(
      '.bpx-player-dm-tip-like, .bpx-player-dm-tip-like-num, .bpx-player-dm-tip-recall, .bpx-player-dm-tip-back',
    )
    .forEach(node => {
      if (node instanceof HTMLElement) {
        node.style.setProperty('display', 'none', 'important')
      }
    })

  const copy = tip.querySelector('.bpx-player-dm-tip-copy') as HTMLElement | null
  if (copy) {
    // 原生三槽：like=13, copy=64, back=120。两按钮时把 copy/时停收到中间更均衡
    copy.style.setProperty('display', 'flex', 'important')
    copy.style.setProperty('left', '36px', 'important')
    copy.style.setProperty('top', '8px', 'important')
    copy.style.setProperty('width', '32px', 'important')
    copy.style.setProperty('height', '32px', 'important')
    copy.style.setProperty('pointer-events', 'auto', 'important')
    copy.style.setProperty('z-index', '3', 'important')
  }
}

const clearMergedTipLayout = (tipRoot: Element): void => {
  tipRoot.classList.remove(TIP_HOST_CLASS)
  tipRoot.querySelector(`.dm-merger-time-stop-tip-bg`)?.remove()
  tipRoot
    .querySelectorAll(
      '.bpx-player-dm-tip-like, .bpx-player-dm-tip-like-num, .bpx-player-dm-tip-recall, .bpx-player-dm-tip-back, .bpx-player-dm-tip-copy',
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
      }
    })
}

const ensureTimeStopButton = (
  tipRoot: Element,
  options: { sourceId: string; isActiveForSource: boolean; onClick: () => void },
): void => {
  if (!(tipRoot instanceof HTMLElement)) {
    return
  }
  applyMergedTipLayout(tipRoot)

  let btn = tipRoot.querySelector(`[${BTN_ATTR}]`) as ButtonHost | null
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
    ;['mouseenter', 'mousemove', 'mouseover'].forEach(type => {
      btn!.addEventListener(type, e => e.stopPropagation())
    })
    tipRoot.appendChild(btn)
  }

  btn.style.setProperty('left', '90px', 'important')
  btn.style.setProperty('top', '8px', 'important')
  btn.style.setProperty('width', '32px', 'important')
  btn.style.setProperty('height', '32px', 'important')
  btn.style.setProperty('pointer-events', 'auto', 'important')
  btn.style.setProperty('z-index', '4', 'important')
  btn.__dmMergerTimeStopOnClick = options.onClick
  btn.dataset.sourceId = options.sourceId
  renderButtonContent(btn, options.isActiveForSource)
}

const tipLooksShown = (tip: HTMLElement): boolean => {
  if (tip.classList.contains('bpx-player-hide') && Date.now() > holdTipUntil) {
    return false
  }
  const s = getComputedStyle(tip)
  if (s.display === 'none') {
    return false
  }
  const r = tip.getBoundingClientRect()
  // 动画中 opacity 可能仍是 0，只要盒子在就视为可注入
  return r.width > 0 && r.height > 0
}

const injectIfMergedTipVisible = (): void => {
  const tip = document.querySelector('.bpx-player-dm-tip') as HTMLElement | null
  if (!tip || !onClickHandler) {
    return
  }

  // tip 可见时，若还没有 source，按 tip 中心反查下方弹幕
  let sourceId = lastHoveredSourceId
  if (!sourceId && tipLooksShown(tip)) {
    const tr = tip.getBoundingClientRect()
    // tip 上方是弹幕，取 tip 上方一点
    const probeX = tr.left + tr.width / 2
    const probeY = tr.top - 12
    const dm = hitDanmakuElementAtPoint(probeX, probeY)
    if (dm) {
      sourceId = resolveSourceIdFromDanmakuNode(dm)
      if (sourceId) {
        lastHoveredSourceId = sourceId
        lastHoveredEl = dm as HTMLElement
      }
    }
  }

  if (!sourceId) {
    if (tip.classList.contains(TIP_HOST_CLASS) && Date.now() > holdTipUntil) {
      tip.querySelector(`[${BTN_ATTR}]`)?.remove()
      clearMergedTipLayout(tip)
    }
    return
  }

  // 合并源：tip 一出现就注入，不必等 opacity 动画结束
  const shown =
    tipLooksShown(tip) ||
    !tip.classList.contains('bpx-player-hide') ||
    Date.now() <= holdTipUntil
  if (!shown) {
    return
  }

  ensureTimeStopButton(tip, {
    sourceId,
    isActiveForSource: isActiveForSource(sourceId),
    onClick: () => {
      const id = lastHoveredSourceId || sourceId
      if (!id || !onClickHandler) {
        return
      }
      onClickHandler(id)
      const btn = tip.querySelector(`[${BTN_ATTR}]`) as HTMLElement | null
      if (btn) {
        renderButtonContent(btn, getActiveSourceId() === id)
      }
    },
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
  // 1) 优先命中 pe:auto 的克隆
  try {
    for (const node of document.elementsFromPoint(clientX, clientY)) {
      if (!(node instanceof Element)) {
        continue
      }
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

  // 2) 原生弹幕 pe:none，elementsFromPoint 常扫不到：按包围盒回退
  let best: { node: Element; area: number } | null = null
  document.querySelectorAll(DANMAKU_HOVER_SELECTOR).forEach(node => {
    if (!(node instanceof HTMLElement)) {
      return
    }
    if (node.classList.contains('dm-merger-time-stop-hidden')) {
      return
    }
    const style = getComputedStyle(node)
    if (style.display === 'none' || style.visibility === 'hidden') {
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

/**
 * 仅在「原生 tip 不会出现」时（时停克隆）手动定位 tip。
 * 普通合并弹幕交给原生 tip 弹出，我们只改内容，避免抢动画导致闪烁。
 */
const forceShowTipForClone = (el: HTMLElement): void => {
  const tip = document.querySelector('.bpx-player-dm-tip') as HTMLElement | null
  if (!tip) {
    return
  }
  const parent = (tip.offsetParent as HTMLElement | null) || tip.parentElement || document.body
  const parentRect = parent.getBoundingClientRect()
  const dmRect = el.getBoundingClientRect()
  const tipH = 48
  const placeBelow = dmRect.bottom + 10 + tipH < window.innerHeight - 8
  const left = dmRect.left + dmRect.width / 2 - parentRect.left
  const top = placeBelow
    ? dmRect.bottom + 8 - parentRect.top
    : dmRect.top - tipH - 8 - parentRect.top

  tip.classList.remove('bpx-player-hide')
  tip.classList.remove(placeBelow ? 'bpx-player-showT' : 'bpx-player-showB')
  tip.classList.add(placeBelow ? 'bpx-player-showB' : 'bpx-player-showT')
  tip.style.left = `${left}px`
  tip.style.top = `${Math.max(0, top)}px`
  tip.style.transform = 'translateX(-50%)'
  tip.style.visibility = 'visible'
  tip.style.opacity = '1'
  tip.style.pointerEvents = 'auto'
  holdTipUntil = Date.now() + 400
  injectIfMergedTipVisible()
}

const isOverTip = (target: EventTarget | null, x?: number, y?: number): boolean => {
  if (target instanceof Element && target.closest('.bpx-player-dm-tip, .dm-merger-time-stop-btn')) {
    return true
  }
  if (Number.isFinite(x) && Number.isFinite(y)) {
    const tip = document.querySelector('.bpx-player-dm-tip') as HTMLElement | null
    if (tip && !tip.classList.contains('bpx-player-hide')) {
      const r = tip.getBoundingClientRect()
      if (x! >= r.left && x! <= r.right && y! >= r.top && y! <= r.bottom) {
        return true
      }
    }
  }
  return false
}

const updateHoveredSourceFromEvent = (event: Event): void => {
  const target = event.target
  const x = 'clientX' in event ? Number((event as MouseEvent).clientX) : NaN
  const y = 'clientY' in event ? Number((event as MouseEvent).clientY) : NaN
  if (isOverTip(target, x, y)) {
    // 停在 tip 上：保持合并布局
    if (lastHoveredSourceId) {
      holdTipUntil = Date.now() + 300
      injectIfMergedTipVisible()
    }
    return
  }

  let dmNode: Element | null = null
  if (target instanceof Element) {
    dmNode = target.closest(DANMAKU_HOVER_SELECTOR)
  }
  if (!dmNode && Number.isFinite(x) && Number.isFinite(y)) {
    dmNode = hitDanmakuElementAtPoint(x, y)
  }
  if (!dmNode || !(dmNode instanceof HTMLElement)) {
    return
  }

  const sourceId = resolveSourceIdFromDanmakuNode(dmNode)
  lastHoveredText = readDanmakuTextFromElement(dmNode) || lastHoveredText
  lastHoveredSourceId = sourceId
  lastHoveredEl = dmNode

  if (!sourceId) {
    return
  }

  // 克隆：原生不会弹 tip，需要我们补
  if (dmNode.classList.contains('dm-merger-time-stop-clone')) {
    forceShowTipForClone(dmNode)
    return
  }

  // 普通合并弹幕：等原生 tip 弹出后注入（不抢位置，不闪）
  holdTipUntil = Date.now() + 250
  injectIfMergedTipVisible()
  window.requestAnimationFrame(injectIfMergedTipVisible)
  window.setTimeout(injectIfMergedTipVisible, 32)
  window.setTimeout(injectIfMergedTipVisible, 80)
  window.setTimeout(injectIfMergedTipVisible, 160)
}

export const startTimeStopMenu = (options: TimeStopMenuOptions): (() => void) => {
  onClickHandler = options.onClick
  resolveFromElement = options.resolveSourceIdFromElement || null
  let stopped = false
  let pointerRaf = 0
  let lastEv: Event | null = null

  const onPointer = (event: Event) => {
    lastEv = event
    if (pointerRaf) {
      return
    }
    pointerRaf = window.requestAnimationFrame(() => {
      pointerRaf = 0
      if (!stopped && lastEv) {
        updateHoveredSourceFromEvent(lastEv)
      }
    })
  }

  const tipObserver = new MutationObserver(() => {
    if (!stopped) {
      injectIfMergedTipVisible()
    }
  })

  const watchTip = (tip: Element) => {
    tipObserver.observe(tip, {
      attributes: true,
      attributeFilter: ['class', 'style'],
      childList: true,
      subtree: true,
    })
  }

  const bodyObserver = new MutationObserver(() => {
    const tip = document.querySelector('.bpx-player-dm-tip')
    if (tip) {
      watchTip(tip)
      injectIfMergedTipVisible()
    }
  })
  bodyObserver.observe(document.documentElement, { childList: true, subtree: true })
  const existed = document.querySelector('.bpx-player-dm-tip')
  if (existed) {
    watchTip(existed)
  }

  document.addEventListener('mouseover', onPointer, true)
  document.addEventListener('mousemove', onPointer, true)

  return () => {
    stopped = true
    if (pointerRaf) {
      window.cancelAnimationFrame(pointerRaf)
    }
    tipObserver.disconnect()
    bodyObserver.disconnect()
    document.removeEventListener('mouseover', onPointer, true)
    document.removeEventListener('mousemove', onPointer, true)
    document.querySelectorAll(`[${BTN_ATTR}]`).forEach(n => n.remove())
    document.querySelectorAll(`.${TIP_HOST_CLASS}`).forEach(n => clearMergedTipLayout(n))
    lastHoveredSourceId = null
    lastHoveredText = null
    lastHoveredEl = null
    resolveFromElement = null
    onClickHandler = null
  }
}
