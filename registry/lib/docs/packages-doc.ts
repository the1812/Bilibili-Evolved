import { cdnRoots } from '@/core/cdn-types'
import { DocSourceItem, Package } from '.'

export const generatePackageDocs = async (allItems: DocSourceItem[]) => {
  const packagesContext = require.context('./packages', true, /\.ts$/)
  const packagesPaths = packagesContext
    .keys()
    .map(path => {
      const module = packagesContext(path)
      if ('pack' in module) {
        const pack = module.pack as Package
        return {
          pack,
          path,
        }
      }
      return undefined
    })
    .filter(it => it !== undefined)
    .map(it => {
      const { pack, path } = it
      const { components = [], plugins = [] } = pack
      const getDocSource = (type: string, name: string) => {
        const docSource = allItems.find(item => item.type === type && item.name === name)
        return docSource
      }
      const docSourceItems = components.map(item => getDocSource('component', item))
        .concat(plugins.map(item => getDocSource('plugin', item)))
      return {
        ...pack,
        items: docSourceItems,
        path,
      }
    })
  const packagesTexts = packagesPaths.map(it => {
    const itemText = `
### [${it.displayName}]
\`${it.name}\`

**GitHub Stable:**
\`\`\`
${it.items.map(item => cdnRoots.GitHub('v2') + item.fullAbsolutePath).join('\n')}
\`\`\`

${it.description || ''}
        `.trim()
    return itemText
  })
  const markdown = `
# 合集包
合集包提供了批量的功能安装链接, 方便一次性安装大量功能.

${packagesTexts.join('\n')}

`.trim()
  return {
    markdown,
    json: JSON.stringify(packagesPaths, undefined, 2),
  }
}
