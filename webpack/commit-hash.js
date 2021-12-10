const { compilationInfo } = require('./compilation-info')
const nodePath = require('path')

module.exports = function (babel) {
  const { types } = babel
  return {
    visitor: {
      ExportNamedDeclaration(path, state) {
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
          if (d.init.type !== 'ObjectExpression') {
            return
          }
          d.init.properties.push(types.objectProperty(types.identifier('commitHash'), types.stringLiteral(compilationInfo.commitHash)))
        })
      }
    }
  }
}
