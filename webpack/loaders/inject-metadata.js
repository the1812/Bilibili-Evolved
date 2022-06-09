const { compilationInfo } = require('../compilation-info')
const nodePath = require('path')

module.exports = function (babel) {
  const { types } = babel
  return {
    visitor: {
      ExportNamedDeclaration (path, state) {
        const { filename } = state.file.opts
        const isFromRegistry = filename.startsWith(nodePath.resolve('./registry'))
        const isEntryFile = nodePath.basename(filename) === 'index.ts'
        if (!(isFromRegistry && isEntryFile)) {
          return
        }
        const { node } = path
        node.declaration?.declarations?.forEach(d => {
          if (!['component', 'plugin'].includes(d.id?.name)) {
            return
          }
          const targetExpression = d.init.type === 'CallExpression' ? d.init.arguments[0] : d.init
          if (targetExpression.type !== 'ObjectExpression') {
            return
          }
          targetExpression.properties.push(...[
            types.objectProperty(types.identifier('commitHash'), types.stringLiteral(compilationInfo.commitHash)),
            types.objectProperty(types.identifier('coreVersion'), types.stringLiteral(compilationInfo.version)),
          ])
        })
      }
    }
  }
}
