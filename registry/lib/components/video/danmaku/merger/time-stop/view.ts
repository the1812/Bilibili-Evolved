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

/** 暂停 Web Animation 与 CSS animation */
const pauseElementMotion = (el: HTMLElement): void => {
  try {
    el.getAnimations?.().forEach(a => {
      a.pause()
    })
  } catch {
    // 部分环境无 getAnimations
  }
  el.style.animationPlayState = 'paused'
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

/**
 * 把当前 computed transform 固化到 inline style。
 * 优先保留完整 matrix / transform 字符串；无法读取时不改写。
 */
const freezeTransform = (el: HTMLElement): void => {
  const computed = getComputedStyle(el).transform
  if (!computed || computed === 'none') {
    return
  }
  el.style.transform = computed
}

/** 备份钉住前的关键 inline style */
const backupPrevStyle = (el: HTMLElement): PinnedDanmakuRef['prevStyle'] => ({
  transform: el.style.transform,
  left: el.style.left,
  top: el.style.top,
  animationPlayState: el.style.animationPlayState,
})

/** 按备份还原 inline style */
const restorePrevStyle = (el: HTMLElement, prev: PinnedDanmakuRef['prevStyle']): void => {
  el.style.transform = prev.transform
  el.style.left = prev.left
  el.style.top = prev.top
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
    pauseElementMotion(el)
    freezeTransform(el)
    el.classList.add(TIME_STOP_ACTIVE_CLASS)
    el.classList.remove(TIME_STOP_HIDDEN_CLASS)

    pinned.push({ dmid, el, prevStyle })
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
 * 清理时停画面效果：还原钉住节点、去掉 hidden、去掉根 class。
 * @param pinned 进入时停时记录的钉住列表；缺省时按 class 查找 active 节点做尽力还原
 */

/**
 * 时停维持：seek / 方向键后新冒出的无关弹幕继续隐藏；
 * 同源弹幕重新钉住；已钉住节点保持定格。
 */
export const maintainTimeStopView = (
  sourceId: string,
  pinned: PinnedDanmakuRef[],
  deps?: Pick<TimeStopDeps, 'isElementOfSource'>,
): PinnedDanmakuRef[] => {
  document.documentElement.classList.add(TIME_STOP_ROOT_CLASS)

  // 已钉住节点：断连的丢掉；仍在则继续 pause + freeze
  const nextPinned: PinnedDanmakuRef[] = []
  const seen = new Set<HTMLElement>()
  pinned.forEach(ref => {
    if (!ref.el.isConnected) {
      return
    }
    pauseElementMotion(ref.el)
    freezeTransform(ref.el)
    ref.el.classList.add(TIME_STOP_ACTIVE_CLASS)
    ref.el.classList.remove(TIME_STOP_HIDDEN_CLASS)
    nextPinned.push(ref)
    seen.add(ref.el)
  })

  // 扫描画面：同源新节点钉住；其余隐藏
  queryDanmakuElements().forEach(el => {
    if (seen.has(el)) {
      return
    }
    if (matchSourceElement(sourceId, el, deps)) {
      const dmid = readDmidFromElement(el) || `text:${sourceId}:${nextPinned.length}`
      const prevStyle = backupPrevStyle(el)
      pauseElementMotion(el)
      freezeTransform(el)
      el.classList.add(TIME_STOP_ACTIVE_CLASS)
      el.classList.remove(TIME_STOP_HIDDEN_CLASS)
      nextPinned.push({ dmid, el, prevStyle })
      seen.add(el)
      return
    }
    el.classList.add(TIME_STOP_HIDDEN_CLASS)
  })

  return nextPinned
}

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
              animationPlayState: '',
            },
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
