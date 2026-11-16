import traverse from '@babel/traverse'
import * as t from '@babel/types'
import { findObjectProperty, readStaticString } from '../feature-ast'
import type { Author } from './types'

export const readAuthor = (
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
    const authors = node.elements.map(element => readAuthor(element, constants, objectConstants))
    return authors.every((author): author is Author => author !== undefined) ? authors : undefined
  }
  return undefined
}

export const collectAuthorConstants = (ast: t.File, constants: Map<string, string>) => {
  const objectConstants = new Map<string, Author | Author[]>()
  traverse(ast, {
    VariableDeclarator(path) {
      const { node } = path
      if (!t.isIdentifier(node.id)) {
        return
      }
      const author = readAuthor(node.init, constants, objectConstants)
      if (author) {
        objectConstants.set(node.id.name, author)
      }
    },
  })
  return objectConstants
}
