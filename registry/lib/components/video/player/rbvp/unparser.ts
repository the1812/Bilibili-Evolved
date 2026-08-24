import type {
  RBVPActionNode,
  RBVPBasicMatcherNode,
  RBVPLogicMatcherNode,
  RBVPMatcherNode,
  RBVPParsedProgram,
  RBVPParsedRule,
  RBVPProgramNode,
} from './types'

function unparseBasicMatcher(matcher: RBVPBasicMatcherNode): string {
  if (matcher.type === 'FINAL') {
    return 'FINAL'
  }
  const argument = matcher.argument ?? ''
  return argument === '' ? matcher.type : `${matcher.type}, ${argument}`
}

let unparseMatcher: (matcher: RBVPMatcherNode) => string

function unparseLogicMatcher(matcher: RBVPLogicMatcherNode): string {
  const conditions = matcher.conditions
    .map(condition => `(${unparseMatcher(condition)})`)
    .join(', ')
  return conditions === '' ? matcher.operator : `${matcher.operator}, ${conditions}`
}

unparseMatcher = (matcher: RBVPMatcherNode): string =>
  matcher.kind === 'logic' ? unparseLogicMatcher(matcher) : unparseBasicMatcher(matcher)

export const unparseAction = (action: RBVPActionNode): string =>
  `${action.namespace}:${action.value}`

export const unparseActions = (actions: RBVPActionNode[]): string => {
  if (actions.length === 0) {
    return ''
  }
  if (actions.length === 1) {
    return unparseAction(actions[0])
  }
  return `{${actions.map(unparseAction).join(', ')}}`
}

export const unparseRbvpRule = (rule: RBVPParsedRule): string => {
  const matcher = unparseMatcher(rule.matcher)
  const actions = unparseActions(rule.actions)
  return actions === '' ? matcher : `${matcher}, ${actions}`
}

export const unparseRbvpNode = (node: RBVPProgramNode): string => {
  switch (node.kind) {
    case 'comment':
      return node.text
    case 'blank':
      return ''
    case 'alias':
      return `@alias ${node.alias} => ${node.canonical}`
    case 'raw':
      return node.text
    case 'rule':
      return unparseRbvpRule(node)
    default:
      return ''
  }
}

export const unparseRbvpProgram = (program: RBVPParsedProgram): string =>
  program.nodes.map(unparseRbvpNode).join('\n')
