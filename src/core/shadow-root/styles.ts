import { deleteValue, getRandomId } from '../utils'
import { ShadowDomEntry } from './dom-entry'
import { ShadowDomObserver, shadowDomObserver } from './dom-observer'

export interface ShadowRootStyleEntry {
  id: string
  styleSheet: CSSStyleSheet
  adoptedShadowDoms: ShadowDomEntry[]
  remove: () => void
}
export interface ShadowRootStyleDefinition {
  id?: string
  style: string
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

  async addStyle(definition: ShadowRootStyleDefinition) {
    const { id, style } = definition
    this.observer.observe()
    const entryId = `shadow-dom-style-${id !== undefined ? lodash.kebabCase(id) : getRandomId()}`
    const styleSheet = new CSSStyleSheet()
    await styleSheet.replace(style)

    const adoptedShadowDoms: ShadowDomEntry[] = []
    const destroy = this.observer.watchShadowDom({
      added: async shadowDom => {
        shadowDom.shadowRoot.adoptedStyleSheets.push(styleSheet)
        adoptedShadowDoms.push(shadowDom)
      },
    })

    const entry: ShadowRootStyleEntry = {
      id: entryId,
      styleSheet,
      adoptedShadowDoms,
      remove: () => {
        destroy()
        adoptedShadowDoms.forEach(it =>
          deleteValue(it.shadowRoot.adoptedStyleSheets, sheet => sheet === styleSheet),
        )
        this.removeEntry(id)
      },
    }
    this.addEntry(id, entry)
    return entry
  }
}

export const shadowRootStyles = new ShadowRootStyles()
