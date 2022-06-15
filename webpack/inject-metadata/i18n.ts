import { basename, dirname } from 'path'
import { glob } from 'glob'
import {
  ObjectProperty,
  objectProperty,
  objectExpression,
  import as importIdentifier,
  identifier,
  callExpression,
  arrowFunctionExpression,
  stringLiteral,
} from '@babel/types'
import { InjectMetadataAction } from './types'

export const injectI18n: InjectMetadataAction = ({ filename }) => {
  const folder = dirname(filename)

  const properties: ObjectProperty[] = []
  glob.sync('index.*.ts', { cwd: folder }).forEach(path => {
    const i18nFilename = basename(path)
    const languageMatch = i18nFilename.match(/^index\.(.+)\.ts$/)
    if (!languageMatch) {
      return
    }
    const [, language] = languageMatch
    properties.push(objectProperty(
      stringLiteral(language),
      arrowFunctionExpression([], callExpression(importIdentifier(), [stringLiteral(`./${i18nFilename}`)])),
    ))
  })
  if (properties.length === 0) {
    return []
  }

  return [
    objectProperty(
      identifier('i18n'),
      objectExpression(properties),
    ),
  ]
}
