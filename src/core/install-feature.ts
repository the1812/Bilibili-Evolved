import { ComponentMetadata } from '@/components/types'
import { installComponent } from '@/components/user-component'
import { getHook } from '@/plugins/hook'
import { installPlugin, PluginMetadata } from '@/plugins/plugin'
import { installStyle, UserStyle } from '@/plugins/style'

type FeatureType = ComponentMetadata | PluginMetadata | UserStyle
const isComponent = (item: FeatureType): item is ComponentMetadata => 'entry' in item
const isPlugin = (item: FeatureType): item is PluginMetadata => 'setup' in item
const isStyle = (item: FeatureType): item is UserStyle => 'style' in item
export const installFeature = async (url: string): Promise<{
  metadata: FeatureType
  message: string
}> => {
  const { monkey } = await import('../core/ajax')
  const code = await monkey({ url })
  const { parseExternalInput } = await import('../core/external-input')
  const item = await parseExternalInput<FeatureType>(code)
  const { type, installer } = (() => {
    if (isComponent(item)) {
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
  })()

  const { before, after } = getHook(`user${lodash.startCase(type)}s.add`, code, url)
  await before()
  const installerResult = await installer()
  await after(installerResult.metadata)
  return installerResult
}
