/** 表示一个合集包 */
export interface Package {
  name: string
  displayName: string
  description?: string
  components?: string[]
  plugins?: string[]
}
/** 表示一个支持在线安装的功能 */
export interface DocSourceItem {
  type: 'component' | 'plugin'
  name: string
  displayName: string
  description?: string
  descriptionText?: string
  fullAbsolutePath: string
  fullRelativePath: string
  owner?: string
}
