export type RBVPBasicMatcherType =
  | 'BVID'
  | 'AID'
  | 'SECTION'
  | 'SECTION-ROOT'
  | 'SECTION-NAME'
  | 'SECTION-ROOT-NAME'
  | 'UP'
  | 'TAG'
  | 'TAG-MUSIC'
  | 'PARTITION'
  | 'TITLE'
  | 'PART'
  | 'TIME'
  | 'RULE-SET'
  | 'FINAL'

export type RBVPLogicMatcherType = 'AND' | 'OR' | 'NOT'

export type RBVPRuleSetMatcherType = Extract<
  RBVPBasicMatcherType,
  | 'BVID'
  | 'AID'
  | 'SECTION'
  | 'SECTION-ROOT'
  | 'SECTION-NAME'
  | 'SECTION-ROOT-NAME'
  | 'UP'
  | 'TAG'
  | 'TAG-MUSIC'
  | 'PARTITION'
  | 'TITLE'
  | 'PART'
>

export interface RBVPBasicMatcherNode {
  kind: 'basic'
  type: RBVPBasicMatcherType
  argument?: string
}

export interface RBVPLogicMatcherNode {
  kind: 'logic'
  operator: RBVPLogicMatcherType
  conditions: RBVPMatcherNode[]
}

export type RBVPMatcherNode = RBVPBasicMatcherNode | RBVPLogicMatcherNode

export interface RBVPActionNode {
  namespace: string
  value: string
}

export interface RBVPParsedRule {
  line: number
  raw: string
  matcher: RBVPMatcherNode
  actions: RBVPActionNode[]
}

export interface RBVPLocalRuleSet {
  matcherType: RBVPRuleSetMatcherType
  entries: string[]
}

export type RBVPLocalRuleSetMap = Record<string, RBVPLocalRuleSet>

export interface RBVPVideoContext {
  aid: string
  bvid: string
  cid: string
  sectionId: string
  sectionRootId: string
  sectionName: string
  sectionRootName: string
  partIndex: number
  upUid: string
  upName: string
  partitionId: string
  partitionName: string
  title: string
  partTitle: string
  duration: number
  tags: string[]
  musicTags: { name: string; musicId: string }[]
}

export interface RBVPRuntime {
  hasGuard: (name: string) => boolean
  enterGuard: (name: string) => void
  leaveGuard: (name: string) => void
  requestApplyRules: () => Promise<void> | void
}

export interface RBVPEngineContext {
  video: RBVPVideoContext
  localRuleSets: RBVPLocalRuleSetMap
  runtime: RBVPRuntime
}

export interface RBVPResolvedAction {
  namespace: string
  value: unknown
  displayValue: string
}

export interface RBVPDebugTraceStep {
  type: 'rule' | 'matcher' | 'action' | 'execute' | 'info'
  depth: number
  matched?: boolean
  line?: number
  message: string
}

export interface RBVPNamespaceDebugInfo {
  namespace: string
  displayName: string
  matched: boolean
  line?: number
  summary: string
  steps: RBVPDebugTraceStep[]
}

export interface RBVPDebugContextSnapshot {
  video: RBVPVideoContext
  localRuleSets: RBVPLocalRuleSetMap
}

export interface RBVPDebugSnapshot {
  status: 'ok' | 'error'
  message: string
  namespaces: RBVPNamespaceDebugInfo[]
  context?: RBVPDebugContextSnapshot
}

export interface RBVPNamespaceProvider {
  displayName: string
  primaryName?: string
  description?: string
  aliases?: string[]
  prepare?: (context: RBVPEngineContext) => Promise<void> | void
  isComponentEnabled: () => boolean
  getTakeoverState: () => boolean
  setTakeoverState: (value: boolean) => void
  setup?: (runtime: RBVPRuntime) => Promise<void> | void
  validateAction?: (rawValue: string) => Promise<void> | void
  resolveAction: (
    rawValue: string,
    context: RBVPEngineContext,
  ) => Promise<RBVPResolvedAction | null> | RBVPResolvedAction | null
  execute: (
    action: RBVPResolvedAction,
    context: RBVPEngineContext,
  ) => Promise<string | void> | string | void
}

export interface RBVPMatchResult {
  matched: boolean
  error?: string
  line?: number
  rawRule?: string
  namespace?: string
  displayValue?: string
  message?: string
  debug: RBVPNamespaceDebugInfo
}
