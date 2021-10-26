module.exports = require('./build').doc().then(config => {
  const path = require('path')
  config.output.path = path.resolve(`./registry/dist/`)
  config.output.filename = 'doc.js'
  return config
})
