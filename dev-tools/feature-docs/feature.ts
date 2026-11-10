import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { sync } from 'glob'
import * as t from '@babel/types'
import {
  collectStaticObjectConstants,
  collectStringConstants,
  findFeatureObject,
  findObjectProperty,
  parseFile,
  readAuthor,
  readStaticString,
} from './ast'
import { DocSourceItem, FeatureKind } from './types'

const getFeatureId = (root: string, entry: string) => {
  const relative = entry.replace(root, '').replace(/\\/g, '/')
  return relative.replace(/\/[^/]+$/, '')
}

const readFeatureMetadata = (file: string, kind: FeatureKind) => {
  const ast = parseFile(file)
  const constants = collectStringConstants(ast)
  const objectConstants = collectStaticObjectConstants(ast, constants)
  const metadata = findFeatureObject(ast)
  if (!metadata) {
    return undefined
  }

  const name = readStaticString(findObjectProperty(metadata, 'name')?.value, constants)
  const displayName = readStaticString(
    findObjectProperty(metadata, 'displayName')?.value,
    constants,
  )
  if (!name || !displayName) {
    throw new Error(`${file}: failed to resolve static name/displayName`)
  }

  const author = readAuthor(
    findObjectProperty(metadata, 'author')?.value,
    constants,
    objectConstants,
  )
  const authorProperty = findObjectProperty(metadata, 'author')
  if (authorProperty && !author) {
    throw new Error(`${file}: failed to resolve static author`)
  }

  const tagsProperty = kind === 'component' ? findObjectProperty(metadata, 'tags') : undefined
  let tags: string[] | undefined
  if (tagsProperty) {
    const { value } = tagsProperty
    if (!t.isArrayExpression(value)) {
      throw new Error(`${file}: failed to resolve static tags`)
    }
    tags = value.elements.map(tag => {
      if (
        !t.isMemberExpression(tag, { computed: false }) ||
        !t.isIdentifier(tag.object, { name: 'componentsTags' }) ||
        !t.isIdentifier(tag.property)
      ) {
        throw new Error(`${file}: expected a componentsTags reference`)
      }
      return tag.property.name
    })
  }

  return { name, displayName, author, tags }
}

const readMarkdownDescription = (file: string) =>
  readFileSync(file, 'utf8').replace(/\r\n?/g, '\n').trim()

export const readFeatureDocs = (kind: FeatureKind): DocSourceItem[] => {
  const src = `./registry/lib/${kind}s/`
  const rootPath = `../../registry/dist/${kind}s/`
  return sync(`${src}**/index.ts`, { dotRelative: true, posix: true })
    .sort()
    .map(file => {
      const metadata = readFeatureMetadata(file, kind)
      if (!metadata) {
        return undefined
      }
      const descriptionFile = join(dirname(file), 'index.md')
      if (!existsSync(descriptionFile)) {
        throw new Error(`${file}: missing index.md description`)
      }
      const fullRelativePath = `${rootPath}${getFeatureId(src, file)}.js`
      const fullAbsolutePath = fullRelativePath.replace(/^(\.\.?\/)*/, '')
      return {
        type: kind,
        name: metadata.name,
        displayName: metadata.displayName,
        description: readMarkdownDescription(descriptionFile),
        author: metadata.author,
        tags: metadata.tags,
        fullRelativePath,
        fullAbsolutePath,
      } as DocSourceItem
    })
    .filter((item): item is DocSourceItem => item !== undefined)
}
