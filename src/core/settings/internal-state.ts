import { components } from '@/components/component'
import { plugins } from '@/plugins/plugin'

import { componentToSettings } from './helpers'
import type { Settings } from './types'

/** 默认设置 */
const internalSettings = {
  userStyles: {},
  userPlugins: {},
  userComponents: {},
  components: {},
  plugins: {},
} satisfies Settings as Settings
export const settingsInternalState = {
  // 默认设置
  internalSettings,
  settingsLoaded: false,
}
export const initInternalSettings = () => {
  // 载入插件设置
  plugins.forEach(plugin => {
    settingsInternalState.internalSettings.plugins[plugin.name] = true
  })
  // 载入组件设置
  components.forEach(component => {
    settingsInternalState.internalSettings.components[component.name] =
      componentToSettings(component)
  })
}
/** 默认设置 */
export const defaultSettings = lodash.cloneDeep(internalSettings)
