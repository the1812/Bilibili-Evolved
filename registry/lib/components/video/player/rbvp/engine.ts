import { matchRbvpNamespace, rbvpNamespaces } from './registry'
import type {
  RBVPBasicMatcherNode,
  RBVPDebugTraceStep,
  RBVPEngineContext,
  RBVPLocalRuleSet,
  RBVPMatchResult,
  RBVPMatcherNode,
  RBVPParsedRule,
  RBVPNamespaceDebugInfo,
  RBVPRuleSetMatcherType,
  RBVPVideoContext,
} from './types'

const normalize = (value: string) => value.trim().toLowerCase()

const matchText = (target: string, query: string) => {
  const trimmed = query.trim()
  if (trimmed.startsWith('/') && trimmed.endsWith('/') && trimmed.length >= 2) {
    const pattern = trimmed.slice(1, -1)
    if (!pattern) {
      return false
    }
    try {
      return new RegExp(pattern, 'i').test(target)
    } catch {
      return false
    }
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    const text = trimmed.slice(1, -1)
    if (!text) {
      return false
    }
    return normalize(target) === normalize(text)
  }
  return normalize(target).includes(normalize(trimmed))
}

const matchTimeExpression = (duration: number, expression: string) => {
  const text = expression.trim()
  const rangeMatch = text.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/)
  if (rangeMatch) {
    const [, min, max] = rangeMatch
    return duration >= Number(min) && duration <= Number(max)
  }
  const compareMatch = text.match(/^(>=|<=|>|<|=)?\s*(\d+(?:\.\d+)?)$/)
  if (!compareMatch) {
    return false
  }
  const [, operator = '=', rawValue] = compareMatch
  const value = Number(rawValue)
  switch (operator) {
    case '>':
      return duration > value
    case '>=':
      return duration >= value
    case '<':
      return duration < value
    case '<=':
      return duration <= value
    case '=':
    default:
      return duration === value
  }
}

const parseVideoIdArgument = (argument: string) => {
  const text = argument.trim()
  const pageMatch = text.match(/^(.*?)#(\d+)$/)
  if (!pageMatch) {
    return {
      id: text,
      partIndex: null,
    }
  }
  const [, id, partIndex] = pageMatch
  return {
    id: id.trim(),
    partIndex: Number(partIndex),
  }
}

const matchVideoId = (target: string, argument: string, video: RBVPVideoContext) => {
  const { id, partIndex } = parseVideoIdArgument(argument)
  if (!id) {
    return false
  }
  if (partIndex !== null && video.partIndex !== partIndex) {
    return false
  }
  return normalize(target) === normalize(id)
}

const matchBasicValue = (
  type: RBVPRuleSetMatcherType | RBVPBasicMatcherNode['type'],
  argument: string,
  video: RBVPVideoContext,
) => {
  switch (type) {
    case 'BVID':
      return matchVideoId(video.bvid, argument, video)
    case 'AID':
      return matchVideoId(video.aid, argument, video)
    case 'SECTION':
      return normalize(video.sectionId) === normalize(argument)
    case 'SECTION-ROOT':
      return normalize(video.sectionRootId) === normalize(argument)
    case 'SECTION-NAME':
      return matchText(video.sectionName, argument)
    case 'SECTION-ROOT-NAME':
      return matchText(video.sectionRootName, argument)
    case 'UP':
      return video.upUid === argument.trim()
    case 'TAG':
      return video.tags.some(tag => matchText(tag, argument))
    case 'TAG-MUSIC':
      return video.musicTags.some(mt => matchText(mt.musicId, argument))
    case 'PARTITION':
      return normalize(video.partitionId) === normalize(argument)
    case 'PART':
      return matchText(video.partTitle, argument)
    case 'TITLE':
      return matchText(video.title, argument)
    case 'TIME':
      return matchTimeExpression(video.duration, argument)
    case 'FINAL':
      return true
    default:
      return false
  }
}

const matchRuleSet = (ruleSet: RBVPLocalRuleSet | undefined, video: RBVPVideoContext) => {
  if (!ruleSet) {
    return false
  }
  return ruleSet.entries.some(entry => matchBasicValue(ruleSet.matcherType, entry, video))
}

const addDebugStep = (
  steps: RBVPDebugTraceStep[],
  type: RBVPDebugTraceStep['type'],
  depth: number,
  message: string,
  matched?: boolean,
  line?: number,
) => {
  steps.push({
    type,
    depth,
    matched,
    line,
    message,
  })
}

const formatBasicMatcherText = (
  matcher: RBVPBasicMatcherNode,
  context: RBVPEngineContext,
  matched: boolean,
) => {
  switch (matcher.type) {
    case 'FINAL':
      return `FINAL 兜底规则${matched ? '命中' : '未命中'}`
    case 'RULE-SET': {
      const ruleSet = context.localRuleSets[matcher.argument]
      if (!ruleSet) {
        return `RULE-SET(${matcher.argument}) 未找到对应规则集`
      }
      return `RULE-SET(${matcher.argument}) 按 ${ruleSet.matcherType} 检查 ${
        ruleSet.entries.length
      } 项，${matched ? '命中' : '未命中'}`
    }
    default:
      return `${matcher.type}(${matcher.argument}) ${matched ? '命中' : '未命中'}`
  }
}

const matchMatcher = (
  matcher: RBVPMatcherNode,
  context: RBVPEngineContext,
  steps: RBVPDebugTraceStep[],
  depth: number,
): boolean => {
  if (matcher.kind === 'logic') {
    addDebugStep(steps, 'matcher', depth, `${matcher.operator} 条件组开始检查`)
    let matched = false
    switch (matcher.operator) {
      case 'AND': {
        matched = true
        for (const condition of matcher.conditions) {
          if (!matchMatcher(condition, context, steps, depth + 1)) {
            matched = false
            break
          }
        }
        break
      }
      case 'OR': {
        matched = false
        for (const condition of matcher.conditions) {
          if (matchMatcher(condition, context, steps, depth + 1)) {
            matched = true
            break
          }
        }
        break
      }
      case 'NOT':
        matched = !matchMatcher(matcher.conditions[0], context, steps, depth + 1)
        break
      default:
        matched = false
        break
    }
    addDebugStep(
      steps,
      'matcher',
      depth,
      `${matcher.operator} 条件组${matched ? '命中' : '未命中'}`,
      matched,
    )
    return matched
  }
  let matched = false
  if (matcher.type === 'RULE-SET') {
    matched = matchRuleSet(context.localRuleSets[matcher.argument], context.video)
  } else {
    matched = matchBasicValue(matcher.type, matcher.argument, context.video)
  }
  addDebugStep(steps, 'matcher', depth, formatBasicMatcherText(matcher, context, matched), matched)
  return matched
}

export const executeRbvpRules = async (
  rules: RBVPParsedRule[],
  namespace: string,
  context: RBVPEngineContext,
): Promise<RBVPMatchResult> => {
  const provider = rbvpNamespaces[namespace]
  const steps: RBVPDebugTraceStep[] = []
  const displayName = provider?.displayName || namespace
  const createDebugResult = (
    matched: boolean,
    summary: string,
    line?: number,
  ): RBVPNamespaceDebugInfo => ({
    namespace,
    displayName,
    matched,
    line,
    summary,
    steps,
  })
  if (!provider) {
    return {
      matched: false,
      message: `未注册命名空间 ${namespace}`,
      debug: createDebugResult(false, `未注册命名空间 ${namespace}`),
    }
  }
  for (const rule of rules) {
    addDebugStep(steps, 'rule', 0, `尝试第 ${rule.line} 行: ${rule.raw}`, undefined, rule.line)
    if (!matchMatcher(rule.matcher, context, steps, 1)) {
      addDebugStep(steps, 'info', 1, `第 ${rule.line} 行匹配失败，继续尝试下一行`, false, rule.line)
      continue
    }
    const action = rule.actions.find(item => matchRbvpNamespace(namespace, item.namespace))
    if (!action) {
      addDebugStep(
        steps,
        'action',
        1,
        `第 ${rule.line} 行命中匹配器，但没有找到 ${namespace} 对应动作`,
        false,
        rule.line,
      )
      continue
    }
    addDebugStep(
      steps,
      'action',
      1,
      `第 ${rule.line} 行使用动作 ${action.namespace}:${action.value}`,
      true,
      rule.line,
    )
    try {
      await provider.validateAction?.(action.value)
      const resolved = await provider.resolveAction(action.value, context)
      if (!resolved) {
        addDebugStep(
          steps,
          'execute',
          1,
          `第 ${rule.line} 行动作解析失败，继续尝试下一行`,
          false,
          rule.line,
        )
        continue
      }
      const executedMessage = await provider.execute(resolved, context)
      const message = executedMessage || `${namespace} => ${resolved.displayValue}`
      const summary = `第 ${rule.line} 行命中，${message}`
      addDebugStep(steps, 'execute', 1, summary, true, rule.line)
      return {
        matched: true,
        line: rule.line,
        rawRule: rule.raw,
        namespace,
        displayValue: resolved.displayValue,
        message,
        debug: createDebugResult(true, summary, rule.line),
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const summary = `第 ${rule.line} 行执行失败: ${message}`
      addDebugStep(steps, 'execute', 1, summary, false, rule.line)
      return {
        matched: false,
        error: message,
        line: rule.line,
        rawRule: rule.raw,
        namespace,
        message,
        debug: createDebugResult(false, summary, rule.line),
      }
    }
  }
  const summary = `未找到适用于 ${displayName} 的规则`
  addDebugStep(steps, 'info', 0, summary, false)
  return {
    matched: false,
    debug: createDebugResult(false, summary),
  }
}
