import { intersectionObserve } from '@/core/observer'

export interface ScrollMaskConfig {
  container: HTMLElement
  items: HTMLElement[]
}
const observersMap = new Map<HTMLElement, IntersectionObserver[]>()
export const setupScrollMask = (config: ScrollMaskConfig) => {
  const { container, items } = config
  const observers = observersMap.get(container)
  if (observers) {
    observers.forEach(o => o.disconnect())
    observersMap.delete(container)
  }
  if (items.length === 0) {
    return
  }
  const observerConfig: IntersectionObserverInit = { threshold: [1], root: container }
  const [firstItem] = items
  const [firstObserver] = intersectionObserve([firstItem], observerConfig, records =>
    records.forEach(r => {
      const isScrollTop = r.isIntersecting && r.intersectionRatio === 1
      container.classList.toggle('scroll-top', isScrollTop)
    }),
  )
  const newObservers: IntersectionObserver[] = []
  observersMap.set(container, newObservers)
  newObservers.push(firstObserver)
  if (items.length > 1) {
    const lastItem = items[items.length - 1]
    const [lastObserver] = intersectionObserve([lastItem], observerConfig, records =>
      records.forEach(r => {
        const isScrollBottom = r.isIntersecting && r.intersectionRatio === 1
        container.classList.toggle('scroll-bottom', isScrollBottom)
      }),
    )
    newObservers.push(lastObserver)
  }
}
export const cleanUpScrollMask = (...containers: HTMLElement[]) => {
  containers.forEach(container => {
    if (observersMap.has(container)) {
      const observers = observersMap.get(container)
      observers.forEach(o => o.disconnect())
      observersMap.delete(container)
    }
  })
}
