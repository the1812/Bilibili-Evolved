/**
 * 合并弹幕 tip：复用原生胶囊，仅保留「复制 + 时停」。
 * - 普通合并弹幕：不抢定位，等原生 tip 弹出后只改按钮
 * - 时停克隆：原生不会弹 tip，才手动显示；鼠标离开必须收回
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
const FORCED_TIP_ATTR = 'data-dm-merger-forced-tip'

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
let lastHoveredEl: HTMLElement | null = null
let resolveFromElement: TimeStopDeps['resolveSourceIdFromElement'] | null = null
let onClickHandler: ClickHandler | null = null
let injectTimer = 0
let hideTimer = 0
/** 是否由我们强制显示了 tip（仅克隆场景） */
let forcedTipVisible = false
/** 最近一次指针屏幕坐标：enter/release 后用于重同步 tip */
let lastPointerX = 0
let lastPointerY = 0
/** 正在写 tip 定位，避免 MutationObserver 回环 */
let writingForcedTip = false
/**
 * enter 后 tip 已贴到 clone，但指针仍停在旧点击坐标。
 * sticky 期间不因「指针不在 tip/clone 上」自动隐藏，直到指针重新进入 tip/clone。
 */
let stickyForcedTip = false

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

/** 复用原生胶囊：不改 SVG 底板，只藏点赞/举报，排复制+时停 */
const applyMergedTipLayout = (tip: HTMLElement): void => {
  tip.classList.add(TIP_HOST_CLASS)
  tip.querySelector('.dm-merger-time-stop-tip-bg')?.remove()

  // 绝不同时显示两张 SVG。按朝向只保留一张原生底板。
  const showTop = tip.classList.contains('bpx-player-showT')
  const showSide =
    tip.classList.contains('bpx-player-showL') ||
    tip.classList.contains('bpx-player-showR') ||
    tip.classList.contains('bpx-player-showLT') ||
    tip.classList.contains('bpx-player-showRT')
  const svgm = tip.querySelector('.bpx-player-dm-tip-svgm') as HTMLElement | null
  const svgl = tip.querySelector('.bpx-player-dm-tip-svgl') as HTMLElement | null
  if (svgm && svgl) {
    if (showSide) {
      svgm.style.setProperty('opacity', '0', 'important')
      svgl.style.removeProperty('opacity')
      svgl.style.removeProperty('display')
    } else {
      // 下方/上方：用 svgm（带尖角）
      svgl.style.setProperty('opacity', '0', 'important')
      svgm.style.removeProperty('opacity')
      svgm.style.removeProperty('display')
    }
    // 不要 display:block !important 双开
    if (showTop) {
      // 原生 showT 会旋转 svgm，保持默认即可
    }
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

  // 原生槽位 like=13 / copy=64 / back=120。两按钮用 like+copy 槽，胶囊更自然
  const copy = tip.querySelector('.bpx-player-dm-tip-copy') as HTMLElement | null
  if (copy) {
    copy.style.setProperty('display', 'flex', 'important')
    copy.style.setProperty('left', '13px', 'important')
    copy.style.setProperty('top', showTop ? '10px' : '8px', 'important')
    copy.style.setProperty('width', '32px', 'important')
    copy.style.setProperty('height', showTop ? '20px' : '32px', 'important')
    copy.style.setProperty('pointer-events', 'auto', 'important')
    copy.style.setProperty('z-index', '3', 'important')
  }
}

const clearMergedTipLayout = (tipRoot: Element): void => {
  tipRoot.classList.remove(TIP_HOST_CLASS)
  tipRoot.querySelector('.dm-merger-time-stop-tip-bg')?.remove()
  tipRoot.querySelector(`[${BTN_ATTR}]`)?.remove()
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
        node.style.removeProperty('opacity')
      }
    })
}

/** 清掉强制 tip 写入的定位属性，交还原生 absolute 布局 */
const clearForcedTipPosition = (tip: HTMLElement): void => {
  tip.style.removeProperty('position')
  tip.style.removeProperty('left')
  tip.style.removeProperty('top')
  tip.style.removeProperty('right')
  tip.style.removeProperty('bottom')
  tip.style.removeProperty('transform')
  tip.style.removeProperty('z-index')
  tip.style.removeProperty('margin')
}

/** 收回我们强制显示的 tip，避免恢复后残留 */
const hideForcedTip = (): void => {
  stickyForcedTip = false
  const tip = document.querySelector('.bpx-player-dm-tip') as HTMLElement | null
  if (!tip) {
    forcedTipVisible = false
    return
  }
  clearMergedTipLayout(tip)
  if (forcedTipVisible || tip.getAttribute(FORCED_TIP_ATTR) === '1') {
    tip.setAttribute(FORCED_TIP_ATTR, '0')
    tip.classList.add('bpx-player-hide')
    tip.classList.remove('bpx-player-showB', 'bpx-player-showT', 'bpx-player-showL', 'bpx-player-showR')
    tip.style.visibility = 'hidden'
    tip.style.opacity = '0'
    tip.style.pointerEvents = 'none'
    clearForcedTipPosition(tip)
  }
  forcedTipVisible = false
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

  const showTop = tip.classList.contains('bpx-player-showT')
  // 原生 copy 槽
  btn.style.setProperty('left', '64px', 'important')
  btn.style.setProperty('top', showTop ? '10px' : '8px', 'important')
  btn.style.setProperty('width', '32px', 'important')
  btn.style.setProperty('height', showTop ? '20px' : '32px', 'important')
  btn.style.setProperty('pointer-events', 'auto', 'important')
  btn.style.setProperty('z-index', '4', 'important')
  btn.__dmMergerTimeStopOnClick = () => {
    onClickHandler?.(sourceId)
    // 点击恢复后，若已无 active，收起强制 tip
    window.setTimeout(() => {
      if (!isActiveForSource(sourceId) && !document.querySelector('.dm-merger-time-stop-clone')) {
        lastHoveredSourceId = null
        lastHoveredEl = null
        hideForcedTip()
      } else {
        renderButtonContent(btn as HTMLElement, isActiveForSource(sourceId))
      }
    }, 0)
  }
  btn.dataset.sourceId = sourceId
  renderButtonContent(btn, isActiveForSource(sourceId))
}

const tipIsUsable = (tip: HTMLElement): boolean => {
  const s = getComputedStyle(tip)
  if (s.display === 'none') {
    return false
  }
  if (tip.classList.contains('bpx-player-hide') && Number(s.opacity || '0') === 0 && !forcedTipVisible) {
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
    if (tip.classList.contains(TIP_HOST_CLASS) || forcedTipVisible) {
      hideForcedTip()
    }
    return
  }
  if (!tipIsUsable(tip) && !forcedTipVisible) {
    return
  }
  ensureTimeStopButton(tip, lastHoveredSourceId)
}

const scheduleInject = (): void => {
  window.clearTimeout(injectTimer)
  injectTimer = window.setTimeout(() => injectIfNeeded(), 40)
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
  const roots = document.querySelectorAll(
    '.bpx-player-row-dm-wrap, .bpx-player-dm-mask-wrap, .dm-merger-time-stop-overlay, .bpx-player-video-area',
  )
  const nodes: Element[] = []
  if (roots.length) {
    roots.forEach(root => root.querySelectorAll(DANMAKU_HOVER_SELECTOR).forEach(n => nodes.push(n)))
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

/**
 * 仅克隆场景：用 fixed 按 clone 屏幕矩形定位 tip。
 * 原生 tip 是 absolute + offsetParent=video-area；定格 clone 在 body 覆盖层，
 * 继续用 offsetParent 坐标会和悬停弹幕脱节。fixed 直接跟屏幕矩形。
 */
const forceShowTipNearClone = (el: HTMLElement): void => {
  const tip = document.querySelector('.bpx-player-dm-tip') as HTMLElement | null
  if (!tip) {
    return
  }
  const dmRect = el.getBoundingClientRect()
  if (dmRect.width <= 0 || dmRect.height <= 0) {
    return
  }
  const tipH = tip.offsetHeight || 48
  const tipW = tip.offsetWidth || 162
  const gap = 8
  const placeBelow = dmRect.bottom + gap + tipH < window.innerHeight - 8
  // 水平：弹幕中心；贴边时钳制，避免整颗 tip 出屏
  let left = dmRect.left + dmRect.width / 2
  const half = tipW / 2
  left = Math.min(Math.max(left, half + 4), window.innerWidth - half - 4)
  let top = placeBelow ? dmRect.bottom + gap : dmRect.top - tipH - gap
  top = Math.min(Math.max(top, 4), window.innerHeight - tipH - 4)

  writingForcedTip = true
  try {
    tip.setAttribute(FORCED_TIP_ATTR, '1')
    forcedTipVisible = true
    tip.classList.remove('bpx-player-hide')
    tip.classList.remove('bpx-player-showT', 'bpx-player-showB', 'bpx-player-showL', 'bpx-player-showR')
    tip.classList.add(placeBelow ? 'bpx-player-showB' : 'bpx-player-showT')
    // fixed + 屏幕坐标：与覆盖层 clone 同一坐标系
    tip.style.setProperty('position', 'fixed', 'important')
    tip.style.setProperty('left', `${left}px`, 'important')
    tip.style.setProperty('top', `${top}px`, 'important')
    tip.style.setProperty('right', 'auto', 'important')
    tip.style.setProperty('bottom', 'auto', 'important')
    tip.style.setProperty('margin', '0', 'important')
    tip.style.setProperty('transform', 'translateX(-50%)', 'important')
    tip.style.setProperty('visibility', 'visible', 'important')
    tip.style.setProperty('opacity', '1', 'important')
    tip.style.setProperty('pointer-events', 'auto', 'important')
    tip.style.setProperty('z-index', '1000000', 'important')
  } finally {
    // 属性变更异步进 observer，延后一帧再放行
    window.requestAnimationFrame(() => {
      writingForcedTip = false
    })
  }
}

/** 在当前指针位置重新命中并定位 tip（普通移动后调用） */
export const resyncTimeStopTipAtPointer = (): void => {
  if (!onClickHandler) {
    return
  }
  onPointerMove({
    clientX: lastPointerX,
    clientY: lastPointerY,
    target: document.elementFromPoint(lastPointerX, lastPointerY),
  } as unknown as MouseEvent)
}

/**
 * enter 后强制把 tip 贴到定格 clone。
 * 点击时停时指针常在 tip 按钮上，bbox 命中拿不到 clone，必须主动选最近 clone。
 */
export const attachForcedTipToClones = (sourceId?: string | null): void => {
  if (!onClickHandler) {
    return
  }
  const active = sourceId || getActiveSourceId()
  if (!active) {
    hideForcedTip()
    return
  }
  const clones = Array.from(
    document.querySelectorAll(`.dm-merger-time-stop-clone`),
  ).filter((node): node is HTMLElement => node instanceof HTMLElement)
  if (!clones.length) {
    hideForcedTip()
    return
  }

  // 优先：仍可见的 lastHoveredEl 若是 clone；否则取距指针最近的 clone
  let target: HTMLElement | null = null
  if (lastHoveredEl?.isConnected && lastHoveredEl.classList.contains('dm-merger-time-stop-clone')) {
    target = lastHoveredEl
  } else {
    let bestDist = Number.POSITIVE_INFINITY
    clones.forEach(clone => {
      const r = clone.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) {
        return
      }
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = cx - lastPointerX
      const dy = cy - lastPointerY
      const d = dx * dx + dy * dy
      if (d < bestDist) {
        bestDist = d
        target = clone
      }
    })
  }
  if (!target) {
    target = clones[0]
  }

  lastHoveredSourceId = active
  lastHoveredEl = target
  // enter 瞬间指针不在 clone 上：先粘住，避免被 leave 定时器立刻藏掉
  stickyForcedTip = true
  window.clearTimeout(hideTimer)
  forceShowTipNearClone(target)
  injectIfNeeded()
}

const isOverTipOrClone = (target: EventTarget | null, x: number, y: number): boolean => {
  if (target instanceof Element) {
    if (target.closest('.bpx-player-dm-tip, .dm-merger-time-stop-btn, .dm-merger-time-stop-clone')) {
      return true
    }
  }
  const tip = document.querySelector('.bpx-player-dm-tip') as HTMLElement | null
  if (tip && forcedTipVisible) {
    const r = tip.getBoundingClientRect()
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return true
    }
  }
  // sticky 阶段也要把当前 clone 矩形算进 hover 区
  if (forcedTipVisible && lastHoveredEl?.classList.contains('dm-merger-time-stop-clone')) {
    const r = lastHoveredEl.getBoundingClientRect()
    if (r.width > 0 && r.height > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return true
    }
  }
  return false
}

const keepStickyForcedTip = (): void => {
  if (!stickyForcedTip || !forcedTipVisible) {
    return
  }
  if (lastHoveredEl?.isConnected && lastHoveredEl.classList.contains('dm-merger-time-stop-clone')) {
    forceShowTipNearClone(lastHoveredEl)
    injectIfNeeded()
  }
}

const onPointerMove = (event: MouseEvent): void => {
  const { clientX: x, clientY: y, target } = event
  lastPointerX = x
  lastPointerY = y

  // 仍在 tip / 当前克隆上：保持
  if (isOverTipOrClone(target, x, y)) {
    // 指针已回到 tip/clone：结束 sticky，之后按正常离开逻辑
    stickyForcedTip = false
    if (lastHoveredSourceId) {
      // 若还在某个 clone 上，跟随更新位置
      const dm =
        (target instanceof Element &&
          (target.closest('.dm-merger-time-stop-clone') as HTMLElement | null)) ||
        (hitDanmakuElementAtPoint(x, y) as HTMLElement | null)
      if (dm?.classList.contains('dm-merger-time-stop-clone')) {
        lastHoveredEl = dm
        forceShowTipNearClone(dm)
        injectIfNeeded()
      } else if (
        forcedTipVisible &&
        lastHoveredEl?.isConnected &&
        lastHoveredEl.classList.contains('dm-merger-time-stop-clone')
      ) {
        // 指针在 tip 上时 hit 不到 clone：继续按上次 clone 贴位
        forceShowTipNearClone(lastHoveredEl)
        injectIfNeeded()
      } else {
        scheduleInject()
      }
    }
    window.clearTimeout(hideTimer)
    return
  }

  let dmNode: Element | null = null
  if (target instanceof Element) {
    dmNode = target.closest(DANMAKU_HOVER_SELECTOR)
  }
  if (!dmNode) {
    dmNode = hitDanmakuElementAtPoint(x, y)
  }

  if (!dmNode || !(dmNode instanceof HTMLElement)) {
    // enter 后 tip 已贴到 clone，指针仍在旧坐标：先粘住不藏
    if (stickyForcedTip && forcedTipVisible) {
      window.clearTimeout(hideTimer)
      keepStickyForcedTip()
      return
    }
    // 离开弹幕：延迟隐藏强制 tip，避免移向 tip 按钮时闪断
    window.clearTimeout(hideTimer)
    hideTimer = window.setTimeout(() => {
      if (stickyForcedTip && forcedTipVisible) {
        return
      }
      lastHoveredSourceId = null
      lastHoveredEl = null
      hideForcedTip()
    }, 120)
    return
  }

  window.clearTimeout(hideTimer)
  const sourceId = resolveSourceIdFromDanmakuNode(dmNode)
  lastHoveredSourceId = sourceId
  lastHoveredEl = dmNode

  if (!sourceId) {
    // 原生弹幕：清掉我们的改动，让原生 tip 自己管
    if (forcedTipVisible || document.querySelector(`.${TIP_HOST_CLASS}`)) {
      hideForcedTip()
    }
    return
  }

  if (dmNode.classList.contains('dm-merger-time-stop-clone')) {
    forceShowTipNearClone(dmNode)
    injectIfNeeded()
    return
  }

  // 普通合并弹幕：不强制定位，等原生 tip，只注入按钮
  if (forcedTipVisible) {
    // 离开克隆后不要残留强制 tip
    hideForcedTip()
  }
  scheduleInject()
}

export const startTimeStopMenu = (options: TimeStopMenuOptions): (() => void) => {
  onClickHandler = options.onClick
  resolveFromElement = options.resolveSourceIdFromElement || null

  let tipObserver: MutationObserver | null = null
  const bindTipObserver = () => {
    const tip = document.querySelector('.bpx-player-dm-tip')
    if (!tip || tipObserver) {
      return
    }
    tipObserver = new MutationObserver(() => {
      if (writingForcedTip) {
        return
      }
      // 原生 tip 显示/隐藏时同步我们的双按钮
      if (forcedTipVisible && lastHoveredEl?.classList.contains('dm-merger-time-stop-clone')) {
        // 原生可能回写 left/top/class：重新按 clone 贴位
        forceShowTipNearClone(lastHoveredEl)
        injectIfNeeded()
        return
      }
      if (lastHoveredSourceId) {
        scheduleInject()
      } else if (!forcedTipVisible) {
        const t = document.querySelector(`.${TIP_HOST_CLASS}`)
        if (t) {
          clearMergedTipLayout(t)
        }
      }
    })
    tipObserver.observe(tip, {
      attributes: true,
      attributeFilter: ['class', 'style'],
      childList: true,
    })
  }
  bindTipObserver()
  let tries = 0
  const waitTip = window.setInterval(() => {
    tries += 1
    bindTipObserver()
    if (tipObserver || tries > 20) {
      window.clearInterval(waitTip)
    }
  }, 500)

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
    window.clearTimeout(hideTimer)
    if (raf) {
      window.cancelAnimationFrame(raf)
    }
    tipObserver?.disconnect()
    document.removeEventListener('mousemove', onMove, true)
    stickyForcedTip = false
    hideForcedTip()
    document.querySelectorAll(`[${BTN_ATTR}]`).forEach(n => n.remove())
    document.querySelectorAll(`.${TIP_HOST_CLASS}`).forEach(n => clearMergedTipLayout(n))
    lastHoveredSourceId = null
    lastHoveredEl = null
    resolveFromElement = null
    onClickHandler = null
  }
}
