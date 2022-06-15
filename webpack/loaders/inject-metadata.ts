import { runtimeInfo } from '../compilation-info/runtime'
import { commitHash } from '../compilation-info/git'
import nodePath from 'path'
import { PluginObj } from '@babel/core'
import {
  Identifier,
  objectProperty,
  identifier,
  stringLiteral,
} from '@babel/types'

export const injectMetadata = (): PluginObj => {
  return {
    visitor: {
      ExportNamedDeclaration(path, state) {
        const { filename } = state.file.opts
        const isFromRegistry = filename.startsWith(
          nodePath.resolve('./registry'),
        )
        const isEntryFile = nodePath.basename(filename) === 'index.ts'
        if (!(isFromRegistry && isEntryFile)) {
          return
        }
        const { node } = path
        if (node.declaration?.type !== 'VariableDeclaration') {
          return
        }
        node.declaration.declarations?.forEach(d => {
          if (!['component', 'plugin'].includes((d.id as Identifier)?.name)) {
            return
          }
          const targetExpression =
            d.init.type === 'CallExpression' ? d.init.arguments[0] : d.init
          if (targetExpression.type !== 'ObjectExpression') {
            return
          }
          targetExpression.properties.push(
            ...[
              objectProperty(
                identifier('commitHash'),
                stringLiteral(commitHash),
              ),
              objectProperty(
                identifier('coreVersion'),
                stringLiteral(runtimeInfo.version),
              ),
            ],
          )
        })
      },
    },
  }
}
