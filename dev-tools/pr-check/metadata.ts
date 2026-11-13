import traverse from '@babel/traverse'
import * as t from '@babel/types'
import { existsSync } from 'fs'
import { sync } from 'glob'
import { dirname, resolve } from 'path'
import {
  collectStringConstants,
  findFeatureObject,
  findObjectProperty,
  getPropertyName,
  parseFile,
  parseTypeScript,
  readStaticString,
} from '../feature-ast'
import { FeatureMetadata } from './types'

export const isRegistryFeatureIndex = (filePath: string) =>
  /^registry\/lib\/(components|plugins)\/(?:.+\/)?index\.ts$/.test(filePath)

const getObjectProperties = (objectExpression: t.ObjectExpression) =>
  new Set(
    objectExpression.properties
      .filter(
        (property): property is t.ObjectProperty | t.ObjectMethod =>
          t.isObjectProperty(property) || t.isObjectMethod(property),
      )
      .map(getPropertyName)
      .filter((name): name is string => name !== undefined),
  )

export const parseFeatureMetadata = (
  content: string,
  expectedKind?: FeatureMetadata['kind'],
): FeatureMetadata | undefined => {
  const ast = parseTypeScript(content)
  const constants = collectStringConstants(ast)
  const readMetadata = (kind: FeatureMetadata['kind'], object: t.ObjectExpression) => ({
    kind,
    name: readStaticString(findObjectProperty(object, 'name')?.value, constants),
    displayName: readStaticString(findObjectProperty(object, 'displayName')?.value, constants),
    properties: getObjectProperties(object),
  })
  let metadata: FeatureMetadata | undefined

  traverse(ast as Parameters<typeof traverse>[0], {
    CallExpression(callPath: unknown) {
      if (metadata || expectedKind === 'plugin') {
        return
      }
      const { node } = callPath as { node: t.CallExpression }
      if (!t.isIdentifier(node.callee, { name: 'defineComponentMetadata' })) {
        return
      }
      const [argument] = node.arguments
      if (!t.isObjectExpression(argument)) {
        return
      }
      metadata = readMetadata('component', argument)
    },
    VariableDeclarator(variablePath: unknown) {
      if (metadata || expectedKind === 'component') {
        return
      }
      const { node } = variablePath as { node: t.VariableDeclarator }
      if (!t.isIdentifier(node.id, { name: 'plugin' }) || !t.isObjectExpression(node.init)) {
        return
      }
      metadata = readMetadata('plugin', node.init)
    },
  })
  return metadata
}

const readComponentString = (
  value: t.Node | undefined,
  constants: Map<string, string>,
  ast: t.File,
  file: string,
) => {
  const local = readStaticString(value, constants)
  if (local !== undefined || !t.isIdentifier(value)) {
    return local
  }
  for (const statement of ast.program.body) {
    if (!t.isImportDeclaration(statement) || !statement.source.value.startsWith('.')) {
      continue
    }
    const specifier = statement.specifiers.find(
      (item): item is t.ImportSpecifier =>
        t.isImportSpecifier(item) && item.local.name === value.name,
    )
    if (specifier && t.isIdentifier(specifier.imported)) {
      const modulePath = resolve(dirname(file), statement.source.value)
      const source = [`${modulePath}.ts`, `${modulePath}/index.ts`].find(existsSync)
      return source && collectStringConstants(parseFile(source)).get(specifier.imported.name)
    }
  }
  return undefined
}

export const readComponentDisplayNames = () => {
  const names = new Map<string, string>()
  const files = sync(['src/components/*/index.ts', 'registry/lib/components/**/index.ts'], {
    posix: true,
  })
  for (const file of files) {
    const ast = parseFile(file)
    const object = findFeatureObject(ast)
    if (!object) {
      continue
    }
    const constants = collectStringConstants(ast)
    const read = (key: string) =>
      readComponentString(findObjectProperty(object, key)?.value, constants, ast, file)
    const name = read('name')
    const displayName = read('displayName')
    if (name && displayName) {
      names.set(name, displayName)
    }
  }
  return names
}
