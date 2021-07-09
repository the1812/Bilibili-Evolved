import { ComponentMetadata } from '@/components/types'
import { DocSource } from '.'
import { getId } from '../../webpack/id'

export const getComponentsDoc: DocSource = async rootPath => {
  const { getDescriptionMarkdown } = await import('@/components/description')
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
        type: 'component',
        name,
        displayName,
        description,
        fullRelativePath,
        fullAbsolutePath,
      }
    })
  return {
    title: '组件',
    items: componentsPaths,
  }
}
