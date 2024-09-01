import { ShadowRootEvents } from './types'

export abstract class ShadowRootObserver extends EventTarget {
  static queryAllShadowRoots(
    root: DocumentFragment | Element = document.body,
    deep = false,
  ): ShadowRoot[] {
    return [root, ...root.querySelectorAll('*')]
      .filter((e): e is Element => e instanceof Element && e.shadowRoot !== null)
      .flatMap(e => {
        if (deep) {
          return [e.shadowRoot, ...ShadowRootObserver.queryAllShadowRoots(e.shadowRoot)]
        }
        return [e.shadowRoot]
      })
  }

  addEventListener(
    type: `${ShadowRootEvents}`,
    callback: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void {
    super.addEventListener(type, callback, options)
  }

  removeEventListener(
    type: `${ShadowRootEvents}`,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ): void {
    super.removeEventListener(type, callback, options)
  }

  abstract observe(): void
  abstract disconnect(): void
}
