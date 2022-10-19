import nodePath from 'path'
import { PluginObj } from '@babel/core'
import { InjectMetadataAction } from './types'
import { injectCoreInfo } from './core-info'
import { injectDescription } from './description'
import { injectI18n } from './i18n'

const injectActions: InjectMetadataAction[] = [injectCoreInfo, injectDescription, injectI18n]

export const injectMetadata = (): PluginObj => ({
  visitor: {
    ExportNamedDeclaration(path, state) {
      const { filename } = state.file.opts
      const isFromRegistry = filename.startsWith(nodePath.resolve('./registry'))
      const isFromCore =
        filename.startsWith(nodePath.resolve('./src/components')) ||
        filename.startsWith(nodePath.resolve('./src/plugins'))
      const isEntryFile = nodePath.basename(filename) === 'index.ts'
      if (!((isFromRegistry || isFromCore) && isEntryFile)) {
        return
      }
      const { node } = path
      if (node.declaration?.type !== 'VariableDeclaration') {
        return
      }
      node.declaration.declarations?.forEach(d => {
        const isNameValid =
          d.id?.type === 'Identifier' && ['component', 'plugin'].includes(d.id.name)
        if (!isNameValid) {
          return
        }
        const targetExpression = d.init.type === 'CallExpression' ? d.init.arguments[0] : d.init
        if (targetExpression.type !== 'ObjectExpression') {
          return
        }
        targetExpression.properties.push(
          ...injectActions.flatMap(action =>
            action({
              expression: targetExpression,
              filename,
            }),
          ),
        )
      })
    },
  },
})
