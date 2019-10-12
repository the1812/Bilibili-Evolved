interface Point {
  x: number
  y: number
}
interface Position {
  screenX: number
  screenY: number
  clientX: number
  clientY: number
}
const isValidMove = (startPoint: Point, currentPoint: Point, minMoveDistance: number) => {
  const x2 = Math.pow(Math.abs(startPoint.x - currentPoint.x), 2)
  const y2 = Math.pow(Math.abs(startPoint.y - currentPoint.y), 2)
  return x2 + y2 >= minMoveDistance * minMoveDistance
}
const composeMouseEvent = (type: string, position: Position) => {
  return new MouseEvent(type, {
    screenX: position.screenX,
    screenY: position.screenY,
    clientX: position.clientX,
    clientY: position.clientY,
    bubbles: true,
    cancelable: true,
    view: unsafeWindow,
    detail: 1
  })
}
const composeWheelEvent = (startPoint: Point, currentPoint: Point, position: Position) => {
  return new WheelEvent('wheel', {
    deltaY: currentPoint.y - startPoint.y,
    screenX: position.screenX,
    screenY: position.screenY,
    clientX: position.clientX,
    clientY: position.clientY,
    bubbles: true,
    cancelable: true,
    view: unsafeWindow,
  })
}
type TouchEventHandler = (e: TouchEvent) => any
interface TouchEventHandlers {
  element: HTMLElement
  touchstart: TouchEventHandler
  touchmove: TouchEventHandler
  touchend: TouchEventHandler
  [key: string]: any
}
const attachedHandlers: TouchEventHandlers[] = []
const listenerOptions = { passive: false, capture: true }
interface TouchMoveOptions {
  minMoveDistance?: number
  scroll?: boolean
}
export const enableTouchMove = (element: HTMLElement, options?: TouchMoveOptions) => {
  if (attachedHandlers.some(h => h.element === element)) {
    return
  }
  let startPoint: Point
  let startTouch: Touch
  let lastTouch: Touch
  let move: boolean
  const minMoveDistance = _.get(options, 'minMoveDistance', 20)
  const scroll = _.get(options, 'scroll', false)
  const touchstart = (e: TouchEvent) => {
    if (e.touches.length < 1) {
      return
    }
    const touch = e.touches[0]
    startTouch = touch
    startPoint = {
      x: touch.clientX,
      y: touch.clientY,
    };
    (e.target as HTMLElement).dispatchEvent(composeMouseEvent('mousedown', touch))
  }
  element.addEventListener('touchstart', touchstart, listenerOptions)
  const touchmove = (e: TouchEvent) => {
    if (e.touches.length !== 1) {
      return
    }
    const touch = e.touches[0]
    const currentPoint = {
      x: touch.clientX,
      y: touch.clientY,
    }
    if (!scroll) {
      if (isValidMove(startPoint, currentPoint, minMoveDistance)) {
        (e.target as HTMLElement).dispatchEvent(composeMouseEvent('mousemove', touch))
        move = true
        if (e.cancelable) {
          e.preventDefault()
        }
      } else {
        move = false
      }
    } else {
      const lastPoint = {
        x: lastTouch ? lastTouch.clientX : startPoint.x,
        y: lastTouch ? lastTouch.clientY : startPoint.y,
      };
      console.log('touch scroll', lastPoint, currentPoint);
      (e.target as HTMLElement).dispatchEvent(composeWheelEvent(lastPoint, currentPoint, startTouch))
    }
    lastTouch = touch
  }
  element.addEventListener('touchmove', touchmove, listenerOptions)
  const touchend = (e: TouchEvent) => {
    if (move) {
      (e.target as HTMLElement).dispatchEvent(composeMouseEvent('mouseup', lastTouch))
      if (e.cancelable) {
        e.preventDefault()
      }
      move = false
    }
  }
  element.addEventListener('touchend', touchend, listenerOptions)
  element.addEventListener('touchcancel', touchend, listenerOptions)
  attachedHandlers.push({
    element,
    touchstart,
    touchmove,
    touchend,
  })
}
// 仅能取消使用 enableTouchMove 建立的触摸事件
export const disableTouchMove = (element: HTMLElement) => {
  const handlersIndex = attachedHandlers.findIndex(h => h.element === element)
  if (handlersIndex === -1) {
    return
  }
  const handlers = attachedHandlers[handlersIndex];
  ['touchstart', 'touchmove', 'touchend'].forEach(event => {
    element.removeEventListener(event, handlers[event], listenerOptions)
  })
  element.removeEventListener('touchcancel', handlers.touchend, listenerOptions)
  attachedHandlers.splice(handlersIndex, 1)
}
export default {
  export: {
    enableTouchMove,
    disableTouchMove,
  },
}