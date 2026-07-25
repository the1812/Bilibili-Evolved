import type { PinnedDanmakuRef, TimeStopDeps } from './types'
import { parseSourceIdFromDmid, readDmidFromContext } from './source-id'

/** 时停高亮节点 class */
export const TIME_STOP_ACTIVE_CLASS = 'dm-merger-time-stop-active'
/** 时停隐藏节点 class */
export const TIME_STOP_HIDDEN_CLASS = 'dm-merger-time-stop-hidden'
/** 时停进行中根 class（挂在 html） */
export const TIME_STOP_ROOT_CLASS = 'dm-merger-time-stop-on'

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

/** 从节点取 dmid（dataset / 属性） */
const readDmidFromElement = (el: HTMLElement): string | null => readDmidFromContext(el)

/** 收集当前页面可见的弹幕 DOM 节点（去重） */
export const queryDanmakuElements = (): HTMLElement[] => {
  const set = new Set<HTMLElement>()
  DANMAKU_SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach(node => {
      if (node instanceof HTMLElement) {
        set.add(node)
      }
    })
  })
  return Array.from(set)
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

/** 按进入时停时的屏幕坐标强制定格（不受 seek/方向键影响） */
const applyFreezeRect = (el: HTMLElement, rect: PinnedDanmakuRef['freezeRect']): void => {
  el.style.position = 'fixed'
  el.style.left = `${rect.left}px`
  el.style.top = `${rect.top}px`
  el.style.right = 'auto'
  el.style.bottom = 'auto'
  el.style.width = `${rect.width}px`
  el.style.height = `${rect.height}px`
  el.style.margin = '0'
  el.style.transform = 'none'
  el.style.zIndex = '30'
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
 * 返回已钉住的节点列表，供状态机与 clearView 使用。
 */
export const pinAndHighlight = (
  sourceId: string,
  deps?: Pick<TimeStopDeps, 'isElementOfSource'>,
): PinnedDanmakuRef[] => {
  document.documentElement.classList.add(TIME_STOP_ROOT_CLASS)

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
    applyFreezeRect(el, freezeRect)
    el.classList.add(TIME_STOP_ACTIVE_CLASS)
    el.classList.remove(TIME_STOP_HIDDEN_CLASS)

    pinned.push({ dmid, el, prevStyle, freezeRect })
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
    // 同源合并弹幕不隐藏；其余（其他合并源 + 原生）全部隐藏
    if (matchSourceElement(sourceId, el, deps)) {
      return
    }
    el.classList.add(TIME_STOP_HIDDEN_CLASS)
  })
}

/**
 * 时停维持：seek / 方向键后
 * - 已定格节点继续按进入时的屏幕坐标钉住
 * - 新冒出的弹幕（含同源新节点）一律隐藏，避免跟着进度跑
 */
export const maintainTimeStopView = (
  sourceId: string,
  pinned: PinnedDanmakuRef[],
  _deps?: Pick<TimeStopDeps, 'isElementOfSource'>,
): PinnedDanmakuRef[] => {
  document.documentElement.classList.add(TIME_STOP_ROOT_CLASS)

  const nextPinned: PinnedDanmakuRef[] = []
  const seen = new Set<HTMLElement>()

  pinned.forEach(ref => {
    if (!ref.el.isConnected) {
      return
    }
    pauseElementMotion(ref.el)
    applyFreezeRect(ref.el, ref.freezeRect)
    ref.el.classList.add(TIME_STOP_ACTIVE_CLASS)
    ref.el.classList.remove(TIME_STOP_HIDDEN_CLASS)
    nextPinned.push(ref)
    seen.add(ref.el)
  })

  // seek 后新出现的节点：不跟进度显示，全部隐藏（定格集合保持进入时的那批）
  queryDanmakuElements().forEach(el => {
    if (seen.has(el)) {
      return
    }
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
          }))

  list.forEach(ref => {
    const { el, prevStyle } = ref
    if (!el.isConnected) {
      return
    }
    el.classList.remove(TIME_STOP_ACTIVE_CLASS)
    restorePrevStyle(el, prevStyle)
    resumeElementMotion(el, prevStyle.animationPlayState)
  })

  document.querySelectorAll(`.${TIME_STOP_HIDDEN_CLASS}`).forEach(node => {
    if (node instanceof HTMLElement) {
      node.classList.remove(TIME_STOP_HIDDEN_CLASS)
    }
  })

  document.documentElement.classList.remove(TIME_STOP_ROOT_CLASS)
}
