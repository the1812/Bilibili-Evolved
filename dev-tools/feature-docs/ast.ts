import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'
import { readFileSync } from 'fs'
import { Author } from './types'

export const parseFile = (file: string) =>
  parse(readFileSync(file, 'utf8'), {
    plugins: ['typescript'],
    sourceType: 'module',
  })

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

export const findObjectProperty = (object: t.ObjectExpression, name: string) =>
  object.properties.find(
    (property): property is t.ObjectProperty =>
      t.isObjectProperty(property) && getPropertyName(property) === name,
  )

export const readStaticString = (
  node: t.Node | null | undefined,
  constants: Map<string, string>,
): string | undefined => {
  if (!node) {
    return undefined
  }
  if (t.isStringLiteral(node)) {
    return node.value
  }
  if (t.isIdentifier(node)) {
    return constants.get(node.name)
  }
  if (t.isTemplateLiteral(node)) {
    let text = ''
    for (let i = 0; i < node.quasis.length; i++) {
      text += node.quasis[i].value.cooked ?? node.quasis[i].value.raw
      const expression = node.expressions[i]
      if (expression) {
        const value = readStaticString(expression, constants)
        if (value === undefined) {
          return undefined
        }
        text += value
      }
    }
    return text
  }
  return undefined
}

export const readStaticStringArray = (
  node: t.Node | null | undefined,
  constants: Map<string, string>,
) => {
  if (!node || !t.isArrayExpression(node)) {
    return undefined
  }
  const items = node.elements.map(element => readStaticString(element, constants))
  return items.every((item): item is string => item !== undefined) ? items : undefined
}

const readStaticAuthor = (
  node: t.Node | null | undefined,
  constants: Map<string, string>,
  objectConstants: Map<string, Author | Author[]>,
): Author | Author[] | undefined => {
  if (!node) {
    return undefined
  }
  if (t.isIdentifier(node)) {
    return objectConstants.get(node.name)
  }
  if (t.isObjectExpression(node)) {
    const name = readStaticString(findObjectProperty(node, 'name')?.value, constants)
    const link = readStaticString(findObjectProperty(node, 'link')?.value, constants)
    return name && link ? { name, link } : undefined
  }
  if (t.isArrayExpression(node)) {
    const authors = node.elements.map(element =>
      readStaticAuthor(element, constants, objectConstants),
    )
    return authors.every((author): author is Author => author !== undefined) ? authors : undefined
  }
  return undefined
}

export const collectStringConstants = (ast: t.File) => {
  const constants = new Map<string, string>()
  traverse(ast, {
    VariableDeclarator(path) {
      const { node } = path
      if (!t.isIdentifier(node.id)) {
        return
      }
      const value = readStaticString(node.init, constants)
      if (value !== undefined) {
        constants.set(node.id.name, value)
      }
    },
  })
  return constants
}

export const collectStaticObjectConstants = (ast: t.File, constants: Map<string, string>) => {
  const objectConstants = new Map<string, Author | Author[]>()
  traverse(ast, {
    VariableDeclarator(path) {
      const { node } = path
      if (!t.isIdentifier(node.id)) {
        return
      }
      const author = readStaticAuthor(node.init, constants, objectConstants)
      if (author) {
        objectConstants.set(node.id.name, author)
      }
    },
  })
  return objectConstants
}

export const readAuthor = (
  node: t.Node | null | undefined,
  constants: Map<string, string>,
  objectConstants: Map<string, Author | Author[]>,
) => readStaticAuthor(node, constants, objectConstants)

export const findFeatureObject = (ast: t.File) => {
  let metadata: t.ObjectExpression | undefined
  traverse(ast, {
    CallExpression(path) {
      if (metadata || !t.isIdentifier(path.node.callee, { name: 'defineComponentMetadata' })) {
        return
      }
      const [argument] = path.node.arguments
      if (t.isObjectExpression(argument)) {
        metadata = argument
      }
    },
    VariableDeclarator(path) {
      if (metadata || !t.isIdentifier(path.node.id)) {
        return
      }
      if (path.node.id.name === 'plugin' && t.isObjectExpression(path.node.init)) {
        metadata = path.node.init
        return
      }
      if (path.node.id.name !== 'component' || !t.isCallExpression(path.node.init)) {
        return
      }
      const [argument] = path.node.init.arguments
      if (t.isObjectExpression(argument)) {
        metadata = argument
      }
    },
  })
  return metadata
}
