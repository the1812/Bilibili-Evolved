import { VueModule, Executable } from '@/core/common-types'

/** 用于`TabControl`的标签定义 */
export interface TabMapping {
  /** 唯一名称 (用于`:key`绑定) */
  name: string
  /** 显示名称 */
  displayName: string
  /** 切换到此标签时要显示的组件 */
  component: Executable<VueModule>
  /** 传给组件的参数 */
  propsData?: Record<string, unknown>
  /** 选中状态时, 再次点击此标签触发的跳转URL */
  activeLink?: string
  /** 设置提示数字, 选中此标签后清零 */
  count?: number
}
/** 用于`TabControl`的标签定义数组 */
export type TabMappings = TabMapping[]
