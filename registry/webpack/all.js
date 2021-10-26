const builder = require('./build')
module.exports = async () => {
  return [
    ...(await builder.component({ buildAll: true })),
    ...(await builder.plugin({ buildAll: true })),
  ]
}
