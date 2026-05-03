import type {
  RBVPActionNode,
  RBVPBasicMatcherType,
  RBVPLogicMatcherType,
  RBVPMatcherNode,
  RBVPParsedRule,
} from './types'

const basicMatcherTypes: RBVPBasicMatcherType[] = [
  'BVID',
  'AID',
  'SECTION',
  'SECTION-ROOT',
  'SECTION-NAME',
  'SECTION-ROOT-NAME',
  'UP',
  'TAG',
  'TAG-MUSIC',
  'PARTITION',
  'TITLE',
  'PART',
  'TIME',
  'RULE-SET',
  'FINAL',
]

export class RBVPParseError extends Error {
  constructor(readonly line: number, message: string) {
    super(`第 ${line} 行: ${message}`)
  }
}

const unwrap = (source: string, left: string, right: string) => {
  const text = source.trim()
  if (!text.startsWith(left) || !text.endsWith(right)) {
    return text
  }
  let depth = 0
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === left) {
      depth++
    } else if (char === right) {
      depth--
      if (depth === 0 && i !== text.length - 1) {
        return text
      }
    }
  }
  return text.slice(1, -1).trim()
}

const splitTopLevel = (source: string, line?: number, context = '表达式') => {
  const result: string[] = []
  let depthParen = 0
  let depthBrace = 0
  let start = 0
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (char === '(') {
      depthParen++
    } else if (char === ')') {
      depthParen--
      if (depthParen < 0) {
        throw new RBVPParseError(line ?? 0, `${context} 存在多余的右括号`)
      }
    } else if (char === '{') {
      depthBrace++
    } else if (char === '}') {
      depthBrace--
      if (depthBrace < 0) {
        throw new RBVPParseError(line ?? 0, `${context} 存在多余的右花括号`)
      }
    } else if (char === ',' && depthParen === 0 && depthBrace === 0) {
      result.push(source.slice(start, i).trim())
      start = i + 1
    }
  }
  if (depthParen !== 0) {
    throw new RBVPParseError(line ?? 0, `${context} 的括号没有正确闭合`)
  }
  if (depthBrace !== 0) {
    throw new RBVPParseError(line ?? 0, `${context} 的花括号没有正确闭合`)
  }
  result.push(source.slice(start).trim())
  return result.filter(it => it !== '')
}

const parseAction = (source: string, line: number): RBVPActionNode => {
  const index = source.indexOf(':')
  if (index === -1) {
    throw new RBVPParseError(line, `动作 "${source.trim()}" 缺少命名空间，正确格式为 namespace:value`)
  }
  const namespace = source.slice(0, index).trim()
  const value = source.slice(index + 1).trim()
  if (!namespace || !value) {
    throw new RBVPParseError(line, `无效动作 "${source}"`)
  }
  return {
    namespace,
    value,
  }
}

const parseActions = (source: string, line: number) => {
  const text = source.trim()
  if (text.startsWith('{')) {
    return splitTopLevel(unwrap(text, '{', '}'), line, '动作列表').map(item => parseAction(item, line))
  }
  return [parseAction(text, line)]
}

let parseMatcher: (source: string, line: number) => RBVPMatcherNode

const splitLogicConditions = (source: string, line: number) => {
  const text = source.trim()
  const unwrapped = unwrap(text, '(', ')')
  const normalized = unwrapped !== text && unwrapped.startsWith('(') ? unwrapped : text
  return splitTopLevel(normalized, line, '逻辑条件').map(item => unwrap(item, '(', ')'))
}

function parseLogicMatcher(operator: RBVPLogicMatcherType, source: string, line: number) {
  const conditions = splitLogicConditions(source, line).map(item => parseMatcher(item, line))
  if (conditions.length === 0) {
    throw new RBVPParseError(line, `${operator} 至少需要一个条件`)
  }
  if (operator === 'NOT' && conditions.length !== 1) {
    throw new RBVPParseError(line, 'NOT 只能包含一个条件')
  }
  return {
    kind: 'logic' as const,
    operator,
    conditions,
  }
}

parseMatcher = (source: string, line: number): RBVPMatcherNode => {
  const parts = splitTopLevel(source, line, '匹配器')
  if (parts.length === 0) {
    throw new RBVPParseError(line, '缺少匹配器')
  }
  const type = parts[0].trim().toUpperCase() as RBVPBasicMatcherType | RBVPLogicMatcherType
  if (['AND', 'OR', 'NOT'].includes(type)) {
    return parseLogicMatcher(type as RBVPLogicMatcherType, parts.slice(1).join(', '), line)
  }
  if (!basicMatcherTypes.includes(type as RBVPBasicMatcherType)) {
    throw new RBVPParseError(line, `无效匹配类型 "${parts[0].trim()}"`)
  }
  if (type === 'FINAL') {
    return {
      kind: 'basic',
      type: 'FINAL',
    }
  }
  const argument = parts.slice(1).join(', ').trim()
  if (!argument) {
    throw new RBVPParseError(line, `${type} 缺少匹配参数`)
  }
  return {
    kind: 'basic',
    type: type as RBVPBasicMatcherType,
    argument,
  }
}

const parseRule = (source: string, line: number): RBVPParsedRule => {
  const parts = splitTopLevel(source, line, '规则')
  if (parts.length < 2) {
    throw new RBVPParseError(line, '规则至少需要匹配器和动作')
  }
  const isFinalShortcut = parts[0].trim().toUpperCase() === 'FINAL' && parts.length === 2
  const matcherSource = isFinalShortcut ? parts[0] : parts.slice(0, -1).join(', ')
  const actionSource = parts[parts.length - 1]
  return {
    line,
    raw: source,
    matcher: parseMatcher(matcherSource, line),
    actions: parseActions(actionSource, line),
  }
}

export const parseRbvpRules = (source: string) =>
  source
    .split('\n')
    .map((lineText, index) => ({ lineText: lineText.trim(), line: index + 1 }))
    .filter(({ lineText }) => lineText !== '' && !lineText.startsWith('#'))
    .map(({ lineText, line }) => parseRule(lineText, line))
