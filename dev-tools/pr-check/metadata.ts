import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'
import { readFileSync } from 'fs'
import { FeatureMetadata } from './types'

export const isRegistryFeatureIndex = (filePath: string) =>
  /^registry\/lib\/(components|plugins)\/.+\/index\.ts$/.test(filePath)

const getPropertyName = (property: t.ObjectProperty | t.ObjectMethod) => {
  const { key } = property
  if (t.isIdentifier(key)) {
    return key.name
  }
  if (t.isStringLiteral(key)) {
    return key.value
  }
  return undefined
}

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

const getStringProperty = (objectExpression: t.ObjectExpression, propertyName: string) => {
  const property = objectExpression.properties.find(item => {
    if (!t.isObjectProperty(item)) {
      return false
    }
    return getPropertyName(item) === propertyName
  })
  if (!property || !t.isObjectProperty(property) || !t.isStringLiteral(property.value)) {
    return undefined
  }
  return property.value.value
}

export const getFeatureMetadata = (filePath: string): FeatureMetadata | undefined => {
  const content = readFileSync(filePath, 'utf8')
  const ast = parse(content, {
    plugins: ['typescript'],
    sourceType: 'module',
  })
  let metadata: FeatureMetadata | undefined

  traverse(ast as Parameters<typeof traverse>[0], {
    CallExpression(callPath: unknown) {
      if (metadata) {
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
      metadata = {
        kind: 'component',
        name: getStringProperty(argument, 'name'),
        properties: getObjectProperties(argument),
      }
    },
    VariableDeclarator(variablePath: unknown) {
      if (metadata) {
        return
      }
      const { node } = variablePath as { node: t.VariableDeclarator }
      if (!t.isIdentifier(node.id, { name: 'plugin' }) || !t.isObjectExpression(node.init)) {
        return
      }
      metadata = {
        kind: 'plugin',
        name: getStringProperty(node.init, 'name'),
        properties: getObjectProperties(node.init),
      }
    },
  })
  return metadata
}
