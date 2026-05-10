import { defineComponentMetadata } from '@/components/define'
import { addComponentListener } from '@/core/settings'
import { Toast } from '@/core/toast'
import { videoChange } from '@/core/observer'
import { playerUrls } from '@/core/utils/urls'
import { createRbvpEngineContext } from './context'
import { executeRbvpRules } from './engine'
import { parseRbvpRules, RBVPParseError } from './parser'
import { rbvpNamespaces } from './registry'
import type { RBVPDebugSnapshot, RBVPLocalRuleSetMap, RBVPMatchResult, RBVPRuntime } from './types'
import { useScopedConsole } from '@/core/utils/log'

const logger = useScopedConsole('rbvp')

export type Options = {
  rulesText: string
  localRuleSets: RBVPLocalRuleSetMap
  showMatchTip: boolean
  lastMatchInfo: string
  lastDebugInfo: string
}

const formatMatchInfo = (message: string) => `最近命中: ${message}`
const createDebugSnapshotContext = (
  context: Awaited<ReturnType<typeof createRbvpEngineContext>>,
) => ({
  video: context.video,
  localRuleSets: lodash.cloneDeep(context.localRuleSets),
})

const formatMatchedResult = (result: RBVPMatchResult) => {
  const message =
    result.message ||
    `${result.namespace ?? 'unknown'} => ${result.displayValue ?? result.rawRule ?? '已应用'}`
  return result.line ? `第 ${result.line} 行命中: ${message}` : `命中: ${message}`
}

const formatMatchedResults = (results: RBVPMatchResult[]) => {
  if (results.length === 0) {
    return '无'
  }
  return results.map(result => formatMatchedResult(result)).join('；')
}

const entry = async ({ settings }: { settings: { enabled: boolean; options: Options } }) => {
  const runtimeGuards = new Set<string>()
  const runtime: RBVPRuntime = {
    hasGuard: (name: string) => runtimeGuards.has(name),
    enterGuard: (name: string) => {
      runtimeGuards.add(name)
    },
    leaveGuard: (name: string) => {
      runtimeGuards.delete(name)
    },
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    requestApplyRules: () => applyRules(),
  }
  const initializedNamespaces = new Set<string>()
  const setupNamespaces = async () => {
    await Promise.all(
      Object.entries(rbvpNamespaces).map(async ([namespace, provider]) => {
        if (initializedNamespaces.has(namespace)) {
          return
        }
        initializedNamespaces.add(namespace)
        await provider.setup?.(runtime)
      }),
    )
  }
  const applyRules = async () => {
    if (!settings.enabled) {
      return
    }
    try {
      await setupNamespaces()
      const rules = parseRbvpRules(settings.options.rulesText)
      const context = await createRbvpEngineContext(settings.options.localRuleSets, runtime)
      const namespaces = Object.keys(rbvpNamespaces).filter(namespace => {
        const provider = rbvpNamespaces[namespace]
        if (!provider.getTakeoverState) {
          return true
        }
        return provider.getTakeoverState()
      })
      if (namespaces.length === 0) {
        settings.options.lastMatchInfo = '最近命中: 无（未注册命名空间）'
        settings.options.lastDebugInfo = JSON.stringify({
          status: 'ok',
          message: '无（未注册命名空间）',
          namespaces: [],
          context: createDebugSnapshotContext(context),
        } as RBVPDebugSnapshot)
        return
      }
      logger.info('context', context)
      await Promise.all(namespaces.map(namespace => rbvpNamespaces[namespace].prepare?.(context)))
      const results = await Promise.all(
        namespaces.map(namespace => executeRbvpRules(rules, namespace, context)),
      )
      const errors = results.filter(result => result.error)
      if (errors.length > 0) {
        const errorMessage = errors.map(result => result.message ?? result.error).join('；')
        settings.options.lastMatchInfo = formatMatchInfo(`失败 - ${errorMessage}`)
        settings.options.lastDebugInfo = JSON.stringify({
          status: 'error',
          message: errorMessage,
          namespaces: results.map(result => result.debug),
          context: createDebugSnapshotContext(context),
        } as RBVPDebugSnapshot)
        Toast.error(errorMessage, 'RBVP', 5000)
        return
      }
      const matchedResults = results.filter(result => result.matched)
      const matchMessage = formatMatchedResults(matchedResults)
      settings.options.lastMatchInfo = formatMatchInfo(matchMessage)
      settings.options.lastDebugInfo = JSON.stringify({
        status: 'ok',
        message: matchMessage,
        namespaces: results.map(result => result.debug),
        context: createDebugSnapshotContext(context),
      } as RBVPDebugSnapshot)
      if (matchedResults.length > 0 && settings.options.showMatchTip) {
        Toast.info(matchMessage, 'RBVP', 3000)
      }
    } catch (error) {
      const message = error instanceof RBVPParseError ? error.message : String(error)
      settings.options.lastMatchInfo = formatMatchInfo(`解析失败 - ${message}`)
      settings.options.lastDebugInfo = JSON.stringify({
        status: 'error',
        message,
        namespaces: [],
      } as RBVPDebugSnapshot)
      Toast.error(message, 'RBVP', 5000)
    }
  }
  await videoChange(async () => {
    await applyRules()
  })
  addComponentListener('rbvp.rulesText', applyRules)
  addComponentListener('rbvp.localRuleSets', applyRules)
}

export const component = defineComponentMetadata<Options>({
  name: 'rbvp',
  displayName: 'RBVP 视频策略',
  author: {
    name: 'JLoeve (with Claude Code & Codex)',
    link: 'https://github.com/LonelySteve',
  },
  description: {
    'zh-CN': `
支持基于规则的视频策略匹配.

- 支持本地主规则文本与本地命名规则集.
- 支持 \`UP\`、\`TAG\`、\`PARTITION\`、\`TITLE\`、\`PART\`、\`TIME\`、\`RULE-SET\`、\`FINAL\` 等匹配条件.
- 支持 \`AND\` / \`OR\` / \`NOT\` 逻辑组合.
- 可与「记忆倍速」组件联动，由其提供兼容存储层.
`,
  },
  tags: [componentsTags.video, componentsTags.experimental],
  urlInclude: playerUrls,
  entry,
  extraOptions: () => import('./settings/ExtraOptions.vue').then(m => m.default),
  options: {
    rulesText: {
      displayName: '规则文本',
      defaultValue: '',
      hidden: true,
    },
    localRuleSets: {
      displayName: '本地规则集',
      defaultValue: {},
      hidden: true,
    },
    showMatchTip: {
      displayName: '显示命中提示',
      defaultValue: true,
    },
    lastMatchInfo: {
      displayName: '最近命中',
      defaultValue: '最近命中: 无',
      hidden: true,
    },
    lastDebugInfo: {
      displayName: '最近调试信息',
      defaultValue: '',
      hidden: true,
    },
  },
})
