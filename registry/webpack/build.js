const { buildByEntry } = require('./config')

module.exports = Object.fromEntries(['component', 'plugin', 'doc'].map(type => {
  const src = `./registry/lib/${type}s/`
  return [type, async ({ buildAll = false } = {}) => {
    const glob = require('glob')
    const entries = glob.sync(src + '**/index.ts')

    if (buildAll) {
      console.log(`[build all] discovered ${entries.length} ${type}s`)
      return entries.map(entry => buildByEntry({ src, type, entry }))
    }

    let entry
    if (entries.length > 1) {
      const { AutoComplete } = require('enquirer')
      const prompt = new AutoComplete({
        name: 'path',
        message: 'Select build target',
        choices: entries,
      })
      entry = await prompt.run()
    } else {
      [entry] = entries
      console.log(`Build target · ${entry}`)
    }
    return buildByEntry({ src, type, entry })
  }]
}))
