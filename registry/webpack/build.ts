import path from 'path'
import glob from 'glob'
import { buildByEntry } from './config'

const shorten = (p: string, type: string) => path.dirname(p).replace(`./registry/lib/${type}s/`, '')

export const builders = Object.fromEntries(
  ['component', 'plugin', 'doc'].map(type => {
    const src = `./registry/lib/${type}s/`
    return [
      type,
      async ({ buildAll = false } = {}) => {
        const entries = glob.sync(`${src}**/index.ts`).map(entry => ({
          name: shorten(entry, type),
          value: entry,
        }))

        if (buildAll) {
          console.log(`[build all] discovered ${entries.length} ${type}s`)
          return entries.map(({ value }) => buildByEntry({ src, type, entry: value }))
        }

        let entry: string
        if (entries.length > 1) {
          const { default: AutoComplete } = await import('enquirer/lib/prompts/autocomplete')
          console.log(AutoComplete)
          const prompt = new AutoComplete({
            name: 'path',
            message: 'Select build target',
            choices: entries,
          })
          entry = await prompt.run()
        } else {
          ;[{ value: entry }] = entries
        }
        console.log(`Build target · ${entry}`)
        return [buildByEntry({ src, type, entry })]
      },
    ]
  }),
)
