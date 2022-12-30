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
/** 表示用户内容管理面板的单个内容, 必须具有 name 和 displayName */
export interface ManageItem<
  ItemType extends {
    displayName: string
    name: string
  },
> {
  /** 唯一名称 */
  key: string
  /** 内容对象实例 */
  item: ItemType
  /** 是否是用户安装 (非框架内置) */
  isUserItem: boolean
  /** 用户请求卸载时的回调 */
  onItemRemove: (item: ItemType) => Promise<any>
  /** 获取存储的设置 (如果有), 可以用于展示一个开启 / 关闭的开关 */
  getSettings?: (item: ItemType) => { enabled: boolean }
}
