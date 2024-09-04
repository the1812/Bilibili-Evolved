import { childListSubtree } from '../observer'
import { deleteValue } from '../utils'
import type { ShadowDomObserver } from './dom-observer'
import { ShadowRootObserver } from './root-observer'
import { ShadowRootEvents } from './types'

export const ShadowDomEntrySymbol = Symbol.for('ShadowDomEntry')
export type ShadowDomParent = ShadowDomEntry | ShadowDomObserver
export type ShadowDomCallback = (shadowDom: ShadowDomEntry) => void
export class ShadowDomEntry extends ShadowRootObserver {
  readonly shadowRoot: ShadowRoot
  readonly parent: ShadowDomParent | null = null
  readonly children: ShadowDomEntry[] = []
  protected observer: MutationObserver
  protected callbacksMap = new Map()

  constructor(shadowRoot: ShadowRoot, parent: ShadowDomParent) {
    super()
    this.shadowRoot = shadowRoot
    this.parent = parent
    this.element[ShadowDomEntrySymbol] = this
    ShadowRootObserver.queryAllShadowRoots(shadowRoot)
      .filter(it => it !== shadowRoot)
      .map(it => this.addChild(it))
    this.observe()
  }

  get element() {
    return this.shadowRoot.host
  }

  get elementName() {
    return this.element.tagName.toLowerCase()
  }

  override dispatchEvent(event: Event): boolean {
    return super.dispatchEvent(event) && this.parent.dispatchEvent(event)
  }

  protected mutationHandler(records: MutationRecord[]) {
    if (records.length > 0) {
      this.dispatchEvent(new CustomEvent(ShadowRootEvents.Updated, { detail: records }))
    }
    records.forEach(record => {
      record.removedNodes.forEach(node => {
        if (node instanceof Element) {
          ShadowRootObserver.queryAllShadowRoots(node).forEach(shadowRoot => {
            const child = this.children.find(it => it.shadowRoot === shadowRoot)
            if (child === undefined) {
              return
            }
            this.removeChild(child)
          })
        }
      })
      record.addedNodes.forEach(node => {
        if (node instanceof Element) {
          ShadowRootObserver.queryAllShadowRoots(node).forEach(shadowRoot => {
            this.addChild(shadowRoot)
          })
        }
      })
    })
  }

  addChild(childShadowRoot: ShadowRoot) {
    const match = this.children.find(child => child.shadowRoot === childShadowRoot)
    if (match) {
      return match
    }
    const child = new ShadowDomEntry(childShadowRoot, this)
    this.children.push(child)
    this.dispatchEvent(new CustomEvent(ShadowRootEvents.Added, { detail: child }))
    return child
  }

  removeChild(child: ShadowDomEntry) {
    child.disconnect()
    deleteValue(this.children, it => it === child)
    this.dispatchEvent(new CustomEvent(ShadowRootEvents.Removed, { detail: child }))
  }

  protected queryThroughChildren<T>(predicate: (current: ShadowDomEntry) => T | null): {
    entry: ShadowDomEntry | null
    result: T | null
  } {
    const selfResult = predicate(this)
    if (selfResult !== null) {
      return {
        entry: this,
        result: selfResult,
      }
    }
    for (const child of this.children) {
      const childResult = child.queryThroughChildren(predicate)
      if (childResult.result !== null) {
        return childResult
      }
    }
    return {
      entry: null,
      result: null,
    }
  }

  querySelectorAsEntry(selectors: string): ShadowDomEntry | null {
    const { entry } = this.queryThroughChildren(current => {
      if (current === this) {
        return null
      }
      if (current.element.matches(selectors)) {
        return current
      }
      return null
    })
    return entry
  }

  querySelectorAllAsEntry(selectors: string): ShadowDomEntry[] {
    const currentMatch = this.children.filter(child => child.element.matches(selectors))
    const childrenMatch = this.children.flatMap(child => child.querySelectorAllAsEntry(selectors))
    return [...currentMatch, ...childrenMatch]
  }

  querySelector(selectors: string): Element | null {
    const { result } = this.queryThroughChildren(current =>
      current.shadowRoot.querySelector(selectors),
    )
    return result
  }

  querySelectorAll(selectors: string): Element[] {
    return [
      ...this.shadowRoot.querySelectorAll(selectors),
      ...this.children.flatMap(child => child.querySelectorAll(selectors)),
    ]
  }

  observe() {
    const [observer] = childListSubtree(this.shadowRoot, records => {
      this.mutationHandler(records)
    })
    this.observer = observer
  }

  disconnect() {
    this.children.forEach(child => this.removeChild(child))
    this.observer?.disconnect()
  }
}
