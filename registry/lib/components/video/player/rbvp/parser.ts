import type {
  RBVPActionNode,
  RBVPBasicMatcherType,
  RBVPLogicMatcherType,
  RBVPMatcherNode,
  RBVPParsedProgram,
  RBVPParsedRule,
  RBVPProgramNode,
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
    throw new RBVPParseError(
      line,
      `动作 "${source.trim()}" 缺少命名空间，正确格式为 namespace:value`,
    )
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
    return splitTopLevel(unwrap(text, '{', '}'), line, '动作列表').map(item =>
      parseAction(item, line),
    )
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

export const parseRbvpRuleLine = (source: string, line: number): RBVPParsedRule => {
  const parts = splitTopLevel(source, line, '规则')
  if (parts.length < 2) {
    throw new RBVPParseError(line, '规则至少需要匹配器和动作')
  }
  const isFinalShortcut = parts[0].trim().toUpperCase() === 'FINAL' && parts.length === 2
  const matcherSource = isFinalShortcut ? parts[0] : parts.slice(0, -1).join(', ')
  const actionSource = parts[parts.length - 1]
  return {
    kind: 'rule' as const,
    line,
    raw: source,
    matcher: parseMatcher(matcherSource, line),
    actions: parseActions(actionSource, line),
  }
}

// @alias <alias> => <canonicalNamespace>
const aliasNamePattern = /^[A-Za-z0-9_-]+$/

export const parseAliasDirectiveLine = (
  source: string,
  lineNo: number,
): { alias: string; canonical: string } | null => {
  const text = source.trim()
  if (!text.startsWith('@alias')) {
    return null
  }
  const rest = text.slice('@alias'.length).trim()
  const eqIndex = rest.indexOf('=>')
  if (eqIndex === -1) {
    throw new RBVPParseError(
      lineNo,
      '@alias 指令缺少 "=>"，正确格式为 @alias <别名> => <主命名空间>',
    )
  }
  const alias = rest.slice(0, eqIndex).trim()
  const canonical = rest.slice(eqIndex + 2).trim()
  if (!alias || !canonical) {
    throw new RBVPParseError(lineNo, '@alias 指令缺少别名或主命名空间')
  }
  if (!aliasNamePattern.test(alias)) {
    throw new RBVPParseError(
      lineNo,
      `@alias 别名 "${alias}" 包含非法字符，仅允许字母、数字、下划线与连字符`,
    )
  }
  if (!aliasNamePattern.test(canonical)) {
    throw new RBVPParseError(
      lineNo,
      `@alias 主命名空间 "${canonical}" 包含非法字符，仅允许字母、数字、下划线与连字符`,
    )
  }
  return { alias, canonical }
}

// 仅扫描 @alias 指令行，跳过其它行与解析错误，供 UI 安全读取别名
export const parseRbvpAliases = (source: string): { alias: string; canonical: string }[] => {
  const aliases: { alias: string; canonical: string }[] = []
  source.split('\n').forEach((lineText, index) => {
    const trimmed = lineText.trim()
    if (!trimmed.startsWith('@alias')) {
      return
    }
    try {
      const parsed = parseAliasDirectiveLine(trimmed, index + 1)
      if (parsed) {
        aliases.push(parsed)
      }
    } catch {
      // 忽略非法 @alias 行，UI 仅展示合法别名
    }
  })
  return aliases
}

export const parseRbvpRules = (source: string): RBVPParsedProgram => {
  const aliases: Record<string, string> = {}
  const rules: RBVPParsedRule[] = []
  const nodes: RBVPProgramNode[] = []
  source.split('\n').forEach((lineText, index) => {
    const trimmed = lineText.trim()
    const lineNo = index + 1
    if (trimmed === '') {
      nodes.push({ kind: 'blank' })
      return
    }
    if (trimmed.startsWith('#')) {
      nodes.push({ kind: 'comment', text: lineText })
      return
    }
    if (trimmed.startsWith('@alias')) {
      const parsed = parseAliasDirectiveLine(trimmed, lineNo)
      if (!parsed) {
        nodes.push({ kind: 'raw', text: lineText })
        return
      }
      const existing = aliases[parsed.alias]
      if (existing !== undefined && existing !== parsed.canonical) {
        throw new RBVPParseError(
          lineNo,
          `别名 "${parsed.alias}" 重复声明且指向不同主命名空间（${existing} 与 ${parsed.canonical}）`,
        )
      }
      aliases[parsed.alias] = parsed.canonical
      nodes.push({ kind: 'alias', alias: parsed.alias, canonical: parsed.canonical })
      return
    }
    const rule = parseRbvpRuleLine(trimmed, lineNo)
    rules.push(rule)
    nodes.push(rule)
  })
  return { aliases, rules, nodes }
}

export const parseRbvpProgramLenient = (source: string): RBVPParsedProgram => {
  const aliases: Record<string, string> = {}
  const rules: RBVPParsedRule[] = []
  const nodes: RBVPProgramNode[] = []
  source.split('\n').forEach((lineText, index) => {
    const trimmed = lineText.trim()
    const lineNo = index + 1
    if (trimmed === '') {
      nodes.push({ kind: 'blank' })
      return
    }
    if (trimmed.startsWith('#')) {
      nodes.push({ kind: 'comment', text: lineText })
      return
    }
    if (trimmed.startsWith('@alias')) {
      try {
        const parsed = parseAliasDirectiveLine(trimmed, lineNo)
        if (parsed) {
          if (aliases[parsed.alias] === undefined) {
            aliases[parsed.alias] = parsed.canonical
          }
          nodes.push({ kind: 'alias', alias: parsed.alias, canonical: parsed.canonical })
          return
        }
      } catch {
        nodes.push({ kind: 'raw', text: lineText })
        return
      }
      nodes.push({ kind: 'raw', text: lineText })
      return
    }
    try {
      const rule = parseRbvpRuleLine(trimmed, lineNo)
      rules.push(rule)
      nodes.push(rule)
    } catch {
      nodes.push({ kind: 'raw', text: lineText })
    }
  })
  return { aliases, rules, nodes }
}
