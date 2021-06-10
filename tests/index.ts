mocha.setup('bdd')
const ctx = require.context('.', true, /\.test\.ts$/)
ctx.keys().forEach(k => {
  ctx(k)
})
mocha.run()
