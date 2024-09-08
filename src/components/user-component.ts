import { componentToSettings } from '@/core/settings'
import { isBuiltInComponent } from './built-in-components'
import { ComponentMetadata, componentsMap } from './component'
import * as bisector from './bisector/api'
import { BisectorOptions } from './bisector/options'

/**
 * 安装自定义组件
 * @param code 组件代码
 */
export const installComponent = async (code: string) => {
  const { components } = await import('./component')
  const { loadFeatureCode } = await import('@/core/external-input')
  let component: ComponentMetadata
  try {
    component = loadFeatureCode(code) as ComponentMetadata
  } catch (e) {
    throw new Error('无效的组件代码', { cause: e })
  }
  const { settings } = await import('@/core/settings')
  if (isBuiltInComponent(component.name)) {
    throw new Error(`不能覆盖内置组件'${component.name}', 请更换名称`)
  }
  const userMetadata = {
    ...lodash.omit(
      component,
      'entry',
      'widget',
      'instantStyles',
      'reload',
      'unload',
      'plugin',
      'urlInclude',
      'urlExclude',
    ),
  }
  const existingComponent = settings.userComponents[component.name]
  if (existingComponent) {
    existingComponent.code = code
    existingComponent.metadata = userMetadata
    const defaultSettings = componentToSettings(component)
    lodash.defaultsDeep(
      existingComponent.settings.options,
      lodash.pickBy(defaultSettings.options, value => !Array.isArray(value)),
    )
    return {
      metadata: component,
      message: `已更新组件'${component.displayName}', 刷新后生效`,
    }
  }
  settings.userComponents[component.name] = {
    code,
    metadata: userMetadata,
    settings: componentToSettings(component),
  }
  components.push(component)
  componentsMap[component.name] = component
  return {
    metadata: component,
    message: `已安装组件'${component.displayName}', 刷新后生效`,
  }
}

/**
 * 卸载自定义组件
 * @param nameOrDisplayName 组件的名称(`name`或`displayName`)
 */
export const uninstallComponent = async (nameOrDisplayName: string) => {
  const { settings } = await import('@/core/settings')
  const { components } = await import('./component')
  const existingComponent = Object.entries(settings.userComponents).find(
    ([
      name,
      {
        metadata: { displayName },
      },
    ]) => {
      if (name === nameOrDisplayName || displayName === nameOrDisplayName) {
        return true
      }
      return false
    },
  )
  if (!existingComponent) {
    throw new Error(`没有找到与名称'${nameOrDisplayName}'相关联的组件`)
  }
  const [name, { metadata, settings: componentSettings }] = existingComponent
  // 如果已加载
  const index = components.findIndex(it => it.name === name)
  if (index !== -1) {
    // 移除可能的 instantStyles
    const { instantStyles } = components[index]
    if (instantStyles) {
      const { removeInstantStyle } = await import('@/core/style')
      instantStyles.forEach(s => removeInstantStyle(s))
    }
    // 移除可能的 widgets
    componentSettings.enabled = false
    components.splice(index, 1)
    delete componentsMap[name]
  }
  delete settings.userComponents[name]
  return {
    metadata,
    message: `已卸载组件'${metadata.displayName}, 刷新后生效'`,
  }
}

/**
 * 切换自定义组件的开关状态
 * @param nameOrDisplayName 组件的名称(`name`或`displayName`)
 */
export const toggleComponent = async (nameOrDisplayName: string) => {
  const { settings } = await import('@/core/settings')
  const existingComponent = Object.entries(settings.userComponents).find(
    ([
      name,
      {
        metadata: { displayName },
      },
    ]) => {
      if (name === nameOrDisplayName || displayName === nameOrDisplayName) {
        return true
      }
      return false
    },
  )
  if (!existingComponent) {
    throw new Error(`没有找到与名称'${nameOrDisplayName}'相关联的组件`)
  }
  const [, userComponent] = existingComponent
  userComponent.settings.enabled = !userComponent.settings.enabled
  const { enabled } = userComponent.settings
  const { displayName } = userComponent.metadata
  return `已${enabled ? '开启' : '关闭'}组件'${displayName}', 可能需要刷新后才能生效`
}

/**
 * 二等分自定义组件的开关状态
 *
 * @param options 二等分选项
 * @returns
 */
export const bisectComponent = async (options?: BisectorOptions) => {
  if (options) {
    bisector.setOptions(options)
  }
  return bisector
}
