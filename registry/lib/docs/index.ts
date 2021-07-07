import { ComponentMetadata } from '@/components/types'
import { getId } from '../../webpack/id'

const entry = () => {
  unsafeWindow.generateDocs = async () => {
    const { getDescriptionMarkdown } = await import('@/components/description')
    const rootPath = '../registry/dist/'
    const componentsContext = require.context('../components', true, /index\.ts$/)
    const componentsPaths = componentsContext.keys()
    const componentsTexts = componentsPaths
      .map(path => {
        const module = componentsContext(path)
        if ('component' in module) {
          const component = module.component as ComponentMetadata
          return {
            component,
            path,
          }
        }
        return undefined
      }).filter(it => it !== undefined)
      .map(it => {
        const root = `${rootPath}components/`
        const fullPath = `${root}${getId(root, it.path.replace(/^\.?\//, ''))}.js`
        const {
          name,
          displayName,
        } = it.component

        const item = `
## [${displayName}](${fullPath})
\`${name}\`

${getDescriptionMarkdown(it.component)}
    `.trim()
        return item
      })

    const markdown = `
# 可安装功能
在标题右键可以复制安装链接.

${componentsTexts.join('\n\n')}
`.trim()

    const { DownloadPackage } = await import('@/core/download')
    DownloadPackage.single('registry.md', markdown)
  }
}
export const doc: ComponentMetadata = {
  name: 'featureDocsGenerator',
  displayName: '功能文档生成器',
  entry,
  reload: entry,
  unload: () => { delete unsafeWindow.generateDocs },
  tags: [componentsTags.utils],
  enabledByDefault: true,
}
