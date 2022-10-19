import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { objectProperty, identifier } from '@babel/types'
import { parseExpression } from '@babel/parser'
import { InjectMetadataAction } from './types'

/**
 * 当入口文件 index.ts 旁边还有 index.md 时, 将其作为中文的 description 注入.
 * 如果还有 index.{language}.md, 也会一并作为多语言的 description 注入.
 * 注意 index.ts 中原有的 description 会被覆盖.
 *
 * 例子:
 * - index.ts
 * - index.md
 * - index.en-US.md
 *
 * 可以自动在 index.ts 中的定义中注入 zh-CN 和 en-US 的 description
 */
export const injectDescription: InjectMetadataAction = ({ filename }) => {
  const folder = dirname(filename)
  const defaultDesc = join(folder, 'index.md')
  if (!existsSync(defaultDesc)) {
    return []
  }
  const regex = /index\.(.+)\.md$/
  return [
    objectProperty(
      identifier('description'),
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
    'zh-CN': () => import('./index.md').then(m => m.default),
  }
})()
      `,
        { plugins: ['typescript'] },
      ),
    ),
  ]
}
