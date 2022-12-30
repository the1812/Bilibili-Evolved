import { cdnRoots } from '@/core/cdn-types'
import { branches } from '@/core/meta'
import { DocSourceItem, Package } from '.'

const generateDescription = (pack: Package, containedItems: DocSourceItem[]) => {
  const finalDescription = `包含以下功能:\n${containedItems.map(it => it.displayName).join(', ')}`
  return pack.description ? `${pack.description}\n\n${finalDescription}` : finalDescription
}
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
          // path,
        }
      }
      return undefined
    })
    .filter(it => it !== undefined)
    .map(it => {
      const { pack } = it
      const { components = [], plugins = [] } = pack
      const getDocSource = (type: string, name: string) => {
        const docSource = allItems.find(item => item.type === type && item.name === name)
        return docSource
      }
      const docSourceItems = components
        .map(item => getDocSource('component', item))
        .concat(plugins.map(item => getDocSource('plugin', item)))
      return {
        ...pack,
        items: docSourceItems,
        description: generateDescription(pack, docSourceItems),
        // path,
      }
    })
  // const allPackExcludes = [
  //   'darkModeSchedule',
  //   'vLoading.reimu',
  // ]
  // packagesPaths.unshift({
  //   name: 'all',
  //   displayName: '我全都要',
  //   description: '安装所有功能 (互斥的和个人私货不算), 请注意会耗费大量性能.',
  //   components: allItems
  //     .filter(it => it.type === 'component' && !allPackExcludes.includes(it.name))
  //     .map(it => it.name),
  //   plugins: allItems
  //     .filter(it => it.type === 'plugin' && !allPackExcludes.includes(it.name))
  //     .map(it => it.name),
  //   items: allItems,
  // })
  const packagesTexts = packagesPaths.map(it => {
    const itemText = `
### ${it.displayName}
${it.description || ''}

<details>
<summary><strong>jsDelivr Stable</strong></summary>

\`\`\`
${it.items
  .map(item => cdnRoots.AltCdn(branches.stable, item.owner) + item.fullAbsolutePath)
  .join('\n')}
\`\`\`

</details>
<details>
<summary><strong>jsDelivr Preview</strong></summary>

\`\`\`
${it.items
  .map(item => cdnRoots.AltCdn(branches.preview, item.owner) + item.fullAbsolutePath)
  .join('\n')}
\`\`\`

</details>
<details>
<summary><strong>GitHub Stable</strong></summary>

\`\`\`
${it.items
  .map(item => cdnRoots.GitHub(branches.stable, item.owner) + item.fullAbsolutePath)
  .join('\n')}
\`\`\`

</details>
<details>
<summary><strong>GitHub Preview</strong></summary>

\`\`\`
${it.items
  .map(item => cdnRoots.GitHub(branches.preview, item.owner) + item.fullAbsolutePath)
  .join('\n')}
\`\`\`

</details>
        `.trim()
    return itemText
  })
  const markdown = `
# 合集包
合集包提供了批量的功能安装链接, 方便一次性安装大量功能.

${packagesTexts.join('\n\n')}

`.trim()
  return {
    markdown,
    json: JSON.stringify(
      packagesPaths.map(it => ({ ...it, type: 'pack' })),
      undefined,
      2,
    ),
  }
}
