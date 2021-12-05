import { PluginMetadata } from '@/plugins/plugin'
import { DocSource, DocSourceItem } from '.'
import { getId } from '../../webpack/id'
import { getThirdPartyDescription, thirdPartyPlugins } from './third-party'

export const getPluginsDoc: DocSource = async rootPath => {
  const pluginsContext = require.context('../plugins', true, /index\.ts$/)
  const pluginsPaths = pluginsContext
    .keys()
    .map(path => {
      const module = pluginsContext(path)
      if ('plugin' in module) {
        const plugin = module.plugin as PluginMetadata
        return {
          plugin,
          path,
        }
      }
      return undefined
    })
    .filter(it => it !== undefined)
    .map(it => {
      const root = `${rootPath}plugins/`
      const fullRelativePath = `${root}${getId(root, it.path.replace(/^\.?\//, ''))}.js`
      const fullAbsolutePath = fullRelativePath.replace(/^(\.\.?\/)*/, '')
      const {
        name,
        displayName,
      } = it.plugin
      return {
        type: 'plugin',
        name,
        displayName,
        fullRelativePath,
        fullAbsolutePath,
      } as DocSourceItem
    })
    .concat(thirdPartyPlugins.map(getThirdPartyDescription))
  return {
    title: '插件',
    items: pluginsPaths,
  }
}
