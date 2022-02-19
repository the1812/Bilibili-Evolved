import {
  ComponentMetadata, componentsMap, OptionsMetadata, UnknownOptions,
} from '@/components/component'
import { PluginMetadata } from '@/plugins/plugin'
// import serialize from 'serialize-javascript'
import { settings, ComponentSettings } from '../settings'
import { matchUrlPattern } from '../utils'

/**
 * 生成组件选项设置
 * @param options 组件选项定义
 */
export function componentOptionsToSettings<O extends UnknownOptions>(
  options: OptionsMetadata<O>,
): O {
  return lodash.mapValues(options, m => m.defaultValue) as O
}
/**
 * 生成组件设置
 * @param component 组件定义
 */
export const componentToSettings = (component: ComponentMetadata): ComponentSettings => (
  {
    enabled: component.enabledByDefault ?? true,
    options: component.options ? componentOptionsToSettings(component.options) : {},
  }
)
/**
 * 判断是否为自定义组件
 * @param component 组件定义
 */
export const isUserComponent = (component: ComponentMetadata | string) => {
  const name = typeof component === 'string' ? component : component.name
  return Boolean(settings.userComponents[name])
}
/**
 * 判断是否为自定义插件
 * @param plugin 插件定义
 */
export const isUserPlugin = (plugin: PluginMetadata | string) => {
  const name = typeof plugin === 'string' ? plugin : plugin.name
  return Boolean(settings.userPlugins[name])
}
const emptySettings: ComponentSettings = {
  enabled: false,
  options: new Proxy({}, {
    get() {
      return false
    },
  }),
}
/**
 * 获取组件的设置
 * @param component 组件或组件名称
 */
export const getComponentSettings = (component: ComponentMetadata | string): ComponentSettings => {
  if (typeof component === 'string') {
    const componentMetadata = componentsMap[component]
    if (componentMetadata === undefined) {
      if (settings.components.settingsPanel.options.devMode) {
        console.warn('No settings found for component:', component)
      }
      return emptySettings
    }
    component = componentMetadata
  }
  if (isUserComponent(component)) {
    const { name } = component
    return settings.userComponents[name]?.settings ?? emptySettings
  }
  return settings.components[component.name]
}
/**
 * 获取通用设置 (`settingsPanel`组件的`options`)
 */
export const getGeneralSettings = () => getComponentSettings('settingsPanel').options
/**
 * 判断此组件是否启用, 启用的条件为:
 * - 若定义了排除列表, 当前URL必须不匹配其排除列表中任意一项(`Component.urlExclude`)
 * - 若定义了包含列表, 当前URL必须匹配其包含列表中的任意一项(`Component.urlInclude`)
 * - 组件自身必须已启用(`ComponentSettings.enabled`)
 * - 不可配置的组件(`Component.configurable === false`), 上一条判断将使用组件的默认值(`Component.enabledByDefault`)
 * @param component 组件或组件名称
 */
export const isComponentEnabled = (component: ComponentMetadata | string) => {
  if (typeof component === 'string') {
    component = componentsMap[component]
  }
  // 不存在 / 未安装的组件
  if (!component) {
    return false
  }
  // 若指定了排除URL, 任意URL匹配就不加载
  if (component.urlExclude && component.urlExclude.some(matchUrlPattern)) {
    return false
  }
  // 若指定了包含URL, 所有URL都不匹配时不加载
  if (component.urlInclude && component.urlInclude.every(lodash.negate(matchUrlPattern))) {
    return false
  }
  // 不可更改的组件永远返回默认值
  if (component.configurable === false) {
    return component.enabledByDefault ?? true
  }
  return getComponentSettings(component).enabled
}
