import { NodeContentReplacer } from './node-content-replacer'

export class EmoticonToTextReplacer extends NodeContentReplacer {
  isKeywordMatch(node: Node, keyword: string) {
    if (node instanceof HTMLImageElement) {
      return node.alt === keyword
    }
    return false
  }
  replaceContent(node: Node, keyword: string, target: string): Node[] {
    if (!(node instanceof HTMLImageElement)) {
      return []
    }
    if (target === '') {
      node.remove()
    } else {
      node.replaceWith(new Text(target))
    }
    return []
  }
}
