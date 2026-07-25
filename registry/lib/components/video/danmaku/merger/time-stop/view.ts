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
/** 是否已安装 seek 拦截补丁 */
let seekPatchInstalled = false
/** 补丁前的原始方法 */
const patchedOriginals: Array<{ target: Record<string, unknown>; key: string; value: unknown }> = []

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

const patchMethod = (target: object | null | undefined, key: string, wrapper: (orig: (...args: unknown[]) => unknown) => (...args: unknown[]) => unknown): void => {
  if (!target || typeof target !== 'object') {
    return
  }
  const rec = target as Record<string, unknown>
  const orig = rec[key]
  if (typeof orig !== 'function') {
    return
  }
  // 避免重复包
  if ((orig as { __dmMergerTimeStopPatched?: boolean }).__dmMergerTimeStopPatched) {
    return
  }
  const bound = (orig as (...args: unknown[]) => unknown).bind(target)
  const next = wrapper(bound) as ((...args: unknown[]) => unknown) & {
    __dmMergerTimeStopPatched?: boolean
  }
  next.__dmMergerTimeStopPatched = true
  patchedOriginals.push({ target: rec, key, value: orig })
  rec[key] = next
}

/** 清空原生层可见弹幕（不动我们的覆盖层） */
const clearNativeVisibleDanmaku = (): void => {
  try {
    const dx = getDanmakuX() as (DanmakuXLike & {
      clear?: () => void
      fresh?: () => void
      manager?: { clear?: () => void; endClear?: () => void; clearVisualArray?: () => void }
    }) | null
    dx?.manager?.clearVisualArray?.()
    dx?.manager?.clear?.()
    dx?.manager?.endClear?.()
    dx?.clear?.()
  } catch {
    // ignore
  }
  // DOM 兜底：隐藏原生容器内节点
  queryDanmakuElements().forEach(el => {
    el.classList.add(TIME_STOP_HIDDEN_CLASS)
    el.classList.remove(TIME_STOP_ACTIVE_CLASS)
  })
}

/** seek/play 后原生会重刷：立刻再停、再清 */
const suppressNativeAfterSeek = (): void => {
  try {
    getDanmakuX()?.pause?.()
  } catch {
    // ignore
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
  clearNativeVisibleDanmaku()
}

const installSeekPatches = (): void => {
  if (seekPatchInstalled) {
    return
  }
  seekPatchInstalled = true
  const dx = getDanmakuX() as (DanmakuXLike & Record<string, unknown>) | null
  const mgr = (dx as { manager?: Record<string, unknown> } | null)?.manager

  // seek / play / fresh 后阻止新弹幕出现
  ;['seek', 'play', 'fresh', 'reset'].forEach(key => {
    patchMethod(dx, key, orig => (...args) => {
      const ret = orig(...args)
      // 异步重刷窗口内反复压制
      suppressNativeAfterSeek()
      ;[0, 16, 32, 64, 120, 240, 400].forEach(ms => {
        window.setTimeout(suppressNativeAfterSeek, ms)
      })
      return ret
    })
  })
  ;['fresh', 'render', 'fetchAndInitDm', 'insert', 'add', 'addList', 'multipleAdd'].forEach(key => {
    patchMethod(mgr, key, orig => (...args) => {
      // 时停期间直接吞掉会刷屏的写入/渲染
      suppressNativeAfterSeek()
      return undefined
    })
  })
}

const uninstallSeekPatches = (): void => {
  while (patchedOriginals.length) {
    const item = patchedOriginals.pop()
    if (!item) {
      continue
    }
    try {
      item.target[item.key] = item.value
    } catch {
      // ignore
    }
  }
  seekPatchInstalled = false
}

/**
 * 冻结原生弹幕输出：
 * 1) pause DanmakuX
 * 2) close 原生弹幕开关（防止 seek 重开渲染）
 * 3) 安装 seek/play/fresh 补丁，seek 后继续压制
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
    } catch {
      // ignore
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

  installSeekPatches()
  clearNativeVisibleDanmaku()
}

/** 恢复原生弹幕引擎 */
export const resumeNativeDanmakuEngine = (): void => {
  uninstallSeekPatches()

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
  if (dx && engineWasRunning !== false) {
    try {
      dx.play?.()
    } catch {
      // ignore
    }
  }
  engineWasRunning = null
}

/** 仅暂停动画，不清除 animation 名（避免 transform 回弹导致取样漂移） */
const pauseElementMotion = (el: HTMLElement): void => {
  try {
    el.getAnimations?.().forEach(a => {
      a.pause()
    })
  } catch {
    // 部分环境无 getAnimations
  }
  el.style.animationPlayState = 'paused'
  el.style.transition = 'none'
}

/** 取样完成后，彻底冻住原生节点（可回弹，反正已隐藏） */
const hardFreezeNativeElement = (el: HTMLElement): void => {
  el.style.animation = 'none'
  el.style.transition = 'none'
  el.style.transform = 'none'
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

/** 播放器画面宿主：用于挂覆盖层与裁剪 */
const resolveVideoHost = (): HTMLElement => {
  const preferred = [
    '.bpx-player-video-area',
    '.bpx-player-video-wrap',
    '.bpx-player-primary-area',
    '.bpx-player-container',
    '#bilibili-player',
    '.player-wrap',
  ]
  for (const sel of preferred) {
    const el = document.querySelector(sel)
    if (el instanceof HTMLElement) {
      return el
    }
  }
  return document.body
}

/** 用 fixed 覆盖层对齐当前播放器画面，overflow 裁剪越界克隆 */
const syncOverlayToVideoHost = (overlay: HTMLElement): DOMRect => {
  const host = resolveVideoHost()
  const rect = host.getBoundingClientRect()
  overlay.style.position = 'fixed'
  overlay.style.left = `${rect.left}px`
  overlay.style.top = `${rect.top}px`
  overlay.style.width = `${rect.width}px`
  overlay.style.height = `${rect.height}px`
  overlay.style.right = 'auto'
  overlay.style.bottom = 'auto'
  overlay.style.overflow = 'hidden'
  overlay.style.pointerEvents = 'none'
  overlay.style.zIndex = '50'
  if (overlay.parentElement !== document.body) {
    document.body.appendChild(overlay)
  }
  return rect
}

/** 确保存在独立覆盖层（挂 body + fixed，避免被播放器内部布局影响） */
const ensureOverlay = (): HTMLElement => {
  let overlay = document.querySelector(`.${TIME_STOP_OVERLAY_CLASS}`) as HTMLElement | null
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.className = TIME_STOP_OVERLAY_CLASS
    overlay.setAttribute('data-dm-merger-time-stop-overlay', '1')
    document.body.appendChild(overlay)
  }
  syncOverlayToVideoHost(overlay)
  return overlay
}

const removeOverlay = (): void => {
  document.querySelectorAll(`.${TIME_STOP_OVERLAY_CLASS}`).forEach(node => node.remove())
}

/** 屏幕坐标 → 覆盖层本地坐标（覆盖层本身是 fixed 对齐播放器） */
const toOverlayLocalRect = (
  overlay: HTMLElement,
  screenRect: PinnedDanmakuRef['freezeRect'],
): PinnedDanmakuRef['freezeRect'] => {
  const hostRect = overlay.getBoundingClientRect()
  return {
    left: screenRect.left - hostRect.left,
    top: screenRect.top - hostRect.top,
    width: screenRect.width,
    height: screenRect.height,
  }
}

/** 屏幕矩形是否与播放器画面有交集 */
const intersectsHost = (screenRect: PinnedDanmakuRef['freezeRect'], host: DOMRect): boolean => {
  return !(
    screenRect.left + screenRect.width <= host.left ||
    screenRect.left >= host.right ||
    screenRect.top + screenRect.height <= host.top ||
    screenRect.top >= host.bottom
  )
}

/** freezeRect 现为屏幕坐标：是否仍与当前播放器画面相交 */
const isScreenVisibleInHost = (
  screenRect: PinnedDanmakuRef['freezeRect'],
  host: DOMRect,
): boolean => intersectsHost(screenRect, host)

/** 把节点样式复制到覆盖层克隆，并按覆盖层本地坐标钉死 */
const createFrozenClone = (
  sourceEl: HTMLElement,
  rect: PinnedDanmakuRef['freezeRect'],
  overlay: HTMLElement,
): HTMLElement => {
  const clone = sourceEl.cloneNode(true) as HTMLElement
  clone.classList.add(TIME_STOP_CLONE_CLASS, TIME_STOP_ACTIVE_CLASS)
  clone.classList.remove(TIME_STOP_HIDDEN_CLASS)
  clone.style.cssText = ''
  const computed = getComputedStyle(sourceEl)
  const local = toOverlayLocalRect(overlay, rect)
  clone.style.position = 'absolute'
  clone.style.left = `${local.left}px`
  clone.style.top = `${local.top}px`
  clone.style.width = `${local.width}px`
  clone.style.height = `${local.height}px`
  clone.style.margin = '0'
  clone.style.transform = 'none'
  clone.style.animation = 'none'
  clone.style.transition = 'none'
  clone.style.zIndex = '40'
  // 允许悬停命中，以唤起 tip（点击仍可穿透到下层的由 menu 处理）
  clone.style.pointerEvents = 'auto'
  clone.style.cursor = 'default'
  clone.style.visibility = 'visible'
  clone.style.opacity = computed.opacity && computed.opacity !== '0' ? computed.opacity : '1'
  clone.style.color = computed.color
  clone.style.fontSize = computed.fontSize
  clone.style.fontFamily = computed.fontFamily
  clone.style.fontWeight = computed.fontWeight
  clone.style.lineHeight = computed.lineHeight
  clone.style.whiteSpace = computed.whiteSpace || 'nowrap'
  clone.style.textShadow = computed.textShadow
  clone.style.webkitTextStroke = (computed as CSSStyleDeclaration & { webkitTextStroke?: string })
    .webkitTextStroke || ''
  ;['--opacity', '--fontSize', '--fontFamily', '--color'].forEach(key => {
    const val = sourceEl.style.getPropertyValue(key) || computed.getPropertyValue(key)
    if (val) {
      clone.style.setProperty(key, val)
    }
  })
  return clone
}

/** 按覆盖层本地坐标应用位置 */
const applyLocalCloneRect = (
  clone: HTMLElement,
  local: PinnedDanmakuRef['freezeRect'],
): void => {
  clone.style.position = 'absolute'
  clone.style.left = `${local.left}px`
  clone.style.top = `${local.top}px`
  clone.style.width = `${local.width}px`
  clone.style.height = `${local.height}px`
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

  // 关键：先量位置并生成覆盖层克隆，再暂停/关闭原生弹幕。
  // 若先 close/pause，原生层可能瞬间重排，导致定格坐标漂移。
  const overlay = ensureOverlay()
  overlay.innerHTML = ''

  const pinned: PinnedDanmakuRef[] = []
  const elements = queryDanmakuElements()
  const hostRect = overlay.getBoundingClientRect()

  elements.forEach(el => {
    if (!matchSourceElement(sourceId, el, deps)) {
      return
    }

    // 关键顺序：先读几何（含 transform 位移）→ 再 pause → 再克隆
    // 禁止在取样前 animation:none，否则滚动弹幕会瞬间回弹导致漂移
    const prevStyle = backupPrevStyle(el)
    const screenRect = readFreezeRect(el)
    if (!intersectsHost(screenRect, hostRect)) {
      el.classList.add(TIME_STOP_HIDDEN_CLASS)
      return
    }

    pauseElementMotion(el)

    const dmid = readDmidFromElement(el) || `text:${sourceId}:${pinned.length}`
    // freezeRect 存屏幕坐标，维持/resize 时再换算到覆盖层
    const freezeRect = { ...screenRect }
    const clone = createFrozenClone(el, screenRect, overlay)
    clone.dataset.dmMergerSourceId = String(sourceId)
    clone.dataset.dmMergerDmid = dmid
    overlay.appendChild(clone)

    // 取样完成后再硬冻并隐藏原节点
    hardFreezeNativeElement(el)
    el.classList.add(TIME_STOP_HIDDEN_CLASS)
    el.classList.remove(TIME_STOP_ACTIVE_CLASS)

    pinned.push({ dmid, el, prevStyle, freezeRect, cloneEl: clone })
  })

  // 克隆完成后再压制原生引擎
  pauseNativeDanmakuEngine()
  // 再藏一轮 close 后可能新冒出的原生节点
  queryDanmakuElements().forEach(el => {
    el.classList.add(TIME_STOP_HIDDEN_CLASS)
    el.classList.remove(TIME_STOP_ACTIVE_CLASS)
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

  // 每次维持先对齐覆盖层到当前播放器盒
  const hostRect = syncOverlayToVideoHost(overlay)

  pinned.forEach(ref => {
    if (ref.el.isConnected) {
      ref.el.classList.add(TIME_STOP_HIDDEN_CLASS)
      ref.el.classList.remove(TIME_STOP_ACTIVE_CLASS)
      pauseElementMotion(ref.el)
      hardFreezeNativeElement(ref.el)
    }

    if (!isScreenVisibleInHost(ref.freezeRect, hostRect)) {
      ref.cloneEl?.remove()
      nextPinned.push({ ...ref, cloneEl: undefined })
      return
    }

    const local = toOverlayLocalRect(overlay, ref.freezeRect)
    let clone = ref.cloneEl
    if (!clone || !clone.isConnected) {
      const sourceForStyle = ref.el.isConnected ? ref.el : null
      if (sourceForStyle) {
        clone = createFrozenClone(sourceForStyle, ref.freezeRect, overlay)
      } else {
        clone = document.createElement('div')
        clone.className = `${TIME_STOP_CLONE_CLASS} ${TIME_STOP_ACTIVE_CLASS}`
        applyLocalCloneRect(clone, local)
      }
      clone.dataset.dmMergerSourceId = clone.dataset.dmMergerSourceId || ''
      overlay.appendChild(clone)
    } else {
      applyLocalCloneRect(clone, local)
      clone.classList.add(TIME_STOP_CLONE_CLASS, TIME_STOP_ACTIVE_CLASS)
    }
    clone.style.pointerEvents = 'auto'

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
