import { defineComponentMetadata } from '@/components/define'
import { cdnRoots } from '@/core/cdn-types'
import { branches } from '@/core/meta'
import { getComponentsDoc } from './components-doc'
import { generatePackageDocs } from './packages-doc'
import { getPluginsDoc } from './plugins-doc'

/** 表示一个合集包 */
export interface Package {
  name: string
  displayName: string
  description?: string
  components?: string[]
  plugins?: string[]
}
/** 表示一个支持在线安装的功能 */
export interface DocSourceItem {
  type: 'component' | 'plugin'
  name: string
  displayName: string
  description?: string
  descriptionText?: string
  fullAbsolutePath: string
  fullRelativePath: string
  owner?: string
}
export type DocSource = (rootPath: string) => Promise<{
  title: string
  items: DocSourceItem[]
}>

const entry = () => {
  unsafeWindow.generateDocs = async (output = 'zip') => {
    const rootPath = '../../registry/dist/'
    const getDocText = (title: string, items: DocSourceItem[]) => {
      const docText = items.map(it => {
        const { name, displayName, description, fullAbsolutePath, fullRelativePath, owner } = it
        const item = `
### [${displayName}](${fullRelativePath})
\`${name}\`

**jsDelivr:** [\`Stable\`](${cdnRoots.jsDelivr(
          branches.stable,
          owner,
        )}${fullAbsolutePath}) / [\`Preview\`](${cdnRoots.jsDelivr(
          branches.preview,
          owner,
        )}${fullAbsolutePath})

**GitHub:** [\`Stable\`](${cdnRoots.GitHub(
          branches.stable,
          owner,
        )}${fullAbsolutePath}) / [\`Preview\`](${cdnRoots.GitHub(
          branches.preview,
          owner,
        )}${fullAbsolutePath})

${description || ''}
        `.trim()
        return item
      })
      return `
## ${title}

${docText.join('\n\n')}
      `.trim()
    }
    const componentsDoc = await getComponentsDoc(rootPath)
    const pluginsDoc = await getPluginsDoc(rootPath)
    const featuresMarkdown = `
# 可安装功能

${getDocText(componentsDoc.title, componentsDoc.items)}
${getDocText(pluginsDoc.title, pluginsDoc.items)}

`.trim()
    const featuresJson = JSON.stringify([...componentsDoc.items, ...pluginsDoc.items], undefined, 2)

    const packData = await generatePackageDocs(componentsDoc.items.concat(pluginsDoc.items))

    if (output === 'zip') {
      const { DownloadPackage } = await import('@/core/download')
      const pack = new DownloadPackage()
      pack.noEscape = true
      pack.add('features.md', featuresMarkdown)
      pack.add('pack/pack.md', packData.markdown)
      pack.add('features.json', featuresJson)
      pack.add('pack/pack.json', packData.json)
      await pack.emit('features.zip')
    } else if (output === 'console') {
      console.log(JSON.parse(featuresJson))
      console.log(JSON.parse(packData.json))
    }
  }
}
export const doc = defineComponentMetadata({
  name: 'featureDocsGenerator',
  displayName: '功能文档生成器',
  entry,
  reload: entry,
  unload: () => {
    delete unsafeWindow.generateDocs
  },
  tags: [componentsTags.utils],
})
