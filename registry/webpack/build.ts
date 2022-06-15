import glob from 'glob'
import { buildByEntry } from './config'

export const builders = Object.fromEntries(['component', 'plugin', 'doc'].map(type => {
  const src = `./registry/lib/${type}s/`
  return [type, async ({ buildAll = false } = {}) => {
    const entries = glob.sync(`${src}**/index.ts`)

    if (buildAll) {
      console.log(`[build all] discovered ${entries.length} ${type}s`)
      return entries.map(entry => buildByEntry({ src, type, entry }))
    }

    let entry: string
    if (entries.length > 1) {
      const { AutoComplete } = await import('enquirer')
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
    return [buildByEntry({ src, type, entry })]
  }]
}))
