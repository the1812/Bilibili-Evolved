import { childListSubtree } from '@/core/observer'
import { formatDuration } from '@/core/utils/formatters'
import { ToastPosition } from './options'

export type ToastMode = 'progress' | 'ending'

export interface ManagedPlayerToast {
  dispose: () => void
}

const OVERLAY_SELECTOR = '[data-be-restart-near-end]'
/** 退场动画时长, 与 scss 中 .be-rne-leave 的 transition 对应 */
const LeaveMs = 250
/** 播放器 DOM 重建时允许的重新挂载次数上限 */
const MaxRemount = 10
const SVG_NS = 'http://www.w3.org/2000/svg'

const positionClassMap: Record<ToastPosition, string> = {
  [ToastPosition.RightTop]: 'be-rne-pos-right-top',
  [ToastPosition.LeftTop]: 'be-rne-pos-left-top',
  [ToastPosition.RightBottom]: 'be-rne-pos-right-bottom',
  [ToastPosition.LeftBottom]: 'be-rne-pos-left-bottom',
  [ToastPosition.Center]: 'be-rne-pos-center',
}

const getPlayerRoot = () =>
  (dq('.bpx-player-container') as HTMLElement | null) ??
  (dq('#bilibili-player, .bpx-player-primary-area, .bilibili-player') as HTMLElement | null)

const createActionButton = (label: string, className: string, onClick: () => void) => {
  const button = document.createElement('div')
  button.className = className
  button.textContent = label
  button.addEventListener('click', event => {
    event.preventDefault()
    event.stopPropagation()
    onClick()
  })
  return button
}

/** 环形倒计时, 随停留时间消耗, 提示即将自动关闭 */
const createCountdownRing = (durationMs: number) => {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 36 36')
  svg.classList.add('be-rne-ring')
  const track = document.createElementNS(SVG_NS, 'circle')
  track.setAttribute('cx', '18')
  track.setAttribute('cy', '18')
  track.setAttribute('r', '15.5')
  track.classList.add('be-rne-ring-track')
  const bar = document.createElementNS(SVG_NS, 'circle')
  bar.setAttribute('cx', '18')
  bar.setAttribute('cy', '18')
  bar.setAttribute('r', '15.5')
  bar.setAttribute('pathLength', '100')
  bar.classList.add('be-rne-ring-bar')
  bar.style.animationDuration = `${durationMs}ms`
  svg.append(track, bar)
  return svg
}

/**
 * 在播放器侧边展示带倒计时动画的重头提示, 停留一段时间后自动消失.
 * 播放器 DOM 被重建时会自动重新挂载, 直到 dispose 或超出重试上限.
 */
export const showManagedPlayerToast = (config: {
  mode: ToastMode
  /** 触发时的进度 */
  originalTime: number
  /** 是否已自动重头; 手动选择模式下为 false, 由用户在提示中选择操作 */
  restarted: boolean
  /** 停留时长 */
  durationMs: number
  /** 停留位置 */
  position: ToastPosition
  onRestart: () => void
  onRestore: () => void
  onNext: () => void
}): ManagedPlayerToast => {
  const { mode, originalTime, restarted, durationMs, position, onRestart, onRestore, onNext } =
    config
  const timeLabel = formatDuration(Math.max(0, Math.floor(originalTime)))

  let item: HTMLElement | null = null
  let observer: MutationObserver | null = null
  let disposed = false
  let remountCount = 0
  let timer = 0

  const cleanup = () => {
    if (disposed) {
      return
    }
    disposed = true
    window.clearTimeout(timer)
    observer?.disconnect()
    dqa(OVERLAY_SELECTOR).forEach(node => {
      node.classList.add('be-rne-leave')
      window.setTimeout(() => node.remove(), LeaveMs)
    })
    item = null
  }

  const runAndCleanup = (action: () => void) => () => {
    action()
    cleanup()
  }

  const mount = () => {
    const root = getPlayerRoot()
    if (!root) {
      return false
    }
    if (getComputedStyle(root).position === 'static') {
      root.style.position = 'relative'
    }
    const overlay = document.createElement('div')
    overlay.className = `be-rne-overlay ${positionClassMap[position]}`
    overlay.setAttribute('data-be-restart-near-end', mode)

    const title = document.createElement('div')
    title.className = 'be-rne-title'
    const detail = document.createElement('div')
    detail.className = 'be-rne-detail'
    const actions = document.createElement('div')
    actions.className = 'be-rne-actions'

    if (restarted) {
      title.textContent = mode === 'ending' ? '本集已到片尾' : '已从头播放'
      detail.textContent =
        mode === 'ending' ? '已自动从头播放' : `原进度 ${timeLabel}, 已自动从头播放`
      if (mode === 'ending') {
        actions.appendChild(createActionButton('下一集', 'be-rne-action', runAndCleanup(onNext)))
      } else {
        actions.appendChild(
          createActionButton(`回到 ${timeLabel}`, 'be-rne-action', runAndCleanup(onRestore)),
        )
      }
    } else {
      title.textContent = mode === 'ending' ? '已到片尾' : '已接近片尾'
      detail.textContent = mode === 'ending' ? '可从头播放或跳转下一集' : `当前进度 ${timeLabel}`
      actions.appendChild(createActionButton('从头播放', 'be-rne-action', runAndCleanup(onRestart)))
      if (mode === 'ending') {
        actions.appendChild(createActionButton('下一集', 'be-rne-action', runAndCleanup(onNext)))
      }
    }
    actions.appendChild(createActionButton('关闭', 'be-rne-action be-rne-secondary', cleanup))

    const header = document.createElement('div')
    header.className = 'be-rne-header'
    header.append(createCountdownRing(durationMs), title)
    overlay.append(header, detail, actions)
    root.appendChild(overlay)
    item = overlay
    return true
  }

  if (!mount()) {
    return { dispose: cleanup }
  }

  timer = window.setTimeout(cleanup, durationMs)
  const [mutationObserver] = childListSubtree(document.body, () => {
    if (disposed) {
      return
    }
    if (!item || !document.contains(item)) {
      if (remountCount >= MaxRemount) {
        cleanup()
        return
      }
      remountCount += 1
      if (!mount()) {
        cleanup()
      }
    }
  })
  observer = mutationObserver

  return { dispose: cleanup }
}
