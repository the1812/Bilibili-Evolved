import {
  maxGainPercent,
  minGainPercent,
  percentOfRatio,
  ratioOfPercent,
  stepGainPercent,
} from './volume-gain'

export interface GainPanelConfig {
  percent: number
  /** 用户拖动滑块或滚动滚轮改变了增益 */
  onChange: (percent: number, source: 'drag' | 'wheel') => void
  /** 直播控制栏的按钮尺寸与视频页不同, 需要单独的样式 */
  live?: boolean
}

export interface GainPanel {
  element: HTMLDivElement
  setPercent: (percent: number) => void
  dispose: () => void
}

const openClass = 'be-volume-boost-open'
const draggingClass = 'be-volume-boost-dragging'
const playerModeClass = 'be-volume-boost-player-mode'
/** 鼠标离开后等一小会儿再收起, 方便从按钮移动到浮层上 */
const closeDelay = 260
/** 轨道两端各留出的距离, 让滑块能精确地停在 100% 和 300% */
const edgeInset = 6

/** 播放器的全屏状态, 与原生音量浮层的抬高规则保持一致 */
const isPlayerMode = () => {
  const screen = dq('.bpx-player-container')?.getAttribute('data-screen')
  return screen === 'full' || screen === 'web'
}

/**
 * 原生音量按钮左侧的增益滑块
 *
 * 结构与样式尽量与原生音量浮层一致 (32×100 的深色竖条, 顶部数字, 下面竖直滑块),
 * 但只控制增益, 不碰原生音量, 两者的作用相互独立.
 */
export const createGainPanel = ({ percent, onChange, live }: GainPanelConfig): GainPanel => {
  const element = document.createElement('div')
  // 复用原生控制栏按钮的类名, 宽度、高度、行高、全屏放大与悬停高亮都由 B 站的样式管理
  element.className = live
    ? 'be-volume-boost be-volume-boost-live'
    : 'bpx-player-ctrl-btn be-volume-boost'
  element.innerHTML = `
    <div class="be-volume-boost-icon mdi mdi-volume-plus"></div>
    <div class="be-volume-boost-panel">
      <div class="be-volume-boost-number"></div>
      <div class="be-volume-boost-progress" role="slider" tabindex="0"
        aria-label="音量增益" aria-orientation="vertical">
        <div class="be-volume-boost-bar"></div>
        <div class="be-volume-boost-thumb"></div>
      </div>
    </div>
  `
  const number = dq(element, '.be-volume-boost-number') as HTMLElement
  const progress = dq(element, '.be-volume-boost-progress') as HTMLElement

  let current = percent
  let closeTimer = 0
  let dragging = false
  /** 拖动期间指针可能移出按钮, 此时不能因为 pointerleave 就收起浮层 */
  let releasing = false

  const update = (value: number) => {
    current = value
    const ratio = ratioOfPercent(value)
    number.textContent = `${value}`
    progress.style.setProperty('--be-volume-boost-ratio', `${ratio * 100}%`)
    progress.setAttribute('aria-valuenow', `${value}`)
  }
  progress.setAttribute('aria-valuemin', `${minGainPercent}`)
  progress.setAttribute('aria-valuemax', `${maxGainPercent}`)
  update(percent)

  const open = () => {
    window.clearTimeout(closeTimer)
    closeTimer = 0
    element.classList.toggle(playerModeClass, isPlayerMode())
    element.classList.add(openClass)
  }
  const close = () => {
    window.clearTimeout(closeTimer)
    closeTimer = 0
    element.classList.remove(openClass, draggingClass)
    dragging = false
    releasing = false
  }
  const scheduleClose = () => {
    if (releasing) {
      return
    }
    window.clearTimeout(closeTimer)
    closeTimer = window.setTimeout(close, closeDelay)
  }

  const percentOfPointer = (event: PointerEvent) => {
    const rect = progress.getBoundingClientRect()
    if (rect.height === 0) {
      return current
    }
    const offset = rect.bottom - event.clientY
    const ratio = lodash.clamp(
      (offset - edgeInset) / Math.max(rect.height - edgeInset * 2, 1),
      0,
      1,
    )
    return percentOfRatio(ratio)
  }

  const apply = (value: number, source: 'drag' | 'wheel') => {
    if (value === current) {
      return
    }
    update(value)
    onChange(value, source)
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging) {
      return
    }
    apply(percentOfPointer(event), 'drag')
  }

  const endDrag = () => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', endDrag)
    window.removeEventListener('pointercancel', endDrag)
    if (!dragging) {
      return
    }
    dragging = false
    releasing = false
    element.classList.remove(draggingClass)
    // 松手时指针可能还停在滑块上, 此时不应该收起浮层
    if (element.matches(':hover')) {
      open()
    } else {
      scheduleClose()
    }
  }

  const startDrag = (event: PointerEvent) => {
    if (event.button !== 0) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    dragging = true
    releasing = true
    open()
    element.classList.add(draggingClass)
    apply(percentOfPointer(event), 'drag')
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
  }

  const onWheel = (event: WheelEvent) => {
    const notches =
      event.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? -event.deltaY / (100 / 3) : -event.deltaY
    const direction = lodash.clamp(notches, -1, 1)
    if (direction === 0) {
      return
    }
    const next = stepGainPercent(current, direction)
    if (next === current) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    open()
    apply(next, 'wheel')
  }

  const onKeyDown = (event: KeyboardEvent) => {
    let direction = 0
    if (event.key === 'ArrowUp') {
      direction = 1
    } else if (event.key === 'ArrowDown') {
      direction = -1
    }
    if (direction === 0) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    open()
    apply(stepGainPercent(current, direction), 'wheel')
  }

  element.addEventListener('mouseenter', open)
  element.addEventListener('mouseleave', scheduleClose)
  element.addEventListener('wheel', onWheel, { passive: false })
  progress.addEventListener('pointerdown', startDrag)
  progress.addEventListener('keydown', onKeyDown)

  return {
    element,
    setPercent: update,
    dispose: () => {
      close()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
      element.removeEventListener('mouseenter', open)
      element.removeEventListener('mouseleave', scheduleClose)
      element.removeEventListener('wheel', onWheel)
      progress.removeEventListener('pointerdown', startDrag)
      progress.removeEventListener('keydown', onKeyDown)
      element.remove()
    },
  }
}
