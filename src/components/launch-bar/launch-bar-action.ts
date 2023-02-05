import { Executable, VueModule } from '@/core/common-types'

/** 表示 LaunchBar 里的一个动作 */
export interface LaunchBarAction {
  /** 内部名称 */
  name: string
  /** 显示名称 */
  displayName?: string
  /** 图标 */
  icon?: string
  /** 描述 */
  description?: string
  /** 提供给搜索栏过滤的关键词 */
  indexer?: string
  /** 自定义渲染的内容, 会覆盖其他一些字段 */
  content?: Executable<VueModule>
  /** 用户选择此动作时要执行的代码 */
  action: Executable
  /** 设置删除动作, 用户可以在此动作右侧选择删除 */
  deleteAction?: Executable
  /** 显式选中模式: 开启后可以禁止在列表第一项时直接由 Enter 触发 */
  explicitSelect?: boolean
  /** 手动指定在搜索结果中的顺序, 数字越小越排前面 */
  order?: number
}
/** LaunchBar 动作提供者的插件key, 可注入其他提供者 */
export const LaunchBarActionProviders = 'launchBar.actions'
/** 表示 LaunchBar 动作提供者, LaunchBar 在搜索时会遍历所有提供者 */
export interface LaunchBarActionProvider {
  /** 名称 */
  name: string
  /** 为 LaunchBar 提供搜索结果, 参数为用户输入的关键词 */
  getActions: (input: string) => Promise<LaunchBarAction[]>
  // /** 获取用户按下 Enter 时的动作, 可以覆盖默认的搜索行为, 返回`null`表示不覆盖 */
  // getEnterAction?: (input: string) => ((input: string) => void) | null
}
