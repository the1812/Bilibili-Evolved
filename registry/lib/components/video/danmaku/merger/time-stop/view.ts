import type { PinnedDanmakuRef, TimeStopDeps } from './types'
import { parseSourceIdFromDmid, readDmidFromContext } from './source-id'

/** 时停高亮节点 class */
export const TIME_STOP_ACTIVE_CLASS = 'dm-merger-time-stop-active'
/** 时停隐藏节点 class */
export const TIME_STOP_HIDDEN_CLASS = 'dm-merger-time-stop-hidden'
/** 时停进行中根 class（挂在 html） */
export const TIME_STOP_ROOT_CLASS = 'dm-merger-time-stop-on'
/** 定格覆盖层 class */
export const TIME_STOP_OVERLAY_CLASS = 'dm-merger-time-stop-overlay'
/** 覆盖层内克隆节点 class */
export const TIME_STOP_CLONE_CLASS = 'dm-merger-time-stop-clone'

/**
 * 画面弹幕节点选择器。
 * 默认值取自仓库内 airborne 组件 class token 与 bpx 布局；
 * 不同播放器版本若漏匹配，需在浏览器实测后补充。
 */
const DANMAKU_SELECTORS = [
  '.bili-danmaku-x-dm',
  '.bpx-player-row-dm-wrap .bili-danmaku-x-dm',
  '.bili-dm',
  '.b-danmaku',
  '.bpx-player-dm-wrap .bpx-player-dm-itm',
]

type DanmakuXLike = {
  pause?: () => void
  play?: () => void
  isRunning?: boolean
  container?: HTMLElement
}

type PlayerDanmakuApi = {
  getDanmakuX?: () => DanmakuXLike | null | undefined
  open?: () => void
  close?: () => void
  isOpen?: () => boolean
}

/** 进入时停前是否正在运行原生弹幕引擎 */
let engineWasRunning: boolean | null = null
/** 是否用 close 关掉过原生弹幕开关 */
let closedNativeSwitch = false

/** 从节点取 dmid（dataset / 属性） */
const readDmidFromElement = (el: HTMLElement): string | null => readDmidFromContext(el)

/** 收集当前页面可见的弹幕 DOM 节点（去重） */
export const queryDanmakuElements = (): HTMLElement[] => {
  const set = new Set<HTMLElement>()
  DANMAKU_SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach(node => {
      if (node instanceof HTMLElement) {
        // 跳过我们自己的克隆层
        if (node.closest(`.${TIME_STOP_OVERLAY_CLASS}`)) {
          return
        }
        set.add(node)
      }
    })
  })
  return Array.from(set)
}

const getPlayerDanmakuApi = (): PlayerDanmakuApi | null => {
  try {
    const p = (window as unknown as { player?: { danmaku?: PlayerDanmakuApi } }).player
    return p?.danmaku || null
  } catch {
    return null
  }
}

const getDanmakuX = (): DanmakuXLike | null => {
  try {
    const api = getPlayerDanmakuApi()
    const dx = api?.getDanmakuX?.()
    return dx || null
  } catch {
    return null
  }
}

/**
 * 暂停原生弹幕引擎，阻止 seek/方向键后继续刷出新弹幕。
 * 优先 dx.pause()；失败再 close 开关（恢复时会 open）。
 */
export const pauseNativeDanmakuEngine = (): void => {
  const dx = getDanmakuX()
  if (dx) {
    try {
      engineWasRunning = !!dx.isRunning
    } catch {
      engineWasRunning = null
    }
    try {
      dx.pause?.()
      return
    } catch {
      // fallthrough
    }
  }

  const api = getPlayerDanmakuApi()
  try {
    if (api && typeof api.isOpen === 'function' && api.isOpen() && typeof api.close === 'function') {
      api.close()
      closedNativeSwitch = true
    }
  } catch {
    // ignore
  }
}

/** 恢复原生弹幕引擎 */
export const resumeNativeDanmakuEngine = (): void => {
  const api = getPlayerDanmakuApi()
  if (closedNativeSwitch) {
    try {
      api?.open?.()
    } catch {
      // ignore
    }
    closedNativeSwitch = false
  }

  const dx = getDanmakuX()
  if (dx && engineWasRunning) {
    try {
      dx.play?.()
    } catch {
      // ignore
    }
  }
  engineWasRunning = null
}

/** 暂停 Web Animation / CSS animation / transition */
const pauseElementMotion = (el: HTMLElement): void => {
  try {
    el.getAnimations?.().forEach(a => {
      a.pause()
    })
  } catch {
    // 部分环境无 getAnimations
  }
  el.style.animationPlayState = 'paused'
  el.style.animation = 'none'
  el.style.transition = 'none'
}

/** 恢复 Web Animation 与 CSS animation */
const resumeElementMotion = (el: HTMLElement, prevPlayState: string): void => {
  try {
    el.getAnimations?.().forEach(a => {
      a.play()
    })
  } catch {
    // ignore
  }
  el.style.animationPlayState = prevPlayState
}

/** 读取屏幕矩形 */
const readFreezeRect = (el: HTMLElement): PinnedDanmakuRef['freezeRect'] => {
  const rect = el.getBoundingClientRect()
  return {
    left: rect.left,
    top: rect.top,
    width: Math.max(rect.width, 1),
    height: Math.max(rect.height, 1),
  }
}

/** 确保存在独立覆盖层（不在 DanmakuX 容器内，避免被 clear/seek 清掉） */
const ensureOverlay = (): HTMLElement => {
  let overlay = document.querySelector(`.${TIME_STOP_OVERLAY_CLASS}`) as HTMLElement | null
  if (overlay) {
    return overlay
  }
  overlay = document.createElement('div')
  overlay.className = TIME_STOP_OVERLAY_CLASS
  overlay.setAttribute('data-dm-merger-time-stop-overlay', '1')

  // 挂到播放器区域，保证全屏/小窗仍可见
  const host =
    document.querySelector(
      '.bpx-player-video-area, .bpx-player-primary-area, .bpx-player-container, #bilibili-player, .player-wrap',
    ) || document.body
  host.appendChild(overlay)
  return overlay
}

const removeOverlay = (): void => {
  document.querySelectorAll(`.${TIME_STOP_OVERLAY_CLASS}`).forEach(node => node.remove())
}

/** 把节点样式复制到覆盖层克隆，并按屏幕坐标钉死 */
const createFrozenClone = (
  sourceEl: HTMLElement,
  rect: PinnedDanmakuRef['freezeRect'],
): HTMLElement => {
  const clone = sourceEl.cloneNode(true) as HTMLElement
  clone.classList.add(TIME_STOP_CLONE_CLASS, TIME_STOP_ACTIVE_CLASS)
  clone.classList.remove(TIME_STOP_HIDDEN_CLASS)
  // 去掉可能的交互/动画 class 影响
  clone.style.cssText = ''
  const computed = getComputedStyle(sourceEl)
  clone.style.position = 'fixed'
  clone.style.left = `${rect.left}px`
  clone.style.top = `${rect.top}px`
  clone.style.width = `${rect.width}px`
  clone.style.height = `${rect.height}px`
  clone.style.margin = '0'
  clone.style.transform = 'none'
  clone.style.animation = 'none'
  clone.style.transition = 'none'
  clone.style.zIndex = '40'
  clone.style.pointerEvents = 'none'
  clone.style.opacity = computed.opacity || '1'
  clone.style.color = computed.color
  clone.style.fontSize = computed.fontSize
  clone.style.fontFamily = computed.fontFamily
  clone.style.fontWeight = computed.fontWeight
  clone.style.lineHeight = computed.lineHeight
  clone.style.whiteSpace = computed.whiteSpace || 'nowrap'
  clone.style.textShadow = computed.textShadow
  clone.style.webkitTextStroke = (computed as CSSStyleDeclaration & { webkitTextStroke?: string })
    .webkitTextStroke || ''
  // 同步 CSS 变量（字号/透明度等）
  ;['--opacity', '--fontSize', '--fontFamily', '--color'].forEach(key => {
    const val = sourceEl.style.getPropertyValue(key) || computed.getPropertyValue(key)
    if (val) {
      clone.style.setProperty(key, val)
    }
  })
  return clone
}

const applyCloneRect = (clone: HTMLElement, rect: PinnedDanmakuRef['freezeRect']): void => {
  clone.style.position = 'fixed'
  clone.style.left = `${rect.left}px`
  clone.style.top = `${rect.top}px`
  clone.style.width = `${rect.width}px`
  clone.style.height = `${rect.height}px`
  clone.style.transform = 'none'
  clone.style.animation = 'none'
  clone.style.transition = 'none'
}

/** 备份钉住前的关键 inline style */
const backupPrevStyle = (el: HTMLElement): PinnedDanmakuRef['prevStyle'] => ({
  transform: el.style.transform,
  left: el.style.left,
  top: el.style.top,
  width: el.style.width,
  height: el.style.height,
  position: el.style.position,
  right: el.style.right,
  bottom: el.style.bottom,
  margin: el.style.margin,
  zIndex: el.style.zIndex,
  animation: el.style.animation,
  transition: el.style.transition,
  animationPlayState: el.style.animationPlayState,
})

/** 按备份还原 inline style */
const restorePrevStyle = (el: HTMLElement, prev: PinnedDanmakuRef['prevStyle']): void => {
  el.style.transform = prev.transform
  el.style.left = prev.left
  el.style.top = prev.top
  el.style.width = prev.width
  el.style.height = prev.height
  el.style.position = prev.position
  el.style.right = prev.right
  el.style.bottom = prev.bottom
  el.style.margin = prev.margin
  el.style.zIndex = prev.zIndex
  el.style.animation = prev.animation
  el.style.transition = prev.transition
  el.style.animationPlayState = prev.animationPlayState
}

/** 节点是否属于指定合并源：优先 dmid，其次 deps 回落 */
const matchSourceElement = (
  sourceId: string,
  el: HTMLElement,
  deps?: Pick<TimeStopDeps, 'isElementOfSource'>,
): boolean => {
  const dmid = readDmidFromElement(el)
  const sid = parseSourceIdFromDmid(dmid)
  if (sid) {
    return sid === sourceId
  }
  if (deps?.isElementOfSource) {
    return deps.isElementOfSource(sourceId, el)
  }
  return false
}

/**
 * 钉住并高亮指定 sourceId 的合并弹幕。
 * 原生层节点隐藏；视觉定格放到独立覆盖层，避免 DanmakuX seek/clear 刷新冲掉。
 */
export const pinAndHighlight = (
  sourceId: string,
  deps?: Pick<TimeStopDeps, 'isElementOfSource'>,
): PinnedDanmakuRef[] => {
  document.documentElement.classList.add(TIME_STOP_ROOT_CLASS)
  pauseNativeDanmakuEngine()

  const overlay = ensureOverlay()
  overlay.innerHTML = ''

  const pinned: PinnedDanmakuRef[] = []
  const elements = queryDanmakuElements()

  elements.forEach(el => {
    if (!matchSourceElement(sourceId, el, deps)) {
      return
    }

    const dmid = readDmidFromElement(el) || `text:${sourceId}:${pinned.length}`
    const prevStyle = backupPrevStyle(el)
    const freezeRect = readFreezeRect(el)
    pauseElementMotion(el)

    // 原节点隐藏（仍可能被原生层回收）；画面显示用克隆
    el.classList.add(TIME_STOP_HIDDEN_CLASS)
    el.classList.remove(TIME_STOP_ACTIVE_CLASS)

    const clone = createFrozenClone(el, freezeRect)
    overlay.appendChild(clone)

    pinned.push({ dmid, el, prevStyle, freezeRect, cloneEl: clone })
  })

  return pinned
}

/**
 * 隐藏非当前源的合并弹幕与全部原生弹幕。
 * 当前 sourceId 的节点保持可见（已由 pinAndHighlight 标记 active）。
 */
export const hideOthers = (
  sourceId: string,
  deps?: Pick<TimeStopDeps, 'isElementOfSource'>,
): void => {
  document.documentElement.classList.add(TIME_STOP_ROOT_CLASS)

  queryDanmakuElements().forEach(el => {
    if (el.classList.contains(TIME_STOP_ACTIVE_CLASS)) {
      return
    }
    // 同源原节点也隐藏（显示走覆盖层克隆）
    if (matchSourceElement(sourceId, el, deps)) {
      el.classList.add(TIME_STOP_HIDDEN_CLASS)
      return
    }
    el.classList.add(TIME_STOP_HIDDEN_CLASS)
  })
}

/**
 * 时停维持：seek / 方向键后
 * - 继续暂停原生引擎
 * - 覆盖层克隆按进入时坐标钉住
 * - 原生层新冒出的弹幕全部隐藏
 */
export const maintainTimeStopView = (
  _sourceId: string,
  pinned: PinnedDanmakuRef[],
  _deps?: Pick<TimeStopDeps, 'isElementOfSource'>,
): PinnedDanmakuRef[] => {
  document.documentElement.classList.add(TIME_STOP_ROOT_CLASS)
  pauseNativeDanmakuEngine()

  const overlay = ensureOverlay()
  const nextPinned: PinnedDanmakuRef[] = []

  pinned.forEach(ref => {
    // 原节点若还在，继续隐藏
    if (ref.el.isConnected) {
      ref.el.classList.add(TIME_STOP_HIDDEN_CLASS)
      ref.el.classList.remove(TIME_STOP_ACTIVE_CLASS)
      pauseElementMotion(ref.el)
    }

    let clone = ref.cloneEl
    if (!clone || !clone.isConnected) {
      // 覆盖层被清掉时重建
      const sourceForStyle = ref.el.isConnected ? ref.el : null
      clone = sourceForStyle
        ? createFrozenClone(sourceForStyle, ref.freezeRect)
        : (() => {
            const node = document.createElement('div')
            node.className = `${TIME_STOP_CLONE_CLASS} ${TIME_STOP_ACTIVE_CLASS}`
            node.textContent = ''
            applyCloneRect(node, ref.freezeRect)
            return node
          })()
      overlay.appendChild(clone)
    } else {
      applyCloneRect(clone, ref.freezeRect)
      clone.classList.add(TIME_STOP_CLONE_CLASS, TIME_STOP_ACTIVE_CLASS)
    }

    nextPinned.push({ ...ref, cloneEl: clone })
  })

  // 原生层一切未定格节点隐藏
  queryDanmakuElements().forEach(el => {
    el.classList.remove(TIME_STOP_ACTIVE_CLASS)
    el.classList.add(TIME_STOP_HIDDEN_CLASS)
  })

  return nextPinned
}

/**
 * 清理时停画面效果：还原钉住节点、去掉 hidden、去掉根 class。
 * @param pinned 进入时停时记录的钉住列表；缺省时按 class 查找 active 节点做尽力还原
 */
export const clearView = (pinned?: PinnedDanmakuRef[]): void => {
  const list =
    pinned && pinned.length > 0
      ? pinned
      : Array.from(document.querySelectorAll(`.${TIME_STOP_ACTIVE_CLASS}`))
          .filter((n): n is HTMLElement => n instanceof HTMLElement)
          .map(el => ({
            dmid: readDmidFromElement(el) || '',
            el,
            prevStyle: {
              transform: '',
              left: '',
              top: '',
              width: '',
              height: '',
              position: '',
              right: '',
              bottom: '',
              margin: '',
              zIndex: '',
              animation: '',
              transition: '',
              animationPlayState: '',
            },
            freezeRect: { left: 0, top: 0, width: 0, height: 0 },
            cloneEl: undefined,
          }))

  list.forEach(ref => {
    const { el, prevStyle } = ref
    if (ref.cloneEl?.isConnected) {
      ref.cloneEl.remove()
    }
    if (!el.isConnected) {
      return
    }
    el.classList.remove(TIME_STOP_ACTIVE_CLASS)
    el.classList.remove(TIME_STOP_HIDDEN_CLASS)
    restorePrevStyle(el, prevStyle)
    resumeElementMotion(el, prevStyle.animationPlayState)
  })

  document.querySelectorAll(`.${TIME_STOP_HIDDEN_CLASS}`).forEach(node => {
    if (node instanceof HTMLElement) {
      node.classList.remove(TIME_STOP_HIDDEN_CLASS)
    }
  })

  removeOverlay()
  document.documentElement.classList.remove(TIME_STOP_ROOT_CLASS)
  resumeNativeDanmakuEngine()
}
