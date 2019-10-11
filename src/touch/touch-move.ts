interface Point {
  x: number
  y: number
}
const isValidMove = (startPoint: Point, currentPoint: Point) => {
  const x2 = Math.pow(Math.abs(startPoint.x - currentPoint.x), 2)
  const y2 = Math.pow(Math.abs(startPoint.y - currentPoint.y), 2)
  return x2 + y2 >= 400
}
const composeMouseEvent = (type: string, position: {
  screenX: number,
  screenY: number,
  clientX: number,
  clientY: number,
}) => {
  const positionData = {
    screenX: position.screenX,
    screenY: position.screenY,
    clientX: position.clientX,
    clientY: position.clientY,
  }
  return new MouseEvent(type, {
    ...positionData,
    bubbles: true,
    cancelable: true,
    view: unsafeWindow,
    detail: 1
  })
}
export const enableTouchMove = (element: HTMLElement) => {
  let startPoint: Point
  let lastTouch: Touch
  let move: boolean
  element.addEventListener('touchstart', e => {
    if (e.touches.length < 1) {
      return
    }
    const touch = e.touches[0]
    startPoint = {
      x: touch.clientX,
      y: touch.clientY,
    };
    (e.target as HTMLElement).dispatchEvent(composeMouseEvent('mousedown', touch))
  }, { passive: false, capture: true })
  element.addEventListener('touchmove', e => {
    if (e.touches.length !== 1) {
      return
    }
    const touch = e.touches[0]
    const currentPoint = {
      x: touch.clientX,
      y: touch.clientY,
    }
    lastTouch = touch
    if (isValidMove(startPoint, currentPoint)) {
      (e.target as HTMLElement).dispatchEvent(composeMouseEvent('mousemove', touch))
      move = true
      if (e.cancelable) {
        e.preventDefault()
      }
    } else {
      move = false
    }
  }, { passive: false, capture: true })
  element.addEventListener('touchend', e => {
    if (move) {
      (e.target as HTMLElement).dispatchEvent(composeMouseEvent('mouseup', lastTouch))
      if (e.cancelable) {
        e.preventDefault()
      }
      move = false
    }
  }, { passive: false, capture: true })
}
export default {
  export: {
    enableTouchMove,
  },
}