import { components, UserComponentMetadata } from '@/components/component'
import { UserStyle } from '@/plugins/style'
import { PluginMetadata, plugins } from '@/plugins/plugin'
import { componentToSettings, isUserComponent } from './helpers'

type Property = string | number | symbol
/** 表示一个组件的设置 */
export interface ComponentSettings {
  /** 是否启用此组件 */
  enabled: boolean
  /** 组件选项 */
  options: { [key: string]: any }
}
/** 脚本总设置 */
export interface Settings {
  [name: string]: any
  /** 用户安装的样式 */
  userStyles: Record<string, Required<UserStyle>>
  /** 用户安装的插件 */
  userPlugins: Record<string, (Omit<PluginMetadata, 'setup'> & {
    code: string
  })>
  /** 用户安装的组件 */
  userComponents: Record<string, {
    /** 原始代码, 开启时将执行并获取完整的组件信息 */
    code: string
    /** 部分可序列化的组件信息 */
    metadata: UserComponentMetadata
    /** 组件设置 */
    settings: ComponentSettings
  }>
  /** 组件更新的代码 */
  update?: string
  /** 组件设置 */
  components: Record<string, ComponentSettings>
  /** 插件设置 */
  plugins: Record<string, boolean>
}
// 默认设置
let internalSettings: Settings = {
  userStyles: {},
  userPlugins: {},
  userComponents: {},
  components: {},
  plugins: {},
}
let settingsLoaded = false

type ValueChangeListener<T = any> = (
  value: T,
  oldValue: T,
  prop: Property,
  propPath?: Property[],
) => void
const registeredListeners = new Map<string, ValueChangeListener[]>()
const settingsChangedHandler = (
  value: any,
  oldValue: any,
  prop: Property,
  propPath: Property[] = [],
) => {
  if (settingsLoaded) {
    GM_setValue(prop.toString(), internalSettings[prop.toString()])
    const path = propPath.join('.')
    // 如果父级是普通对象或数组也会通知, 但没有旧值
    if (propPath.length > 1) {
      const parentPath = propPath.slice(0, propPath.length - 1).join('.')
      const parent = lodash.get(internalSettings, parentPath)
      const notifyParent = Array.isArray(parent) || lodash.isPlainObject(parent)
      if (notifyParent) {
        const handlers = registeredListeners.get(parentPath)
        handlers?.forEach(h => h(parent, null, prop, propPath))
      }
    }
    const handlers = registeredListeners.get(path)
    handlers?.forEach(h => h(value, oldValue, prop, propPath))
  }
}

// 建立 Proxy
export const createProxy = (targetObj: any, valueChangeListener: ValueChangeListener) => {
  const applyProxy = (obj: any, rootProp?: Property, propPath: Property[] = []) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && !(value instanceof RegExp)) {
        obj[key] = applyProxy(value, rootProp || key, [...propPath, key])
      }
    }
    const proxy = new Proxy(obj, {
      get(o, prop) {
        return o[prop]
      },
      set(o, prop, value) {
        if (!(prop in o) && typeof value === 'object' && !(value instanceof RegExp)) {
          value = applyProxy(value, rootProp || prop, [...propPath, prop])
        }
        const oldValue = o[prop]
        o[prop] = value
        valueChangeListener(value, oldValue, rootProp || prop, [...propPath, prop])
        return true
      },
      deleteProperty(o, prop) {
        const oldValue = o[prop]
        delete o[prop]
        valueChangeListener(undefined, oldValue, rootProp || prop, [...propPath, prop])
        return true
      },
    })
    return proxy
  }
  return applyProxy(targetObj)
}

// 载入插件设置
plugins.forEach(plugin => {
  internalSettings.plugins[plugin.name] = true
})
// 载入组件设置
components.forEach(component => {
  internalSettings.components[component.name] = componentToSettings(component)
})

// 读取保存的设置
const readSettings = (obj: any) => {
  for (const [key, value] of Object.entries(obj)) {
    let result: any
    const gmValue = GM_getValue(key, value)
    if (typeof gmValue === 'object') {
      result = lodash.defaultsDeep(gmValue, value)
    } else {
      result = gmValue
    }
    obj[key] = result
  }
  return obj
}
/** 默认设置 */
export const defaultSettings = lodash.cloneDeep(internalSettings)
internalSettings = createProxy(readSettings(internalSettings), settingsChangedHandler)
for (const [key, value] of Object.entries(internalSettings)) {
  GM_setValue(key, value)
}

/**
 * 添加对设置里某项的监听
 * @param path 设置项的属性路径
 * @param listener 监听函数
 * @param initCall 添加监听后, 是否已当前设置值立即触发一次监听函数
 */
export const addSettingsChangeListener = <T = any>(
  path: string,
  listener: ValueChangeListener<T>,
  initCall = false,
) => {
  const handlers = registeredListeners.get(path)
  if (handlers) {
    handlers.push(listener)
  } else {
    registeredListeners.set(path, [listener])
  }
  if (initCall) {
    const value = lodash.get(internalSettings, path)
    listener(value, value, '', [])
  }
}
/**
 * 移除对设置项的某个监听函数
 * @param path 设置项的属性路径
 * @param listener 监听函数
 */
export const removeSettingsChangeListener = (path: string, listener: ValueChangeListener) => {
  const handlers = registeredListeners.get(path)
  if (!handlers) {
    return
  }
  const index = handlers.indexOf(listener)
  if (index === -1) {
    return
  }
  handlers.splice(index, 1)
}
const componentPath = (path: string) => {
  const [name, optionName] = path.split('.')
  if (!isUserComponent(name)) {
    if (optionName === undefined) {
      return `components.${name}.enabled`
    }
    return `components.${name}.options.${optionName}`
  }
  // user components
  if (optionName === undefined) {
    return `userComponents.${name}.settings.enabled`
  }
  return `userComponents.${name}.settings.options.${optionName}`
}
/**
 * 添加对组件设置的监听
 * @param path 组件名称, 或后面跟上`.`代表组件选项; 例如`darkMode`或`defaultPlayerMode.autoLightOff`
 * @param listener 监听函数
 * @param initCall 添加监听后, 是否已当前设置值立即触发一次监听函数
 */
export const addComponentListener = <T = any>(
  path: string,
  listener: ValueChangeListener<T>,
  initCall = false,
) => {
  addSettingsChangeListener(componentPath(path), listener, initCall)
}
/**
 * 移除对组件设置的监听
 * @param path 组件设置路径
 * @param listener 监听函数
 */
export const removeComponentListener = (path: string, listener: ValueChangeListener) => {
  removeSettingsChangeListener(componentPath(path), listener)
}

settingsLoaded = true
/** 脚本当前的设置 */
export const settings: Settings = internalSettings
export * from './helpers'
