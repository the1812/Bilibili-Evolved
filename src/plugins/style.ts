import { settings } from '@/core/settings'
import { deleteValue } from '@/core/utils'

/** 自定义样式注入模式 */
export enum UserStyleMode {
  /** 组件加载完成后注入至<head>末尾 */
  Default = 'default',
  /** 随首屏样式注入 */
  Instant = 'instant',
  /** 组件加载完成后注入至<body>末尾 */
  Important = 'important',
}
/** 自定义样式定义 */
export interface UserStyle {
  /** 名称 */
  name: string
  /** 样式内容 */
  style: string
  /** 显示名称, 默认与`name`相同 */
  displayName?: string
  /** 注入模式, 默认为`CustomStyleMode.default` */
  mode?: UserStyleMode
}
export const styles: Required<UserStyle>[] = Object.values(settings.userStyles)
/**
 * 安装自定义样式
 * @param input 自定义样式数据
 */
export const installStyle = async (input: UserStyle | string) => {
  try {
    let userStyle: UserStyle
    const { loadFeatureCode } = await import('@/core/external-input')
    if (typeof input === 'string') {
      userStyle = loadFeatureCode(input) as UserStyle
    } else {
      userStyle = input
    }
    const { name, style, displayName, mode } = userStyle
    const { removeStyle, addImportantStyle, addStyle } = await import('@/core/style')
    const existingStyle = settings.userStyles[name]
    if (existingStyle) {
      Object.assign(existingStyle, userStyle)
      removeStyle(name)
    } else {
      const newStyle = {
        displayName: name,
        mode: UserStyleMode.Default,
        ...userStyle,
      }
      settings.userStyles[name] = newStyle
      styles.push(newStyle)
    }
    if (mode === UserStyleMode.Important) {
      addImportantStyle(style, name)
    } else {
      addStyle(style, name)
    }
    return {
      metadata: userStyle,
      message: `已安装样式'${displayName || name}'`,
    }
  } catch (e) {
    throw new Error('无效的样式代码', { cause: e })
  }
}
/**
 * 卸载自定义样式
 * @param nameOrDisplayName 样式的名称(`name`或`displayName`)
 */
export const uninstallStyle = async (nameOrDisplayName: string) => {
  const existingStyle = Object.entries(settings.userStyles).find(([name, { displayName }]) => {
    if (name === nameOrDisplayName || displayName === nameOrDisplayName) {
      return true
    }
    return false
  })
  if (!existingStyle) {
    throw new Error(`没有找到与名称'${nameOrDisplayName}'相关联的样式`)
  }
  const { removeStyle } = await import('@/core/style')
  const [name, { displayName }] = existingStyle
  removeStyle(name)
  delete settings.userStyles[name]
  deleteValue(styles, it => it.name === name)
  return {
    metadata: existingStyle,
    message: `已卸载样式'${displayName}'`,
  }
}
