export const enableHorizontalScroll = (element: HTMLElement) => {
  const wheelHandler = (e: WheelEvent) => {
    if (e.deltaY && !e.deltaX) {
      e.preventDefault()
      requestAnimationFrame(() => {
        element.scrollBy(e.deltaY, 0)
      })
    }
  }
  element.addEventListener('wheel', wheelHandler)
  return () => {
    element.removeEventListener('wheel', wheelHandler)
  }
}
export default {
  export: {
    enableHorizontalScroll,
  },
}
