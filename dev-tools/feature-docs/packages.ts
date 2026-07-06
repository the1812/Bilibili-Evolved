import traverse from '@babel/traverse'
import * as t from '@babel/types'
import { sync } from 'glob'
import { findObjectProperty, parseFile, readStaticString, readStaticStringArray } from './ast'
import { getPackageMarkdown } from './markdown'
import { DocSourceItem, FeatureKind, PackageDoc, PackItem } from './types'

const readPackages = () =>
  sync('registry/lib/docs/packages/**/*.ts', { posix: true })
    .sort()
    .map(file => {
      const ast = parseFile(file)
      let packObject: t.ObjectExpression | undefined
      traverse(ast, {
        VariableDeclarator(path) {
          if (
            !t.isIdentifier(path.node.id, { name: 'pack' }) ||
            !t.isObjectExpression(path.node.init)
          ) {
            return
          }
          packObject = path.node.init
        },
      })
      if (!packObject) {
        throw new Error(`${file}: missing pack object`)
      }
      const constants = new Map<string, string>()
      const name = readStaticString(findObjectProperty(packObject, 'name')?.value, constants)
      const displayName = readStaticString(
        findObjectProperty(packObject, 'displayName')?.value,
        constants,
      )
      const description = readStaticString(
        findObjectProperty(packObject, 'description')?.value,
        constants,
      )
      const components = readStaticStringArray(
        findObjectProperty(packObject, 'components')?.value,
        constants,
      )
      const plugins = readStaticStringArray(
        findObjectProperty(packObject, 'plugins')?.value,
        constants,
      )
      if (!name || !displayName) {
        throw new Error(`${file}: failed to resolve pack metadata`)
      }
      return {
        name,
        displayName,
        description,
        components,
        plugins,
      } as PackageDoc
    })

const generateDescription = (pack: PackageDoc, containedItems: DocSourceItem[]) => {
  const finalDescription = `包含以下功能:\n${containedItems
    .map(item => item.displayName)
    .join(', ')}`
  return pack.description ? `${pack.description}\n\n${finalDescription}` : finalDescription
}

export const generatePackageDocs = (allItems: DocSourceItem[]) => {
  const packages = readPackages().map(pack => {
    const getDocSource = (type: FeatureKind, name: string) => {
      const docSource = allItems.find(item => item.type === type && item.name === name)
      if (!docSource) {
        throw new Error(`Package ${pack.name}: missing ${type} ${name}`)
      }
      return docSource
    }
    const items = (pack.components ?? [])
      .map(name => getDocSource('component', name))
      .concat((pack.plugins ?? []).map(name => getDocSource('plugin', name)))
    return {
      ...pack,
      items,
      description: generateDescription(pack, items),
      type: 'pack',
    } as PackItem
  })
  return {
    markdown: getPackageMarkdown(packages),
    json: JSON.stringify(packages, undefined, 2),
  }
}
