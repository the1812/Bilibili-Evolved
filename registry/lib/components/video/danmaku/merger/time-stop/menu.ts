/**
 * 合并弹幕 tip：复用原生胶囊，仅保留「复制 + 时停」。
 * 轻量实现：无全页 observer、无轮询、无全量扫弹幕。
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

const DANMAKU_HOVER_SELECTOR = [
  '.bili-danmaku-x-dm',
  '.bili-dm',
  '.b-danmaku',
  '.bpx-player-dm-itm',
  '.dm-merger-time-stop-clone',
].join(', ')

type ClickHandler = (sourceId: string) => void
export interface TimeStopMenuOptions {
  onClick: ClickHandler
  resolveSourceIdFromElement?: TimeStopDeps['resolveSourceIdFromElement']
}
interface ButtonHost extends HTMLElement {
  __dmMergerTimeStopOnClick?: () => void
}

let lastHoveredSourceId: string | null = null
let resolveFromElement: TimeStopDeps['resolveSourceIdFromElement'] | null = null
let onClickHandler: ClickHandler | null = null
let injectTimer = 0

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

/** 复用原生胶囊，只隐藏点赞/举报，保留复制并加时停 */
const applyMergedTipLayout = (tip: HTMLElement): void => {
  tip.classList.add(TIP_HOST_CLASS)
  tip.style.removeProperty('width')
  tip.style.removeProperty('height')
  tip.querySelector('.dm-merger-time-stop-tip-bg')?.remove()

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
    copy.style.setProperty('display', 'flex', 'important')
    copy.style.setProperty('left', '36px', 'important')
    copy.style.setProperty('top', '8px', 'important')
    copy.style.setProperty('width', '32px', 'important')
    copy.style.setProperty('height', '32px', 'important')
    copy.style.setProperty('pointer-events', 'auto', 'important')
    copy.style.setProperty('z-index', '3', 'important')
  }

  tip.querySelectorAll('.bpx-player-dm-tip-svgm, .bpx-player-dm-tip-svgl').forEach(node => {
    if (node instanceof HTMLElement) {
      node.style.removeProperty('display')
      node.style.removeProperty('opacity')
    }
  })
}

const clearMergedTipLayout = (tipRoot: Element): void => {
  tipRoot.classList.remove(TIP_HOST_CLASS)
  tipRoot.querySelector('.dm-merger-time-stop-tip-bg')?.remove()
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

const ensureTimeStopButton = (tip: HTMLElement, sourceId: string): void => {
  applyMergedTipLayout(tip)

  let btn = tip.querySelector(`[${BTN_ATTR}]`) as ButtonHost | null
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
    tip.appendChild(btn)
  }

  btn.style.setProperty('left', '90px', 'important')
  btn.style.setProperty('top', '8px', 'important')
  btn.style.setProperty('width', '32px', 'important')
  btn.style.setProperty('height', '32px', 'important')
  btn.style.setProperty('pointer-events', 'auto', 'important')
  btn.style.setProperty('z-index', '4', 'important')
  btn.__dmMergerTimeStopOnClick = () => {
    onClickHandler?.(sourceId)
    renderButtonContent(btn as HTMLElement, isActiveForSource(sourceId))
  }
  btn.dataset.sourceId = sourceId
  renderButtonContent(btn, isActiveForSource(sourceId))
}

const tipIsUsable = (tip: HTMLElement): boolean => {
  // 我们手动显示时可能还带着 hide class 一帧，以 opacity/尺寸为准
  const s = getComputedStyle(tip)
  if (s.display === 'none') {
    return false
  }
  if (tip.classList.contains('bpx-player-hide') && Number(s.opacity || '0') === 0) {
    return false
  }
  const r = tip.getBoundingClientRect()
  return r.width > 0 && r.height > 0
}

const injectIfNeeded = (): void => {
  const tip = document.querySelector('.bpx-player-dm-tip') as HTMLElement | null
  if (!tip || !onClickHandler) {
    return
  }
  if (!lastHoveredSourceId) {
    if (tip.classList.contains(TIP_HOST_CLASS)) {
      tip.querySelector(`[${BTN_ATTR}]`)?.remove()
      clearMergedTipLayout(tip)
    }
    return
  }
  if (!tipIsUsable(tip)) {
    return
  }
  ensureTimeStopButton(tip, lastHoveredSourceId)
}

const scheduleInject = (): void => {
  window.clearTimeout(injectTimer)
  injectTimer = window.setTimeout(() => {
    injectIfNeeded()
  }, 50)
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

/** pe:none 弹幕：包围盒命中，不做全页昂贵扫描之外的额外工作 */
const hitDanmakuElementAtPoint = (clientX: number, clientY: number): Element | null => {
  try {
    for (const node of document.elementsFromPoint(clientX, clientY)) {
      if (!(node instanceof Element) || node.closest('.bpx-player-dm-tip')) {
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

  let best: { node: Element; area: number } | null = null
  // 只扫播放器内弹幕容器，避免 document 全量
  const roots = document.querySelectorAll(
    '.bpx-player-row-dm-wrap, .bpx-player-dm-mask-wrap, .dm-merger-time-stop-overlay, .bpx-player-video-area',
  )
  const nodes: Element[] = []
  if (roots.length) {
    roots.forEach(root => {
      root.querySelectorAll(DANMAKU_HOVER_SELECTOR).forEach(n => nodes.push(n))
    })
  } else {
    document.querySelectorAll(DANMAKU_HOVER_SELECTOR).forEach(n => nodes.push(n))
  }

  nodes.forEach(node => {
    if (!(node instanceof HTMLElement) || node.classList.contains('dm-merger-time-stop-hidden')) {
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

/** 时停克隆：原生 tip 不会弹出，需手动放到克隆附近 */
const forceShowTipNearClone = (el: HTMLElement): void => {
  const tip = document.querySelector('.bpx-player-dm-tip') as HTMLElement | null
  if (!tip) {
    return
  }
  const parent = (tip.offsetParent as HTMLElement | null) || tip.parentElement || document.body
  const parentRect = parent.getBoundingClientRect()
  const dmRect = el.getBoundingClientRect()
  const tipH = tip.offsetHeight || 48
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
  tip.style.zIndex = '1000000'
}

const onPointerMove = (event: MouseEvent): void => {
  const target = event.target
  if (target instanceof Element && target.closest('.bpx-player-dm-tip, .dm-merger-time-stop-btn')) {
    if (lastHoveredSourceId) {
      scheduleInject()
    }
    return
  }

  let dmNode: Element | null = null
  if (target instanceof Element) {
    dmNode = target.closest(DANMAKU_HOVER_SELECTOR)
  }
  if (!dmNode) {
    dmNode = hitDanmakuElementAtPoint(event.clientX, event.clientY)
  }
  if (!dmNode || !(dmNode instanceof HTMLElement)) {
    return
  }

  const sourceId = resolveSourceIdFromDanmakuNode(dmNode)
  lastHoveredSourceId = sourceId
  if (!sourceId) {
    return
  }

  // 定格克隆：原节点已隐藏，原生 tip 不会出现，必须手动显示
  if (dmNode.classList.contains('dm-merger-time-stop-clone')) {
    forceShowTipNearClone(dmNode)
    // 立刻注入，不等 50ms，避免鼠标移开前看不到
    injectIfNeeded()
    scheduleInject()
    return
  }

  scheduleInject()
}

export const startTimeStopMenu = (options: TimeStopMenuOptions): (() => void) => {
  onClickHandler = options.onClick
  resolveFromElement = options.resolveSourceIdFromElement || null

  // 只观察 tip 自身，不观察整页
  let tipObserver: MutationObserver | null = null
  const bindTipObserver = () => {
    const tip = document.querySelector('.bpx-player-dm-tip')
    if (!tip || tipObserver) {
      return
    }
    tipObserver = new MutationObserver(() => {
      scheduleInject()
    })
    tipObserver.observe(tip, {
      attributes: true,
      attributeFilter: ['class', 'style'],
      childList: true,
    })
  }
  bindTipObserver()
  // tip 可能晚挂载：轻量轮询几次即可，不做永久 interval
  let tries = 0
  const waitTip = window.setInterval(() => {
    tries += 1
    bindTipObserver()
    if (tipObserver || tries > 20) {
      window.clearInterval(waitTip)
    }
  }, 500)

  // mousemove 节流
  let raf = 0
  let lastEv: MouseEvent | null = null
  const onMove = (event: MouseEvent) => {
    lastEv = event
    if (raf) {
      return
    }
    raf = window.requestAnimationFrame(() => {
      raf = 0
      if (lastEv) {
        onPointerMove(lastEv)
      }
    })
  }

  document.addEventListener('mousemove', onMove, true)

  return () => {
    window.clearInterval(waitTip)
    window.clearTimeout(injectTimer)
    if (raf) {
      window.cancelAnimationFrame(raf)
    }
    tipObserver?.disconnect()
    document.removeEventListener('mousemove', onMove, true)
    document.querySelectorAll(`[${BTN_ATTR}]`).forEach(n => n.remove())
    document.querySelectorAll(`.${TIP_HOST_CLASS}`).forEach(n => clearMergedTipLayout(n))
    lastHoveredSourceId = null
    resolveFromElement = null
    onClickHandler = null
  }
}
