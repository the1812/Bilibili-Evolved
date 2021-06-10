import { componentToSettings } from '@/core/settings'
import { getBuiltInComponents } from './built-in-components'
import {
  ComponentMetadata, componentsMap,
} from './component'

/**
 * 安装自定义组件
 * @param code 组件代码
 */
export const installComponent = async (code: string) => {
  const { parseExternalInput } = await import('../core/external-input')
  const { components } = await import('./component')
  const component = await parseExternalInput<ComponentMetadata>(code)
  if (component === null) {
    throw new Error('无效的组件代码')
  }
  console.log(component)
  const { settings } = await import('@/core/settings')
  const isBuiltInComponent = getBuiltInComponents().some(it => it.name === component.name)
  if (isBuiltInComponent) {
    throw new Error(`不能覆盖内置组件'${component.name}', 请更换名称`)
  }
  const existingComponent = settings.userComponents[component.name]
  if (existingComponent) {
    existingComponent.code = code
    // Object.assign(existingComponent.metadata, withFunction(component))
    return {
      metadata: component,
      message: `已更新组件'${component.displayName}', 刷新后生效`,
    }
  }
  settings.userComponents[component.name] = {
    code,
    metadata: {
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
    },
    settings: componentToSettings(component),
  }
  // 同步到 components 数组
  components.push(component)
  componentsMap[component.name] = component
  if (component.plugin) {
    const { loadPlugin, extractPluginFromComponent } = await import('../plugins/plugin')
    const plugin = extractPluginFromComponent(component)
    loadPlugin(plugin)
  }
  if (component.instantStyles) {
    const { loadInstantStyle } = await import('@/core/style')
    await loadInstantStyle(component)
  }
  const { loadComponent } = await import('./component')
  loadComponent(component)
  return {
    metadata: component,
    message: `已安装组件'${component.displayName}'.`,
  }
}

/**
 * 卸载自定义组件
 * @param nameOrDisplayName 组件的名称(`name`或`displayName`)
 */
export const uninstallComponent = async (nameOrDisplayName: string) => {
  const { settings } = await import('@/core/settings')
  const { components } = await import('./component')
  const existingComponent = Object.entries(settings.userComponents)
    .find(([name, { metadata: { displayName } }]) => {
      if (name === nameOrDisplayName || displayName === nameOrDisplayName) {
        return true
      }
      return false
    })
  if (!existingComponent) {
    throw new Error(`没有找到与名称'${nameOrDisplayName}'相关联的组件`)
  }
  const [name, { metadata, settings: componentSettings }] = existingComponent
  // 如果已加载
  const index = components.findIndex(it => it.name === name)
  if (index !== -1) {
    const { instantStyles } = components[index]
    // 移除可能的 instantStyles
    if (instantStyles) {
      const { getDefaultStyleID } = await import('@/core/style')
      instantStyles.forEach(s => {
        document.getElementById(getDefaultStyleID(s.name))?.remove()
      })
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
  const existingComponent = Object.entries(settings.userComponents)
    .find(([name, { metadata: { displayName } }]) => {
      if (name === nameOrDisplayName || displayName === nameOrDisplayName) {
        return true
      }
      return false
    })
  if (!existingComponent) {
    throw new Error(`没有找到与名称'${nameOrDisplayName}'相关联的组件`)
  }
  const [, userComponent] = existingComponent
  userComponent.settings.enabled = !userComponent.settings.enabled
  const { enabled } = userComponent.settings
  const { displayName } = userComponent.metadata
  return `已${enabled ? '开启' : '关闭'}组件'${displayName}', 可能需要刷新后才能生效`
}
