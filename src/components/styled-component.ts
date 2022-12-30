import { none } from '@/core/utils'
import { ComponentEntry, ComponentMetadata, UnknownOptions } from './component'

/**
 * 创建一个自动添加指定样式的组件入口函数
 * @param styleImport 动态导入样式的函数
 * @param entry 组件入口函数
 */
export const styledComponentEntry =
  <O extends UnknownOptions>(
    styleImport: () => Promise<{ default: string }>,
    entry: ComponentEntry<O>,
  ): ComponentEntry<O> =>
  async context => {
    const { default: style } = await styleImport()
    const { addStyle } = await import('@/core/style')
    addStyle(style, context.metadata.name)
    return entry(context)
  }

/**
 * 创建仅切换样式的组件`entry`, `reload`和`unload`, 展开至组件定义中即可, 也可以提供可选的组件入口函数
 * @param styleImport 动态导入样式的函数
 * @param entry 组件入口函数
 */
export const toggleStyle = <O extends UnknownOptions>(
  name: string,
  styleImport: () => Promise<{ default: string }>,
  entry: ComponentEntry<O> = none,
): Pick<ComponentMetadata<O>, 'name' | 'entry' | 'reload' | 'unload'> => {
  let styleElement: HTMLStyleElement = null
  const styleEntry = async () => {
    if (styleElement) {
      return
    }
    const { default: style } = await styleImport()
    const { addStyle } = await import('@/core/style')
    styleElement = addStyle(style, name)
  }
  return {
    name,
    entry: context => styleEntry().then(() => entry(context)),
    reload: styleEntry,
    unload: () => {
      styleElement?.remove()
      styleElement = null
    },
  }
}
