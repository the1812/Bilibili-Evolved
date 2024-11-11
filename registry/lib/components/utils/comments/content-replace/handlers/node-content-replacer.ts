export abstract class NodeContentReplacer {
  abstract isKeywordMatch(node: Node, keyword: string, target: string): boolean
  abstract replaceContent(node: Node, keyword: string, target: string): Node[]
}
