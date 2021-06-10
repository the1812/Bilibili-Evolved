import { defaultLanguageCode } from '@/core/utils/i18n'
import { allMutations } from '@/core/observer'
import { ComponentEntry } from '../types'
import { RegexTranslation, Translation } from './types'

/* eslint-disable */

export class Translator {
  static textNode: TextNodeTranslator
  static title: TitleTranslator
  static placeholder: PlaceholderTranslator
  static sensitiveTranslators: Translator[]
  static map: Map<string, any>
  static regex: [RegExp, string][]

  accepts(node: Node) { return node.nodeType === Node.ELEMENT_NODE }
  getValue(node: Node) { return node.nodeValue }
  setValue(node: Node, value: string) { node.nodeValue = value }
  getElement(node: Node) { return node as Element }
  translate(node: Node) {
    let value = this.getValue(node)
    if (!value || typeof value !== 'string' || value === '*') {
      return
    }
    value = value.trim()
    const translation = Translator.map.get(value)
    if (translation === undefined) {
      const result = Translator.regex.find(([r]) => r.test(value!))
      if (result) {
        const [regex, replacement] = result
        this.setValue(node, value.replace(regex, replacement))
      }
    } else if (typeof translation === 'string') {
      this.setValue(node, translation)
    } else if (Array.isArray(translation)) {
      let finalTranslation = null
      for (const subTranslation of translation) {
        if (typeof subTranslation === 'string') {
          finalTranslation = subTranslation
        } else {
          const { text, selector, not } = subTranslation
          if (this.getElement(node).matches(selector) !== Boolean(not)) {
            finalTranslation = text
          }
        }
      }
      if (finalTranslation !== null) {
        this.setValue(node, finalTranslation)
      }
    } else {
      const { text, selector, not } = translation
      if (this.getElement(node).matches(selector) !== Boolean(not)) {
        this.setValue(node, text)
      }
    }
  }
  // https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
  static walk(rootElement: Node, action: (node: Node) => void) {
    const walker = document.createNodeIterator(rootElement, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
    let node = walker.nextNode()
    while (node) {
      action(node)
      node = walker.nextNode()
    }
  }
  static translate(rootElement: Node) {
    if (rootElement.nodeType === Node.TEXT_NODE) {
      Translator.textNode.translate(rootElement)
      return
    }
    const translateNode = (node: Node) => {
      for (const translator of Translator.sensitiveTranslators) {
        if (translator.accepts(node)) {
          translator.translate(node)
        }
      }
    }
    translateNode(rootElement)
    Translator.walk(rootElement, translateNode)
  }
  static translateCssMatches() {
    const selectors = Translator.map.get('*')
    if (!selectors) {
      return
    }
    for (const { selector, text } of selectors) {
      const element = document.querySelector(selector)
      if (element) {
        [...element.childNodes].filter(it => it.nodeType === Node.TEXT_NODE).forEach(it => it.nodeValue = text)
      }
    }
  }
}
export class TextNodeTranslator extends Translator {
  accepts(node: Node) { return node.nodeType === Node.TEXT_NODE }
  getElement(node: Node) {
    return node.parentElement!
  }
}
export class TitleTranslator extends Translator {
  getValue(node: Node) { return (node as Element).getAttribute('title') }
  setValue(node: Node, value: string) {
    (node as Element).setAttribute('title', value)
  }
}
export class PlaceholderTranslator extends Translator {
  // accepts(node: Node) { return node.nodeName === "INPUT" && (node as HTMLInputElement).type.toUpperCase() === "TEXT" || node.nodeName === "TEXTAREA"; }
  getValue(node: Node) { return (node as Element).getAttribute('placeholder') }
  setValue(node: Node, value: string) {
    (node as Element).setAttribute('placeholder', value)
  }
}

Translator.textNode = new TextNodeTranslator()
Translator.title = new TitleTranslator()
Translator.placeholder = new PlaceholderTranslator()
Translator.sensitiveTranslators = [
  Translator.textNode,
  Translator.title,
  Translator.placeholder,
]

export const startTranslate: ComponentEntry = async () => {
  const { getSelectedLanguage } = await import('./helpers')
  const languageCode = getSelectedLanguage()
  if (languageCode === defaultLanguageCode) {
    return
  }
  const { registerAndGetData } = await import('@/plugins/data')
  const [map, regex] = registerAndGetData(
    `i18n.${languageCode}`,
    new Map<string, Translation>(),
    [] as RegexTranslation,
  )
  console.log(languageCode, map.size, regex.length)
  if (map.size === 0 && regex.length === 0) {
    return
  }
  document.documentElement.setAttribute('lang', languageCode)
  Translator.map = map
  Translator.regex = regex

  Translator.translate(document.body)
  Translator.translateCssMatches()
  allMutations(records => {
    records.forEach(it => {
      if (it.type === 'childList') {
        if (it.addedNodes.length > 0) {
          Translator.translateCssMatches()
        }
        it.addedNodes.forEach(node => {
          Translator.translate(node)
        })
      } else if (it.type === 'characterData') {
        Translator.textNode.translate(it.target)
      } else if (it.type === 'attributes') {
        if (it.attributeName === 'title') {
          Translator.title.translate(it.target)
        } else if (it.attributeName === 'placeholder') {
          Translator.placeholder.translate(it.target)
        }
      }
    })
  })
}
