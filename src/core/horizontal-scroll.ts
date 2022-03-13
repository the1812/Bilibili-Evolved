/**
 * 为容器启用横向滚动效果: 鼠标滚轮在上面滚动时, 模拟发送横向滚动的事件 (类似 Windows 8)
 * 同时也会移除 scroll snap 效果, 否则滚动灵敏度会变得超高
 * @param element 容器元素
 */
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
  element.style.scrollSnapType = 'none'
  return () => {
    element.removeEventListener('wheel', wheelHandler)
    element.style.scrollSnapType = ''
  }
}
