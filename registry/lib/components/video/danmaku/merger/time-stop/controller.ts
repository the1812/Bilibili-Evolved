/* eslint-disable @typescript-eslint/no-use-before-define, no-void */
/**
 * 时停业务控制器：enter / release / discard 与按钮点击分发。
 *
 * 本模块只改状态与画面副作用，不负责 tip 注入。
 */

import { attachForcedTipToClones, resyncTimeStopTipAtPointer, startTimeStopMenu } from './menu'
import {
  getActiveSourceId,
  getTimeStopState,
  isTimeStopActive,
  setTimeStopActive,
  setTimeStopIdle,
} from './state'
import type { TimeStopDeps } from './types'
import { clearView, hideOthers, maintainTimeStopView, pinAndHighlight } from './view'

/** 时停维持定时器 / 观察器，seek 时继续钉住并隐藏无关弹幕 */
let maintainTimer = 0
let maintainRaf = 0
let resizeTimer = 0
let maintainObserver: MutationObserver | null = null
let hostResizeObserver: ResizeObserver | null = null
let maintainDeps: TimeStopDeps | null = null

/** 偏移秒数只保留 1 位小数，避免 27.1679… 这种浮点尾巴 */
const roundOffsetSeconds = (value: number): number => Math.round(value * 10) / 10

const stopTimeStopMaintain = (): void => {
  if (maintainTimer) {
    window.clearInterval(maintainTimer)
    maintainTimer = 0
  }
  if (maintainRaf) {
    window.cancelAnimationFrame(maintainRaf)
    maintainRaf = 0
  }
  if (resizeTimer) {
    window.clearTimeout(resizeTimer)
    resizeTimer = 0
  }
  maintainObserver?.disconnect()
  maintainObserver = null
  hostResizeObserver?.disconnect()
  hostResizeObserver = null
  document.removeEventListener('seeking', onSeekLike, true)
  document.removeEventListener('seeked', onSeekLike, true)
  window.removeEventListener('keydown', onArrowSeekKey, true)
  window.removeEventListener('resize', onViewportResize, true)
  window.visualViewport?.removeEventListener('resize', onViewportResize)
  maintainDeps = null
}

const runMaintainOnce = (): void => {
  const s = getTimeStopState()
  if (s.status !== 'active' || !maintainDeps) {
    return
  }
  const nextPinned = maintainTimeStopView(s.sourceId, s.pinned, maintainDeps)
  // 仅更新 pinned 列表，t0 不变
  setTimeStopActive({ ...s, pinned: nextPinned })
  // resize 后 clone 位置变了：若 tip 正开着，跟一次
  attachForcedTipToClones(s.sourceId)
}

const scheduleMaintain = (): void => {
  if (maintainRaf) {
    return
  }
  maintainRaf = window.requestAnimationFrame(() => {
    maintainRaf = 0
    runMaintainOnce()
  })
}

const onSeekLike = (): void => {
  if (!isTimeStopActive()) {
    return
  }
  // seek 后少量补帧即可，避免 timeout 风暴
  runMaintainOnce()
  ;[50, 150, 300].forEach(ms => {
    window.setTimeout(() => {
      if (isTimeStopActive()) {
        runMaintainOnce()
      }
    }, ms)
  })
}

/** 方向键左右 seek */
const onArrowSeekKey = (event: KeyboardEvent): void => {
  if (!isTimeStopActive()) {
    return
  }
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
    return
  }
  const t = event.target
  if (t instanceof HTMLElement) {
    const tag = t.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable) {
      return
    }
  }
  onSeekLike()
}

/** 视口 / 播放器盒变化：F12、缩放、分屏都会触发 */
const onViewportResize = (): void => {
  if (!isTimeStopActive()) {
    return
  }
  window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    if (!isTimeStopActive()) {
      return
    }
    runMaintainOnce()
    // 布局可能连跳两帧（开发者工具抽屉动画）
    window.requestAnimationFrame(() => {
      if (isTimeStopActive()) {
        runMaintainOnce()
      }
    })
  }, 50)
}

const startTimeStopMaintain = (deps: TimeStopDeps): void => {
  stopTimeStopMaintain()
  maintainDeps = deps
  document.addEventListener('seeking', onSeekLike, true)
  document.addEventListener('seeked', onSeekLike, true)
  // 不监听 timeupdate（过于频繁）
  window.addEventListener('keydown', onArrowSeekKey, true)
  window.addEventListener('resize', onViewportResize, true)
  window.visualViewport?.addEventListener('resize', onViewportResize)
  maintainObserver = new MutationObserver(() => {
    scheduleMaintain()
  })
  const root =
    document.querySelector(
      '.bpx-player-row-dm-wrap, .bpx-player-dm-mask-wrap, .bpx-player-video-area',
    ) || document.body
  maintainObserver.observe(root, { childList: true, subtree: true })
  // 播放器盒本身尺寸变化（F12 改布局、网页全屏切换）
  if (typeof ResizeObserver !== 'undefined') {
    hostResizeObserver = new ResizeObserver(() => {
      onViewportResize()
    })
    const host =
      document.querySelector(
        '.bpx-player-video-area, .bpx-player-container, #bilibili-player, .player-wrap',
      ) || document.documentElement
    hostResizeObserver.observe(host)
  }
  // 低频兜底即可
  maintainTimer = window.setInterval(() => {
    if (!isTimeStopActive()) {
      stopTimeStopMaintain()
      return
    }
    runMaintainOnce()
  }, 500)
}

/**
 * 进入时停：钉住 sourceId 弹幕并隐藏其余。
 * pin 失败时 toast 且不进入 active。
 */
export const enterTimeStop = async (sourceId: string, deps: TimeStopDeps): Promise<void> => {
  if (!deps.hasSource(sourceId)) {
    deps.toast('未找到合并源，无法时停', 'error')
    return
  }

  // 已有 active：先 discard（不写 offset）
  if (isTimeStopActive()) {
    discardTimeStop()
  }

  const t0 = deps.getCurrentTime()
  const pinned = pinAndHighlight(sourceId, deps)
  if (!pinned.length) {
    clearView()
    deps.toast('无法时停该弹幕（未找到画面节点）', 'error')
    return
  }

  hideOthers(sourceId, deps)
  setTimeStopActive({ status: 'active', sourceId, t0, pinned })
  startTimeStopMaintain(deps)
  // 点击时停时指针多在 tip 上：直接按 clone 贴位，不能只靠 pointer hit
  window.requestAnimationFrame(() => {
    attachForcedTipToClones(sourceId)
    window.setTimeout(() => attachForcedTipToClones(sourceId), 40)
  })
}

/**
 * 恢复时停：计算 delta，清理画面；delta !== 0 时写 offset。
 */
export const releaseTimeStop = async (deps: TimeStopDeps): Promise<void> => {
  const s = getTimeStopState()
  if (s.status !== 'active') {
    return
  }

  const t1 = deps.getCurrentTime()
  const delta = roundOffsetSeconds(t1 - s.t0)
  const { sourceId } = s

  stopTimeStopMaintain()
  clearView(s.pinned)
  setTimeStopIdle()
  // 恢复后强制 tip 立刻收起；若指针仍在合并弹幕上，由 resync 等原生 tip
  window.requestAnimationFrame(() => {
    resyncTimeStopTipAtPointer()
  })

  if (!deps.hasSource(sourceId)) {
    deps.toast('源已移除', 'error')
    return
  }

  if (delta !== 0) {
    try {
      await deps.applyOffsetDelta(sourceId, delta)
    } catch {
      // applyOffsetDelta 侧已 toast 失败；此处不再弹成功
      return
    }
  }

  const sign = delta > 0 ? '+' : ''
  deps.toast(`已恢复，源偏移 ${sign}${delta.toFixed(1)} 秒`, 'success')
}

/**
 * 放弃时停：清理画面与状态，不写 offset。
 */
export const discardTimeStop = (): void => {
  const s = getTimeStopState()
  if (s.status !== 'active') {
    return
  }
  stopTimeStopMaintain()
  clearView(s.pinned)
  setTimeStopIdle()
  window.requestAnimationFrame(() => {
    resyncTimeStopTipAtPointer()
  })
}

/**
 * tip 按钮点击：同源 release，异源/空闲 enter。
 */
export const handleTimeStopButtonClick = async (
  sourceId: string,
  deps: TimeStopDeps,
): Promise<void> => {
  const activeId = getActiveSourceId()
  if (activeId && activeId === sourceId) {
    await releaseTimeStop(deps)
    return
  }
  await enterTimeStop(sourceId, deps)
}

/**
 * 启动 tip 菜单并接线 onClick。
 * @returns cleanup：停止菜单观察 + discard 当前时停
 */
export const initTimeStop = (deps: TimeStopDeps): (() => void) => {
  const stopMenu = startTimeStopMenu({
    onClick: sourceId => {
      handleTimeStopButtonClick(sourceId, deps).catch(err => {
        // 防止 applyOffsetDelta 等异步错误变成 unhandled rejection
        console.error('[danmakuMerger][time-stop]', err)
      })
    },
    resolveSourceIdFromElement: deps.resolveSourceIdFromElement,
  })

  return () => {
    stopMenu()
    stopTimeStopMaintain()
    discardTimeStop()
  }
}
