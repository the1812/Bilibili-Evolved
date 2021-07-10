import { ComponentMetadata } from '@/components/types'
import { cdnRoots } from '@/core/cdn-types'
import { getComponentsDoc } from './components-doc'
import { getPluginsDoc } from './plugins-doc'

export interface DocSourceItem {
  type: string
  name: string
  displayName: string
  description?: string
  fullAbsolutePath: string
  fullRelativePath: string
}
export type DocSource = (rootPath: string) => Promise<{
  title: string
  items: DocSourceItem[]
}>

const entry = () => {
  unsafeWindow.generateDocs = async () => {
    const rootPath = '../../registry/dist/'
    const getDocText = (title: string, items: DocSourceItem[]) => {
      const docText = items.map(it => {
        const {
          name,
          displayName,
          description,
          fullAbsolutePath,
          fullRelativePath,
        } = it
        const item = `
### [${displayName}](${fullRelativePath})
\`${name}\`

**jsDelivr:** [\`Stable\`](${cdnRoots.jsDelivr('v2')}${fullAbsolutePath}) / [\`Preview\`](${cdnRoots.jsDelivr('preview')}${fullAbsolutePath})

**GitHub:** [\`Stable\`](${cdnRoots.GitHub('v2')}${fullAbsolutePath}) / [\`Preview\`](${cdnRoots.GitHub('preview')}${fullAbsolutePath})

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
    const markdown = `
# 可安装功能

${getDocText(componentsDoc.title, componentsDoc.items)}
${getDocText(pluginsDoc.title, pluginsDoc.items)}

`.trim()

    const { DownloadPackage } = await import('@/core/download')
    const pack = new DownloadPackage()
    pack.add('features.md', markdown)
    pack.add('features.json', JSON.stringify([
      ...componentsDoc.items,
      ...pluginsDoc.items,
    ], undefined, 2))
    await pack.emit('features.zip')
  }
}
export const doc: ComponentMetadata = {
  name: 'featureDocsGenerator',
  displayName: '功能文档生成器',
  entry,
  reload: entry,
  unload: () => { delete unsafeWindow.generateDocs },
  tags: [componentsTags.utils],
}
