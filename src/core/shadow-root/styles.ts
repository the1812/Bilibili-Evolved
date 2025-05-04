import { addComponentListener, removeComponentListener } from '../settings'
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
    const entryId = id !== undefined ? lodash.kebabCase(id) : `shadow-dom-style-${getRandomId()}`
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

  removeStyle(id: string) {
    if (this.stylesMap.has(id)) {
      const style = this.stylesMap.get(id)
      style.remove()
      this.removeEntry(id)
    }
  }

  toggleWithComponent(path: string, definition: ShadowRootStyleDefinition) {
    let entry: ShadowRootStyleEntry | undefined
    const handler = async (rawValue: unknown) => {
      const value = Boolean(rawValue)
      if (value) {
        entry = await this.addStyle(definition)
      } else if (entry !== undefined) {
        this.removeStyle(entry.id)
      }
    }
    addComponentListener(path, handler, true)
    return () => removeComponentListener(path, handler)
  }
}

export const shadowRootStyles = new ShadowRootStyles()
