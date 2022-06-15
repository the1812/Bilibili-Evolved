import { existsSync, readFileSync } from 'fs'
import { basename, dirname, join } from 'path'
import { InjectMetadataAction } from './types'
import { glob } from 'glob'
import {
  objectProperty,
  objectExpression,
  identifier,
  stringLiteral,
} from '@babel/types'

export const injectDescription: InjectMetadataAction = ({ filename }) => {
  const folder = dirname(filename)
  const defaultDesc = join(folder, 'index.md')
  if (!existsSync(defaultDesc)) {
    return []
  }
  const properties = [
    objectProperty(stringLiteral('zh-CN'), stringLiteral(readFileSync(defaultDesc, { encoding: 'utf-8' }))),
  ]
  glob.sync('index.*.md', { cwd: folder }).forEach(path => {
    const languageMatch = basename(path).match(/^index\.(.+)\.md$/)
    if (!languageMatch) {
      return
    }
    const [, language] = languageMatch
    properties.push(objectProperty(stringLiteral(language), stringLiteral(readFileSync(path, { encoding: 'utf-8' }))))
  })

  return [
    objectProperty(
      identifier('description'),
      objectExpression(properties),
    ),
  ]
}
