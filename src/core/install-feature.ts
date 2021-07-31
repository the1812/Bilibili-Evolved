import { ComponentMetadata } from '@/components/types'
import { installComponent } from '@/components/user-component'
import { getHook } from '@/plugins/hook'
import { installPlugin, PluginMetadata } from '@/plugins/plugin'
import { installStyle, UserStyle } from '@/plugins/style'

type FeatureType = ComponentMetadata | PluginMetadata | UserStyle
const isComponent = (item: FeatureType): item is ComponentMetadata => 'entry' in item
const isPlugin = (item: FeatureType): item is PluginMetadata => 'setup' in item
const isStyle = (item: FeatureType): item is UserStyle => 'style' in item
export const installFeature = async (code: string) => {
  const { parseExternalInput } = await import('../core/external-input')
  const item = await parseExternalInput<FeatureType>(code)
  if (isComponent(item)) {
    getHook('')
    return {
      type: 'component',
      installer: () => installComponent(code),
    }
  }
  if (isPlugin(item)) {
    return {
      type: 'plugin',
      installer: () => installPlugin(code),
    }
  }
  if (isStyle(item)) {
    return {
      type: 'style',
      installer: () => installStyle(code),
    }
  }
  throw new Error('无效的功能代码')
}
