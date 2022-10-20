import { getDescriptionMarkdown } from '@/components/description'
import { PluginMetadata } from '@/plugins/plugin'
import { DocSource, DocSourceItem } from '.'
import { getId } from '../id'
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
    .map(async it => {
      const root = `${rootPath}plugins/`
      const fullRelativePath = `${root}${getId(root, it.path.replace(/^\.?\//, ''))}.js`
      const fullAbsolutePath = fullRelativePath.replace(/^(\.\.?\/)*/, '')
      const { name, displayName } = it.plugin
      const description = await getDescriptionMarkdown(it.plugin)
      return {
        type: 'plugin',
        name,
        displayName,
        description,
        fullRelativePath,
        fullAbsolutePath,
      } as DocSourceItem
    })
    .concat(thirdPartyPlugins.map(getThirdPartyDescription))
  return {
    title: '插件',
    items: await Promise.all(pluginsPaths),
  }
}
