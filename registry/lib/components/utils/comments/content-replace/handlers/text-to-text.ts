import { NodeContentReplacer } from './node-content-replacer'

export class TextToTextReplacer extends NodeContentReplacer {
  isKeywordMatch(node: Node, keyword: string) {
    if (node instanceof Text) {
      return node.textContent.includes(keyword)
    }
    return false
  }
  replaceContent(node: Node, keyword: string, target: string): Node[] {
    const index = node.textContent.indexOf(keyword)
    if (index === -1) {
      return []
    }
    const leftPart = node.textContent.substring(0, index)
    const rightPart = node.textContent.substring(index + keyword.length)
    node.textContent = `${leftPart}${target}${rightPart}`
    return []
  }
}
