import { reactive } from 'vue'
import { components } from '@/components/component'
import { plugins } from '@/plugins/plugin'

import { componentToSettings } from './helpers'
import type { Settings } from './types'

/** 默认设置（Vue 响应式对象） */
const internalSettings = reactive({
  userStyles: {},
  userPlugins: {},
  userComponents: {},
  components: {},
  plugins: {},
}) as Settings
export const settingsInternalState = {
  // 默认设置（Vue 响应式对象）
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
