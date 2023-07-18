import { isUserComponent } from './helpers'
// import { getRandomId } from '../utils'
import { Settings, ValueChangeListener } from './types'
import { createProxy } from './proxy'
import { registeredListeners, settingsChangedHandler } from './listener'
import { initInternalSettings, settingsInternalState as state } from './internal-state'
import { readSettings } from './read'

initInternalSettings()
export { defaultSettings } from './internal-state'
state.internalSettings = createProxy(readSettings(state.internalSettings), settingsChangedHandler)
for (const [key, value] of Object.entries(state.internalSettings)) {
  GM_setValue(key, value)
}
// state.internalSettings.instance = getRandomId(32)

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
    const value = lodash.get(state.internalSettings, path)
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
  const [name, ...optionPath] = path.split('.')
  const optionName = optionPath.join('.')
  if (!isUserComponent(name)) {
    if (!optionName) {
      return `components.${name}.enabled`
    }
    return `components.${name}.options.${optionName}`
  }
  // user components
  if (!optionName) {
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

state.settingsLoaded = true
/** 脚本当前的设置 */
export const settings: Settings = state.internalSettings
export * from './helpers'
export * from './types'
