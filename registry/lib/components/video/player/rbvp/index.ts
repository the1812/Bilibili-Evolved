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
      const program = parseRbvpRules(settings.options.rulesText)
      const context = await createRbvpEngineContext(settings.options.localRuleSets, runtime)
      const namespaces = Object.keys(rbvpNamespaces).filter(namespace => {
        const provider = rbvpNamespaces[namespace]
        if (!provider.isComponentEnabled()) {
          return false
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
        namespaces.map(namespace => executeRbvpRules(program, namespace, context)),
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

> 基于规则的视频策略引擎，根据当前视频的 UP 主、分区、标签、标题、时长等信息自动匹配预设规则并执行对应动作，可实现倍速自动切换、合集记忆行为控制等场景.

#### 🔧 **选项**

- \`显示命中提示\`：打开此选项后，每次规则匹配成功时会在播放器弹出提示，显示命中的规则行号和动作信息.

#### ⚙️ **RBVP 设置面板**

点击组件选项下方的「RBVP 设置」按钮可打开设置面板，包含三个页签：

- **规则**：管理主规则，支持可视化视图（逐条编辑、排序、上下移动）、文本视图（批量编辑、导入导出）、上下文视图（查看当前视频的匹配上下文）和调试视图（查看最近一次规则匹配的追踪路径）.
- **规则集**：管理可复用的本地规则集，支持按名称、匹配类型和条目进行编辑，也支持导入导出.
- **命名空间**：查看已注册的命名空间（如「记忆倍速」「记忆合集」），可在此直接切换各命名空间是否交由 RBVP 接管，并查看其主名称、别名与描述.

#### 📝 **规则语法**

每条规则占一行，格式为 \`匹配条件, 参数, 动作\`，以 \`#\` 开头的行为注释行.

**匹配器类型**：

- \`UP, UID\`：匹配 UP 主的 UID
- \`TAG, 关键词\`：匹配视频标签，支持模糊匹配、精确匹配（\`"关键词"\`）和正则（\`/pattern/\`）
- \`TAG-MUSIC, music_id\`：匹配音乐标签的 music_id
- \`PARTITION, 分区ID\`：匹配视频分区 ID
- \`TITLE, 关键词\`：匹配视频标题，支持与 TAG 相同的匹配模式
- \`PART, 关键词\`：匹配分 P 标题
- \`BVID, bvid\`  / \`AID, aid\`：匹配特定视频，支持 \`#页码\` 指定分 P
- \`SECTION, ID\` / \`SECTION-ROOT, ID\`：匹配合集的 TAB 或根 ID
- \`SECTION-NAME, 关键词\` / \`SECTION-ROOT-NAME, 关键词\`：匹配合集 TAB 或根名称
- \`TIME, 表达式\`：匹配视频时长，支持比较（\`>=3600\`、\`<600\`）和范围（\`300-1800\`），单位为秒
- \`RULE-SET, 规则集名称\`：引用本地规则集
- \`FINAL\`：兜底规则，始终匹配

**逻辑组合**：\`AND(条件1, 条件2)\`、\`OR(条件1, 条件2)\`、\`NOT(条件)\` 可嵌套使用.

**动作格式**：\`命名空间:动作值\`，如 \`rememberVideoSpeed:2\`、\`rememberVideoCollection:OFF\`。动作值含义由各命名空间定义，可前往「命名空间」页签查看.

#### 🔗 **联动组件**

RBVP 通过命名空间机制与兼容组件联动，首批支持「记忆倍速」和「记忆合集」。具体动作值说明请参见对应组件的描述.

#### 🌈 **温馨提示**

规则按从上到下的顺序匹配，命中第一条即停止，因此请将更具体的规则放在上方，通用规则（如 \`FINAL\`）放在最末尾.

上下文视图和调试视图仅在最近一次匹配后才有数据显示，刚安装时为空.
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
