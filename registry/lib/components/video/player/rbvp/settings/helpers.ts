import { parseRbvpRules } from '../parser'
import type {
  RBVPActionNode,
  RBVPBasicMatcherType,
  RBVPDebugContextSnapshot,
  RBVPDebugTraceStep,
  RBVPLogicMatcherType,
  RBVPMatcherNode,
  RBVPParsedRule,
  RBVPLocalRuleSetMap,
  RBVPRuleSetMatcherType,
} from '../types'

export type RuleEditorMode = 'visual' | 'text' | 'context' | 'debug'
export type VisualConditionItem = {
  id: string
  matcherKind: 'basic' | 'logic'
  matcherType: RBVPBasicMatcherType
  matcherArgument: string
  logicOperator: RBVPLogicMatcherType
  conditions: VisualConditionItem[]
}
export type VisualRuleItem = {
  id: string
  title: string
  matcher: VisualConditionItem
  actions: string
  collapsed: boolean
  editingTitle: boolean
}
export type RBVPMatcherDefaultArguments = Record<RBVPBasicMatcherType, string>

const createRuleId = () => `rbvp-rule-${Math.random().toString(36).slice(2, 10)}`
const createConditionId = () => `rbvp-condition-${Math.random().toString(36).slice(2, 10)}`
const createEmptyMatcherDefaultArguments = (): RBVPMatcherDefaultArguments => ({
  BVID: '',
  AID: '',
  SECTION: '',
  'SECTION-ROOT': '',
  'SECTION-NAME': '',
  'SECTION-ROOT-NAME': '',
  UP: '',
  TAG: '',
  'TAG-MUSIC': '',
  PARTITION: '',
  TITLE: '',
  PART: '',
  TIME: '',
  'RULE-SET': '',
  FINAL: '',
})

export const createMatcherDefaultArguments = (
  debugContext: RBVPDebugContextSnapshot | null,
  ruleSetNames: string[],
): RBVPMatcherDefaultArguments => {
  const defaults = createEmptyMatcherDefaultArguments()
  const video = debugContext?.video
  if (!video) {
    defaults['RULE-SET'] = ruleSetNames[0] ?? ''
    return defaults
  }
  const partSuffix = video.partIndex > 0 ? `#${video.partIndex}` : ''
  defaults.BVID = video.bvid ? `${video.bvid}${partSuffix}` : ''
  defaults.AID = video.aid ? `${video.aid}${partSuffix}` : ''
  defaults.SECTION = video.sectionId || ''
  defaults['SECTION-ROOT'] = video.sectionRootId || ''
  defaults['SECTION-NAME'] = video.sectionName || ''
  defaults['SECTION-ROOT-NAME'] = video.sectionRootName || ''
  defaults.UP = video.upUid || ''
  defaults.TAG = video.tags[0] || ''
  defaults['TAG-MUSIC'] = video.musicTags[0]?.musicId || ''
  defaults.PARTITION = video.partitionId || ''
  defaults.TITLE = video.title || ''
  defaults.PART = video.partTitle || ''
  defaults.TIME = video.duration > 0 ? String(video.duration) : ''
  defaults['RULE-SET'] = ruleSetNames[0] ?? ''
  return defaults
}

export const createVisualCondition = (
  matcherKind: 'basic' | 'logic' = 'basic',
  matcherType: RBVPBasicMatcherType = 'UP',
  matcherArgument = '',
  logicOperator: RBVPLogicMatcherType = 'AND',
  conditions: VisualConditionItem[] = [],
): VisualConditionItem => ({
  id: createConditionId(),
  matcherKind,
  matcherType,
  matcherArgument,
  logicOperator,
  conditions,
})

export const createVisualRule = (
  matcher: VisualConditionItem,
  actions = '',
  title = '',
): VisualRuleItem => ({
  id: createRuleId(),
  title,
  matcher,
  actions,
  collapsed: false,
  editingTitle: false,
})

export const createBasicRule = (defaultMatcherArguments: RBVPMatcherDefaultArguments) =>
  createVisualRule(createVisualCondition('basic', 'UP', defaultMatcherArguments.UP))

export const createLogicRule = (defaultMatcherArguments: RBVPMatcherDefaultArguments) =>
  createVisualRule(
    createVisualCondition('logic', 'UP', '', 'AND', [
      createVisualCondition('basic', 'TAG', defaultMatcherArguments.TAG),
    ]),
  )

export const matcherNodeToVisualCondition = (matcher: RBVPMatcherNode): VisualConditionItem => {
  if (matcher.kind === 'logic') {
    return createVisualCondition(
      'logic',
      'UP',
      '',
      matcher.operator,
      matcher.conditions.map(condition => matcherNodeToVisualCondition(condition)),
    )
  }
  return createVisualCondition('basic', matcher.type, matcher.argument ?? '')
}

const stringifyAction = (action: RBVPActionNode) => `${action.namespace}:${action.value}`
export const parsedRuleToVisualRule = (rule: RBVPParsedRule) =>
  createVisualRule(
    matcherNodeToVisualCondition(rule.matcher),
    rule.actions.length > 1
      ? `{${rule.actions.map(action => stringifyAction(action)).join(', ')}}`
      : stringifyAction(rule.actions[0]),
  )

export const parseVisualRulesFromText = (text: string) => {
  const lines = text.split('\n')
  const rules: VisualRuleItem[] = []
  let pendingTitle: string | null = null
  for (let index = 0; index < lines.length; index++) {
    const trimmed = lines[index].trim()
    if (trimmed === '') {
      pendingTitle = null
      continue
    }
    if (trimmed.startsWith('#')) {
      pendingTitle = trimmed.slice(1).trim()
      continue
    }
    const parsedRule = parseRbvpRules(trimmed)[0]
    const visualRule = parsedRuleToVisualRule(parsedRule)
    visualRule.title = pendingTitle ?? ''
    rules.push(visualRule)
    pendingTitle = null
  }
  return rules
}

export const stringifyVisualCondition = (condition: VisualConditionItem): string => {
  if (condition.matcherKind === 'logic') {
    return `${condition.logicOperator}, ${condition.conditions
      .map(child => `(${stringifyVisualCondition(child)})`)
      .join(', ')}`
  }
  if (condition.matcherType === 'FINAL') {
    return 'FINAL'
  }
  return `${condition.matcherType}, ${condition.matcherArgument.trim()}`
}

export const stringifyVisualRule = (rule: VisualRuleItem) =>
  `${rule.title.trim() ? `# ${rule.title.trim()}\n` : ''}${stringifyVisualCondition(
    rule.matcher,
  )}, ${rule.actions.trim()}`

export const stringifyVisualRules = (rules: VisualRuleItem[]) =>
  rules
    .map(rule => stringifyVisualRule(rule))
    .filter(line => line !== ',' && line !== '# ')
    .join('\n')

export const createInitialRuleEditorState = (rulesText: string) => {
  try {
    return {
      ruleEditorMode: 'visual' as RuleEditorMode,
      visualRules: parseVisualRulesFromText(rulesText),
    }
  } catch {
    return {
      ruleEditorMode: 'text' as RuleEditorMode,
      visualRules: [] as VisualRuleItem[],
    }
  }
}

export const needsMatcherArgument = (rule: VisualConditionItem) =>
  rule.matcherKind === 'basic' && rule.matcherType !== 'FINAL'

export const getMatcherArgumentPlaceholder = (type: RBVPBasicMatcherType) => {
  switch (type) {
    case 'BVID':
      return '例如: BV1xx411c7mD 或 BV1xx411c7mD#2'
    case 'AID':
      return '例如: 170001 或 170001#2'
    case 'SECTION':
      return '例如: 123456'
    case 'SECTION-ROOT':
      return '例如: 654321'
    case 'SECTION-NAME':
      return '例如: 第 1 话'
    case 'SECTION-ROOT-NAME':
      return '例如: 某某合集'
    case 'UP':
      return '例如: 123456'
    case 'TAG':
      return '例如: 教程'
    case 'TAG-MUSIC':
      return '例如: MA12345'
    case 'PARTITION':
      return '例如: 17'
    case 'TITLE':
      return '例如: 速通'
    case 'PART':
      return '例如: P1'
    case 'TIME':
      return '例如: >600'
    case 'RULE-SET':
      return '例如: study-list'
    default:
      return '请输入匹配参数'
  }
}

export const getMatcherTypeHint = (type: RBVPBasicMatcherType) => {
  switch (type) {
    case 'BVID':
      return '按视频 BVID 精确匹配。参数末尾可追加 #分P，例如 BV1xx411c7mD#2 仅匹配第 2 个分 P。'
    case 'AID':
      return '按视频 AID 精确匹配。参数末尾可追加 #分P，例如 170001#2 仅匹配第 2 个分 P。'
    case 'SECTION':
      return '按当前合集分区的 section id 精确匹配。适合对合集中的某个 section 单独配置策略。'
    case 'SECTION-ROOT':
      return '按当前合集根分组的 section root id 精确匹配。适合对整个合集统一配置策略。'
    case 'SECTION-NAME':
      return '按当前合集条目标题匹配，对应 ugc_season.sections[].episodes[].title。适合针对合集中的某一话或某一集配置策略。'
    case 'SECTION-ROOT-NAME':
      return '按当前合集标题匹配，对应 ugc_season.title。适合针对整个合集统一配置策略。'
    case 'UP':
      return '按 UP 主匹配，参数通常填写 UP 的 UID。命中后会对该 UP 的视频应用这条规则。'
    case 'TAG':
      return '按视频标签文本匹配，参数填写标签关键字。只要当前视频标签中包含该项就会命中。'
    case 'TAG-MUSIC':
      return '按视频标签中的 music_id 匹配，参数填写 music_id 关键字（支持正则）。只要当前视频的标签中包含匹配的 music_id 就会命中。'
    case 'PARTITION':
      return '按视频分区 ID 精确匹配，参数填写 tid。适合按内容分区统一配置策略。'
    case 'TITLE':
      return '按视频标题匹配，参数填写标题中的关键字。适合处理系列名、课程名等场景。'
    case 'PART':
      return '按分 P 标题匹配，参数填写分 P 名称或关键字。适合同一视频下不同章节使用不同策略。'
    case 'TIME':
      return '按时长匹配，参数填写时间条件。这个类型更偏高级用法，建议先在文本视图确认语法。'
    case 'RULE-SET':
      return '引用本地规则集，参数填写规则集名称。命中逻辑会交给对应规则集中的条目来判断。'
    case 'FINAL':
      return '兜底规则，不需要匹配参数。当上面的规则都没有命中时，会执行这条规则的动作。'
    default:
      return '请选择合适的规则类型，并填写对应参数。'
  }
}

export const getLogicMatcherHint = (operator: RBVPLogicMatcherType) => {
  switch (operator) {
    case 'AND':
      return '逻辑与：只有所有条件都命中时，这条规则才会生效。每行填写一个子条件。'
    case 'OR':
      return '逻辑或：只要任意一个条件命中，这条规则就会生效。每行填写一个子条件。'
    case 'NOT':
      return '逻辑非：当条件不命中时才会生效。NOT 只接受一个子条件，多余内容会在保存前提示。'
    default:
      return '请填写逻辑组合条件。'
  }
}

export const getMatcherHint = (rule: VisualConditionItem) =>
  rule.matcherKind === 'logic'
    ? getLogicMatcherHint(rule.logicOperator)
    : getMatcherTypeHint(rule.matcherType)

export const formatVisualRule = (rule: VisualRuleItem) => {
  const matcher = stringifyVisualCondition(rule.matcher)
  const actions = rule.actions.trim() || '未填写执行动作'
  return `${matcher}, ${actions}`
}

export const getRuleDisplayTitle = (rule: VisualRuleItem, index: number) =>
  rule.title.trim() || `第 ${index + 1} 条`

export const getDebugStepMarker = (step: RBVPDebugTraceStep) => {
  if (step.type === 'rule') {
    return '行'
  }
  if (step.matched === true) {
    return '✓'
  }
  if (step.matched === false) {
    return '×'
  }
  return '·'
}

export const isValidRuleSetMatcherType = (
  type: string,
  matcherTypes: RBVPRuleSetMatcherType[],
): type is RBVPRuleSetMatcherType => matcherTypes.includes(type as RBVPRuleSetMatcherType)

export const hasUnsavedSelectedRuleSetChanges = (params: {
  selectedRuleSet: { entries: string[] } | null
  selectedRuleSetName: string
  selectedRuleSetNameInput: string
  selectedRuleSetEntries: string
}) => {
  if (!params.selectedRuleSet) {
    return false
  }
  const trimmedName = params.selectedRuleSetNameInput.trim()
  const trimmedEntries = params.selectedRuleSetEntries
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line !== '')
  return (
    trimmedName !== params.selectedRuleSetName ||
    trimmedEntries.join('\n') !== params.selectedRuleSet.entries.join('\n')
  )
}

export const createRuleSetTransferPayload = (params: {
  scope: 'all' | 'current'
  selectedRuleSetName: string
  selectedRuleSet: unknown
  localRuleSets: RBVPLocalRuleSetMap
}) => {
  if (params.scope === 'current') {
    if (!params.selectedRuleSetName || !params.selectedRuleSet) {
      throw new Error('当前没有可导出的规则集')
    }
    return {
      version: 1 as const,
      scope: 'single' as const,
      ruleSets: {
        [params.selectedRuleSetName]: lodash.cloneDeep(params.selectedRuleSet),
      },
    }
  }
  return {
    version: 1 as const,
    scope: 'all' as const,
    ruleSets: lodash.cloneDeep(params.localRuleSets),
  }
}

export const parseImportedRuleSets = (
  text: string,
  matcherTypes: RBVPRuleSetMatcherType[],
): RBVPLocalRuleSetMap => {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('导入内容不是合法的 JSON')
  }
  const source =
    parsed &&
    typeof parsed === 'object' &&
    'ruleSets' in parsed &&
    (parsed as { ruleSets?: unknown }).ruleSets &&
    typeof (parsed as { ruleSets?: unknown }).ruleSets === 'object'
      ? (parsed as { ruleSets: unknown }).ruleSets
      : parsed
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new Error('导入内容格式不正确，未找到规则集对象')
  }
  const result: RBVPLocalRuleSetMap = {}
  for (const [name, value] of Object.entries(source as Record<string, unknown>)) {
    const trimmedName = name.trim()
    if (!trimmedName) {
      throw new Error('导入内容包含空名称规则集')
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`规则集 "${trimmedName}" 格式不正确`)
    }
    const { matcherType } = value as { matcherType?: unknown }
    const { entries } = value as { entries?: unknown }
    if (typeof matcherType !== 'string' || !isValidRuleSetMatcherType(matcherType, matcherTypes)) {
      throw new Error(`规则集 "${trimmedName}" 的匹配类型无效`)
    }
    if (!Array.isArray(entries) || entries.some(entry => typeof entry !== 'string')) {
      throw new Error(`规则集 "${trimmedName}" 的条目列表无效`)
    }
    result[trimmedName] = {
      matcherType,
      entries: entries.map(entry => entry.trim()).filter(entry => entry !== ''),
    }
  }
  if (Object.keys(result).length === 0) {
    throw new Error('导入内容中没有可用的规则集')
  }
  return result
}
