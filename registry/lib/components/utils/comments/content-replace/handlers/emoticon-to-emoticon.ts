import { isUrl } from '../utils'
import { NodeContentReplacer } from './node-content-replacer'

export class EmoticonToEmoticonReplacer extends NodeContentReplacer {
  isKeywordMatch(node: Node, keyword: string, target: string) {
    if (node instanceof HTMLImageElement) {
      return node.alt === keyword && isUrl(target)
    }
    return false
  }
  replaceContent(node: Node, keyword: string, target: string): Node[] {
    if (!(node instanceof HTMLImageElement)) {
      return []
    }
    node.src = target
    return []
  }
}
