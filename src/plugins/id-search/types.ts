import type { LaunchBarAction } from '@/components/launch-bar/launch-bar-action'

export interface IdSearchProvider {
  /** 匹配的正则 */
  pattern: RegExp
  /** 匹配时运行此函数获取结果 */
  getActions: (match: RegExpMatchArray) => Promise<{
    /** 显示的选项名称 */
    name: string
    /** 选择此选项后打开的链接 */
    link: string
    /** 提供给搜索栏过滤的关键词 */
    indexer: string
    /** 显示的选项描述 */
    description?: string
    /** 额外提供一些自定义的 LaunchBarAction */
    extraActions?: LaunchBarAction[]
  }>
}
