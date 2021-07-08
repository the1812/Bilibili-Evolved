import { ComponentMetadata } from '@/components/types'
import { getId } from '../../webpack/id'

const entry = () => {
  unsafeWindow.generateDocs = async () => {
    const { getDescriptionMarkdown } = await import('@/components/description')
    const { cdnRoots } = await import('@/core/cdn-types')
    const rootPath = '../registry/dist/'
    const componentsContext = require.context('../components', true, /index\.ts$/)
    const componentsPaths = componentsContext
      .keys()
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
      })
      .filter(it => it !== undefined)
      .map(it => {
        const root = `${rootPath}components/`
        const fullRelativePath = `${root}${getId(root, it.path.replace(/^\.?\//, ''))}.js`
        const fullAbsolutePath = fullRelativePath.replace(/^\.\.\//, '')
        const {
          name,
          displayName,
        } = it.component
        const description = getDescriptionMarkdown(it.component)
        return {
          name,
          displayName,
          description,
          fullRelativePath,
          fullAbsolutePath,
        }
      })
    const componentsTexts = componentsPaths.map(it => {
      const {
        name,
        displayName,
        description,
        fullAbsolutePath,
        fullRelativePath,
      } = it
      const item = `
## [${displayName}](${fullRelativePath})
\`${name}\`

**jsDelivr:** [\`Stable\`](${cdnRoots.jsDelivr('v2')}${fullAbsolutePath}) / [\`Preview\`](${cdnRoots.jsDelivr('preview')}${fullAbsolutePath})

**GitHub:** [\`Stable\`](${cdnRoots.GitHub('v2')}${fullAbsolutePath}) / [\`Preview\`](${cdnRoots.GitHub('preview')}${fullAbsolutePath})

${description}
        `.trim()
      return item
    })

    const markdown = `
# 可安装功能

${componentsTexts.join('\n\n')}
`.trim()

    const { DownloadPackage } = await import('@/core/download')
    const pack = new DownloadPackage()
    pack.add('features.md', markdown)
    pack.add('features.json', JSON.stringify(componentsPaths, undefined, 2))
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
  enabledByDefault: true,
}
