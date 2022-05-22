import { VueConstructor } from 'vue'
import { TestPattern, Executable } from '@/core/common-types'

/**
 * 小组件(v1中称为附加功能), 可在组件中定义, 也可以由插件注入
 */
export interface Widget {
  /** 名称 */
  name: string
  /** 要渲染的Vue组件 */
  component: Executable<VueConstructor>
  /** 传递给`component`的选项 */
  options?: any
  /** 设置匹配的URL, 与组件的`urlInclude`类似 */
  urlInclude?: TestPattern
  /** 设置不匹配的URL, 与组件的`urlExclude`类似 */
  urlExclude?: TestPattern
  /** 从代码层面上判断是否应该启用此小组件 */
  condition?: Executable<boolean>
}
