import { NodeContentReplacer } from './node-content-replacer'

export class RecursiveReplacer extends NodeContentReplacer {
  isKeywordMatch() {
    return true
  }
  replaceContent(node: Node): Node[] {
    return Array.from(node.childNodes)
  }
}
