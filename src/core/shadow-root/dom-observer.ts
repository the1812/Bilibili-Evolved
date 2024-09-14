import { contentLoaded } from '../life-cycle'
import { childListSubtree } from '../observer'
import { deleteValue } from '../utils'
import { ShadowDomCallback, ShadowDomEntry } from './dom-entry'
import { ShadowRootObserver } from './root-observer'
import { ShadowRootEvents } from './types'

export class ShadowDomObserver extends ShadowRootObserver {
  static enforceOpenRoot() {
    const originalAttachShadow = Element.prototype.attachShadow
    Element.prototype.attachShadow = function attachShadow(options: ShadowRootInit) {
      return originalAttachShadow.call(this, {
        ...options,
        mode: 'open',
      })
    }
  }

  private observing = false
  private rootObserver: MutationObserver | undefined = undefined

  entries: ShadowDomEntry[] = []

  constructor() {
    super()
  }

  protected mutationHandler(records: MutationRecord[]) {
    if (records.length > 0) {
      this.dispatchEvent(new CustomEvent(ShadowRootEvents.Updated, { detail: records }))
    }
    records.forEach(record => {
      record.removedNodes.forEach(node => {
        if (node instanceof Element) {
          ShadowRootObserver.queryAllShadowRoots(node).forEach(shadowRoot => {
            this.removeEntryByShadowRoot(shadowRoot)
          })
        }
      })
      record.addedNodes.forEach(node => {
        if (node instanceof Element) {
          ShadowRootObserver.queryAllShadowRoots(node).forEach(shadowRoot => {
            this.addEntry(shadowRoot)
          })
        }
      })
    })
  }

  protected addEntry(shadowRoot: ShadowRoot) {
    const match = this.entries.find(e => e.shadowRoot === shadowRoot)
    if (match !== undefined) {
      return match
    }

    const shadowDomEntry = new ShadowDomEntry(shadowRoot, this)
    shadowDomEntry.observe()
    this.entries.push(shadowDomEntry)
    this.dispatchEvent(new CustomEvent(ShadowRootEvents.Added, { detail: shadowDomEntry }))

    return shadowDomEntry
  }

  protected removeEntry(entry: ShadowDomEntry) {
    const match = this.entries.find(it => it === entry)
    if (match === undefined) {
      return
    }

    match.children.forEach(child => this.removeEntry(child))
    match.disconnect()
    deleteValue(this.entries, it => it === match)
    this.dispatchEvent(new CustomEvent(ShadowRootEvents.Removed, { detail: match }))
  }

  protected removeEntryByShadowRoot(shadowRoot: ShadowRoot) {
    const match = this.entries.find(it => it.shadowRoot === shadowRoot)
    if (match === undefined) {
      return
    }
    this.removeEntry(match)
  }

  forEachShadowDom(callback: ShadowDomCallback) {
    this.observe()
    const callCurrentAndNextLevel = (currentEntry: ShadowDomEntry) => {
      callback(currentEntry)
      currentEntry.children.forEach(child => {
        callCurrentAndNextLevel(child)
      })
    }

    this.entries.forEach(entry => {
      callCurrentAndNextLevel(entry)
    })
  }

  watchShadowDom(callbacks: { added?: ShadowDomCallback; removed?: ShadowDomCallback }) {
    this.observe()
    this.forEachShadowDom(it => callbacks.added?.(it))
    const addedListener = (e: CustomEvent<ShadowDomEntry>) => callbacks?.added?.(e.detail)
    const removedListener = (e: CustomEvent<ShadowDomEntry>) => callbacks?.removed?.(e.detail)
    this.addEventListener(ShadowRootEvents.Added, addedListener)
    this.addEventListener(ShadowRootEvents.Removed, removedListener)
    return () => {
      this.removeEventListener(ShadowRootEvents.Added, addedListener)
      this.removeEventListener(ShadowRootEvents.Removed, removedListener)
    }
  }

  observe() {
    if (this.observing) {
      return
    }
    this.observing = true
    contentLoaded(() => {
      const existingRoots = ShadowRootObserver.queryAllShadowRoots()
      existingRoots.forEach(root => this.addEntry(root))
      ;[this.rootObserver] = childListSubtree(document.body, records =>
        this.mutationHandler(records),
      )
    })
  }

  disconnect() {
    this.rootObserver.disconnect()
    this.entries.forEach(entry => entry.disconnect())
    this.entries = []
    this.observing = false
  }
}

export const shadowDomObserver = new ShadowDomObserver()
