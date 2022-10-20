import { UnknownOptions, UserComponentMetadata } from '@/components/types'
import { PluginMetadata } from '@/plugins/plugin'
import { UserStyle } from '@/plugins/style'

export type Property = string | number | symbol
export type ValueChangeListener<T = any> = (
  value: T,
  oldValue: T,
  prop: Property,
  propPath?: Property[],
) => void

/** 表示一个组件的设置 */
export interface ComponentSettings<O extends UnknownOptions = UnknownOptions> {
  /** 是否启用此组件 */
  enabled: boolean
  /** 组件选项 */
  options: O & Record<string, unknown>
}
/** 脚本总设置 */
export interface Settings {
  [name: string]: any
  /** 用户安装的样式 */
  userStyles: Record<string, Required<UserStyle>>
  /** 用户安装的插件 */
  userPlugins: Record<
    string,
    Omit<PluginMetadata, 'setup'> & {
      code: string
    }
  >
  /** 用户安装的组件 */
  userComponents: Record<
    string,
    {
      /** 原始代码, 开启时将执行并获取完整的组件信息 */
      code: string
      /** 部分可序列化的组件信息 */
      metadata: UserComponentMetadata
      /** 组件设置 */
      settings: ComponentSettings
    }
  >
  /** 组件更新的代码 */
  update?: string
  /** 实例 ID */
  instance?: string
  /** 组件设置 */
  components: Record<string, ComponentSettings>
  /** 插件设置 */
  plugins: Record<string, boolean>
}
