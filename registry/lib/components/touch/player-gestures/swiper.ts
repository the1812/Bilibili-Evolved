/*
  ============
  祖 传 代 码
  ============
*/

import { getComponentSettings } from '@/core/settings'
import { ProgressSeekMode } from './gesture-preview'

type Position = { x: number; y: number; width: number; height: number }
const getPosition = (element: HTMLElement) => {
  let x = 0
  let y = 0
  let e = element
  while (e && !Number.isNaN(e.offsetLeft) && !Number.isNaN(e.offsetTop)) {
    x += e.offsetLeft - e.scrollLeft
    y += e.offsetTop - e.scrollTop
    e = e.offsetParent as HTMLElement
  }
  return { x, y }
}
const createPosition = (e: TouchEvent, element: HTMLElement) => {
  const elementPosition = getPosition(element)
  const position = {
    x: (e.touches[0].pageX - elementPosition.x) / element.clientWidth,
    y: (e.touches[0].pageY - elementPosition.y) / element.clientHeight,
    width: element.clientWidth,
    height: element.clientHeight,
  }
  return position
}

/** 从运动轨迹中判断手势, 并触发对应的事件: (有的事件里带有参数`detail`)
 * - `start`: 手势开始
 * - `end`: 手势结束, 参数为手势信息, 参见`lastAction`的类型
 * - `brightness`: 亮度调整, 参数为亮度的变化值
 * - `volume`: 音量调整, 参数为音量的变化值
 * - `progress`: 进度调整, 参数为进度的变化值和灵敏度 (`{ progress: number; mode: ProgressSeekMode }`)
 * - `cancel`: 请求取消调整
 */
export class SwipeAction extends EventTarget {
  minSwipeDistance = getComponentSettings('touchPlayerGestures').options.swiperDistance as number
  startPosition: Position = null
  lastAction: {
    type: 'brightness' | 'volume' | 'progress'
    brightness?: number
    volume?: number
    seconds?: number
  } = null
  constructor(public element: HTMLElement) {
    super()
    element.addEventListener('touchstart', () => {
      this.dispatchEvent(new CustomEvent('start'))
    })
    element.addEventListener('touchend', () => {
      this.dispatchEvent(
        new CustomEvent('end', {
          detail: this.lastAction,
        }),
      )
      this.lastAction = null
    })
  }

  startAction(direction: 'vertical' | 'horizontal', distance: number, position: Position) {
    if (direction === 'vertical') {
      if (this.startPosition.x < 1 / 2) {
        const brightnessChange =
          Math.round((200 * (distance - this.minSwipeDistance)) / (1.5 * position.height)) / 100
        this.dispatchEvent(
          new CustomEvent('brightness', {
            detail: brightnessChange,
          }),
        )
        this.lastAction = {
          type: 'brightness',
          brightness: brightnessChange,
        }
      } else {
        const volumeChange =
          Math.round((200 * (distance - this.minSwipeDistance)) / (1.5 * position.height)) / 100
        this.dispatchEvent(
          new CustomEvent('volume', {
            detail: volumeChange,
          }),
        )
        this.lastAction = {
          type: 'volume',
          volume: volumeChange,
        }
      }
    } else if (direction === 'horizontal') {
      if (position.y < 1 / 3 && (position.x < 0.1 || position.x > 0.9)) {
        this.dispatchEvent(new CustomEvent('cancel'))
        this.lastAction = null
      } else {
        let speedFactor = 0
        if (this.startPosition.y < 1 / 3) {
          speedFactor = 0.05
        } else if (this.startPosition.y >= 1 / 3 && this.startPosition.y <= 2 / 3) {
          speedFactor = 0.2
        } else {
          speedFactor = 1
        }
        const modeMap = {
          0.05: ProgressSeekMode.Slow,
          0.2: ProgressSeekMode.Medium,
          1: ProgressSeekMode.Fast,
        }

        if (distance > 0) {
          const seconds = (distance - this.minSwipeDistance) * speedFactor
          // forwardHandler && forwardHandler(seconds)
          this.dispatchEvent(
            new CustomEvent('progress', {
              detail: {
                mode: modeMap[speedFactor],
                progress: seconds,
              },
            }),
          )
          this.lastAction = {
            type: 'progress',
            seconds,
          }
        } else {
          const seconds = (distance + this.minSwipeDistance) * speedFactor
          this.dispatchEvent(
            new CustomEvent('progress', {
              detail: {
                mode: modeMap[speedFactor],
                progress: seconds,
              },
            }),
          )
          this.lastAction = {
            type: 'progress',
            seconds,
          }
        }
      }
    }
  }
}
/** 封装触摸手势的监听, 会通知`SwipeAction`触发相应的事件, 事件应绑定到`this.action`中 */
export class Swiper {
  onTouchStart: (e: TouchEvent) => void = null
  onTouchEnd: (e: TouchEvent) => void = null
  direction: 'vertical' | 'horizontal' = null
  action: SwipeAction
  xDown: number
  yDown: number
  constructor(element: HTMLElement) {
    this.action = new SwipeAction(element)
    element.addEventListener('touchstart', e => {
      this.xDown = e.touches[0].clientX
      this.yDown = e.touches[0].clientY
      this.onTouchStart?.(e)
      this.action.startPosition = createPosition(e, element)
    })
    element.addEventListener(
      'touchmove',
      e => {
        if (!this.xDown || !this.yDown || !e.cancelable) {
          return
        }
        const xUp = e.touches[0].clientX
        const yUp = e.touches[0].clientY
        const position = createPosition(e, element)

        const xDiff = this.xDown - xUp
        const yDiff = this.yDown - yUp

        if (!this.direction) {
          this.direction = Math.abs(xDiff) > Math.abs(yDiff) ? 'horizontal' : 'vertical'
        } else if (this.direction === 'vertical') {
          this.action.startAction(this.direction, yDiff, position)
        } else if (this.direction === 'horizontal') {
          this.action.startAction(this.direction, -xDiff, position)
        }
        e.preventDefault()
      },
      { passive: false },
    )
    element.addEventListener('touchend', e => {
      this.xDown = null
      this.yDown = null
      this.direction = null
      this.onTouchEnd?.(e)
      this.action.startPosition = null
    })
  }
}
