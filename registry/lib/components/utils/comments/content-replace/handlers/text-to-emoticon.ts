import { createEmoticonImage, isUrl } from '../utils'
import { NodeContentReplacer } from './node-content-replacer'

export class TextToEmoticonReplacer extends NodeContentReplacer {
  isKeywordMatch(node: Node, keyword: string, target: string) {
    if (node instanceof Text) {
      return node.textContent.includes(keyword) && isUrl(target)
    }
    return false
  }
  replaceContent(node: Node, keyword: string, target: string): Node[] {
    const index = node.textContent.indexOf(keyword)
    if (index === -1 || !(node instanceof Text)) {
      return []
    }
    const leftPart = new Text(node.textContent.substring(0, index))
    const imageElement = createEmoticonImage(target, keyword)
    const rightPart = new Text(node.textContent.substring(index + keyword.length))
    node.replaceWith(leftPart, imageElement, rightPart)
    return [rightPart]
  }
}
