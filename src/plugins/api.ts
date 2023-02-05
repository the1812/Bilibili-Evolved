import * as data from './data'
import * as hook from './hook'
import * as plugin from './plugin'
import * as style from './style'

export const pluginApis = {
  style,
  plugin,
  data,
  hook,
}
export type PluginApis = typeof pluginApis
