import { addStyle } from '../style'
import { deleteValue, getRandomId } from '../utils'
import { ShadowDomObserver, shadowDomObserver } from './dom-observer'

interface ShadowRootStyleEntry {
  shadowRoot: ShadowRoot
}
export class ShadowRootStyles {
  observer: ShadowDomObserver = shadowDomObserver
  entries: ShadowRootStyleEntry[] = []

  get shadowRoots() {
    return this.entries.map(entry => entry.shadowRoot)
  }

  protected addEntry(shadowRoot: ShadowRoot) {
    this.entries.push({
      shadowRoot,
    })
  }

  protected removeEntry(shadowRoot: ShadowRoot) {
    const entry = this.entries.find(it => it.shadowRoot === shadowRoot)
    if (entry !== undefined) {
      deleteValue(this.entries, it => it === entry)
    }
  }

  addStyle(text: string) {
    this.observer.observe()
    const id = `shadow-dom-style-${getRandomId()}`
    const element = addStyle(text, id)
    const destroy = this.observer.watchShadowDom({
      added: async shadowDom => {
        if (this.shadowRoots.includes(shadowDom.shadowRoot)) {
          return
        }
        this.addEntry(shadowDom.shadowRoot)
        const sheet = new CSSStyleSheet()
        await sheet.replace(element.innerHTML)
        shadowDom.shadowRoot.adoptedStyleSheets.push(sheet)
      },
      removed: shadowDom => {
        this.removeEntry(shadowDom.shadowRoot)
      },
    })
    return () => {
      destroy()
      element.remove()
    }
  }
}
