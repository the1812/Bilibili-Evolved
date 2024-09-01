import { deleteValue, getRandomId } from '../utils'
import { ShadowDomObserver, shadowDomObserver } from './dom-observer'

interface ShadowRootStyleEntry {
  id: string
  styleSheet: CSSStyleSheet
  remove: () => void
}
export class ShadowRootStyles {
  observer: ShadowDomObserver = shadowDomObserver
  protected stylesMap = new Map<string, ShadowRootStyleEntry>()

  protected addEntry(id: string, entry: ShadowRootStyleEntry) {
    this.stylesMap.set(id, entry)
  }

  protected removeEntry(id: string) {
    if (this.stylesMap.has(id)) {
      this.stylesMap.delete(id)
    }
  }

  async addStyle(text: string) {
    this.observer.observe()
    const id = `shadow-dom-style-${getRandomId()}`
    const styleSheet = new CSSStyleSheet()
    await styleSheet.replace(text)
    document.adoptedStyleSheets.push(styleSheet)

    const destroy = this.observer.watchShadowDom({
      added: async shadowDom => {
        shadowDom.shadowRoot.adoptedStyleSheets.push(styleSheet)
      },
    })

    const entry: ShadowRootStyleEntry = {
      id,
      styleSheet,
      remove: () => {
        destroy()
        deleteValue(document.adoptedStyleSheets, it => it === styleSheet)
        this.removeEntry(id)
      },
    }
    this.addEntry(id, entry)
    return entry
  }
}
