/** 用户内容管理面板配置 */
export interface ManagePanelConfig<ItemType> {
  /** 唯一名称 */
  key: string
  /** 图标 */
  icon: string
  /** 标题 */
  title: string
  /** 内容列表 */
  list: ItemType[]
  /** 内容过滤器, 会传入用户输入的关键词, 以及是否隐藏框架内置 */
  listFilter: (item: ItemType, search: string, excludeBuiltIn: boolean) => boolean
  /** 添加内容时的回调, 包括其源代码和安装来源链接 (如果有) */
  onItemAdd: (code: string, url: string) => Promise<string>
  /** 描述说明 */
  description?: string
}
