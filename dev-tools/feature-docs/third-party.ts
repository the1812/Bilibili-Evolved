import traverse from '@babel/traverse'
import * as t from '@babel/types'
import { findObjectProperty, parseFile, readStaticString } from './ast'
import { DocSourceItem, FeatureKind } from './types'

const readStaticDocSourceItem = (object: t.ObjectExpression): DocSourceItem => {
  const constants = new Map<string, string>()
  const type = readStaticString(findObjectProperty(object, 'type')?.value, constants) as FeatureKind
  const name = readStaticString(findObjectProperty(object, 'name')?.value, constants)
  const displayName = readStaticString(findObjectProperty(object, 'displayName')?.value, constants)
  const fullRelativePath = readStaticString(
    findObjectProperty(object, 'fullRelativePath')?.value,
    constants,
  )
  const fullAbsolutePath = readStaticString(
    findObjectProperty(object, 'fullAbsolutePath')?.value,
    constants,
  )
  const description = readStaticString(findObjectProperty(object, 'description')?.value, constants)
  const owner = readStaticString(findObjectProperty(object, 'owner')?.value, constants)
  if (!type || !name || !displayName || !fullRelativePath || !fullAbsolutePath) {
    throw new Error('registry/lib/docs/third-party.ts: failed to resolve third-party item')
  }
  return {
    type,
    name,
    displayName,
    description,
    fullRelativePath,
    fullAbsolutePath,
    owner,
  }
}

export const readThirdPartyDocs = () => {
  const ast = parseFile('registry/lib/docs/third-party.ts')
  const docs: Record<'component' | 'plugin', DocSourceItem[]> = {
    component: [],
    plugin: [],
  }
  traverse(ast, {
    VariableDeclarator(path) {
      const { node } = path
      if (
        !t.isIdentifier(node.id) ||
        !['thirdPartyComponents', 'thirdPartyPlugins'].includes(node.id.name) ||
        !t.isArrayExpression(node.init)
      ) {
        return
      }
      const variableName = node.id.name
      const kind = variableName === 'thirdPartyComponents' ? 'component' : 'plugin'
      docs[kind] = node.init.elements.map(element => {
        if (!t.isObjectExpression(element)) {
          throw new Error(`registry/lib/docs/third-party.ts: unsupported ${variableName} entry`)
        }
        const item = readStaticDocSourceItem(element)
        return {
          ...item,
          description: `${item.owner ? `by ${item.owner}\n\n` : ''}${
            item.description ?? '暂无描述.'
          }`,
        }
      })
    },
  })
  return docs
}
