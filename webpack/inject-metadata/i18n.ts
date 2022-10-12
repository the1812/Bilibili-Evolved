import { dirname } from 'path'
import { objectProperty, identifier } from '@babel/types'
import { parseExpression } from '@babel/parser'
import { readdirSync } from 'fs'
import { InjectMetadataAction } from './types'

/**
 * 当入口文件 index.ts 旁边还有 index.{language}.ts 时, 将其作为 i18n 注入.
 * 注意 index.ts 中原有的 i18n 会被覆盖.
 *
 * 例子:
 * - index.ts
 * - index.en-US.ts
 *
 * 可以自动在 index.ts 中的定义中注入 en-US 的 i18n
 */
export const injectI18n: InjectMetadataAction = ({ filename }) => {
  const folder = dirname(filename)
  const regex = /index\.(.+)\.ts$/
  const matchedFiles = readdirSync(folder).filter(file => file.match(regex))
  if (matchedFiles.length === 0) {
    return []
  }

  return [
    objectProperty(
      identifier('i18n'),
      parseExpression(
        `
(() => {
  const context = require.context('./', false, ${regex})
  return {
    ...Object.fromEntries(context
      .keys()
      .map(path => {
        const key = path.match(${regex})[1]
        const value = context(path)
        return [key, value]
      })),
  }
})()
      `,
        { plugins: ['typescript'] },
      ),
    ),
  ]
}
