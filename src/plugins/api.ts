import * as style from './style'
import * as plugin from './plugin'
import * as data from './data'
import * as hook from './hook'

export const pluginApis = {
  style,
  plugin,
  data,
  hook,
}
export type PluginApis = typeof pluginApis
