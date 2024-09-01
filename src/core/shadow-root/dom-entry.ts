import { childListSubtree } from '../observer'
import { deleteValue } from '../utils'
import type { ShadowDomObserver } from './dom-observer'
import { ShadowRootObserver } from './root-observer'
import { ShadowRootEvents } from './types'

export type ShadowDomParent = ShadowDomEntry | ShadowDomObserver
export type ShadowDomCallback = (shadowDom: ShadowDomEntry) => void
export class ShadowDomEntry extends ShadowRootObserver {
  readonly shadowRoot: ShadowRoot
  readonly elementName: string
  readonly parent: ShadowDomParent | null = null
  readonly children: ShadowDomEntry[] = []
  protected observer: MutationObserver
  protected callbacksMap = new Map()

  constructor(shadowRoot: ShadowRoot, parent: ShadowDomParent) {
    super()
    this.shadowRoot = shadowRoot
    this.parent = parent
    this.elementName = shadowRoot.host.tagName.toLowerCase()
    ShadowRootObserver.queryAllShadowRoots(shadowRoot).map(it => this.addChild(it))
    this.observe()
  }

  override dispatchEvent(event: Event): boolean {
    return super.dispatchEvent(event) && this.parent.dispatchEvent(event)
  }

  protected mutationHandler(records: MutationRecord[]) {
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
