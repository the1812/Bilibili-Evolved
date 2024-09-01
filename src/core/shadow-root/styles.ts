import { deleteValue, getRandomId } from '../utils'
import { ShadowDomObserver, shadowDomObserver } from './dom-observer'

export class ShadowRootStyles {
  observer: ShadowDomObserver = shadowDomObserver
  protected stylesMap = new Map<string, CSSStyleSheet>()

  protected addStyleRecord(id: string, style: CSSStyleSheet) {
    this.stylesMap.set(id, style)
  }

  protected removeStyleRecord(id: string) {
    if (this.stylesMap.has(id)) {
      this.stylesMap.delete(id)
    }
  }

  async addStyle(text: string) {
    this.observer.observe()
    const id = `shadow-dom-style-${getRandomId()}`
    const sheet = new CSSStyleSheet()
    await sheet.replace(text)
    document.adoptedStyleSheets.push(sheet)
    this.addStyleRecord(id, sheet)

    const destroy = this.observer.watchShadowDom({
      added: async shadowDom => {
        shadowDom.shadowRoot.adoptedStyleSheets.push(sheet)
      },
    })
    return () => {
      destroy()
      deleteValue(document.adoptedStyleSheets, it => it === sheet)
      this.removeStyleRecord(id)
    }
  }
}
