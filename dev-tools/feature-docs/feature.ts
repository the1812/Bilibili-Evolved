import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { sync } from 'glob'
import {
  collectStaticObjectConstants,
  collectStringConstants,
  findFeatureObject,
  findObjectProperty,
  parseFile,
  readAuthor,
  readStaticString,
} from './ast'
import { Author, DocSourceItem, FeatureKind } from './types'

const getFeatureId = (root: string, entry: string) => {
  const relative = entry.replace(root, '').replace(/\\/g, '/')
  return relative.replace(/\/[^/]+$/, '')
}

const readFeatureMetadata = (file: string) => {
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

  return { name, displayName, author }
}

export const getAuthorMarkdown = (author: Author | Author[] | undefined) => {
  if (!author) {
    return ''
  }
  if (Array.isArray(author)) {
    return `by ${author.map(item => `[@${item.name}](${item.link})`).join(', ')}\n\n`
  }
  return `by [@${author.name}](${author.link})\n\n`
}

const readMarkdownDescription = (file: string) =>
  readFileSync(file, 'utf8').replace(/\r\n?/g, '\n').trim()

export const readFeatureDocs = (kind: FeatureKind): DocSourceItem[] => {
  const src = `./registry/lib/${kind}s/`
  const rootPath = `../../registry/dist/${kind}s/`
  return sync(`${src}**/index.ts`, { dotRelative: true, posix: true })
    .sort()
    .map(file => {
      const metadata = readFeatureMetadata(file)
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
        description: getAuthorMarkdown(metadata.author) + readMarkdownDescription(descriptionFile),
        fullRelativePath,
        fullAbsolutePath,
      } as DocSourceItem
    })
    .filter((item): item is DocSourceItem => item !== undefined)
}
