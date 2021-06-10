/* eslint-disable no-redeclare */
declare global {
  interface ResizeObserverOptions {
    /**
     * Sets which box model the observer will observe changes to. Possible values
     * are `content-box` (the default), and `border-box`.
     *
     * @default 'content-box'
     */
    box?: 'content-box' | 'border-box'
  }

  interface ResizeObserverSize {
    inlineSize: number
    blockSize: number
  }

  class ResizeObserver {
    constructor(callback: ResizeObserverCallback)
    disconnect(): void
    observe(target: Element, options?: ResizeObserverOptions): void
    unobserve(target: Element): void
  }

  type ResizeObserverCallback = (
    entries: ReadonlyArray<ResizeObserverEntry>,
    observer: ResizeObserver
  ) => void

  interface ResizeObserverEntry {
    readonly target: Element
    readonly contentRect: DOMRectReadOnly
    readonly borderBoxSize: ResizeObserverSize
    readonly contentBoxSize: ResizeObserverSize
  }
}
export {}
