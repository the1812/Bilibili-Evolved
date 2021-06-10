module.exports = Object.fromEntries(['component', 'plugin'].map(type => {
  return [type, async () => {
    const src = `./registry/lib/${type}s/`
    const glob = require('glob')
    const entries = glob.sync(src + '**/index.ts')

    const { AutoComplete } = require('enquirer')
    const prompt = new AutoComplete({
      name: 'path',
      message: 'Select build target',
      choices: entries,
    })
    const entry = await prompt.run()
    const path = require('path')
    const id = path.dirname(path.relative(src, entry)).replace(/\\/g, '/')
    const { getDefaultConfig } = require('../../webpack/webpack.config')
    const config = Object.assign(getDefaultConfig(path.resolve(src)), {
      mode: 'production',
      entry: {
        [id]: entry,
      },
      output: {
        path: path.resolve(`./registry/dist/${type}s/`),
        filename: '[name].js',
        library: {
          name: '[name]',
          type: 'umd',
          export: type,
        },
      },
      cache: false,
    })
    config.externals.push(function ({ request }, callback) {
      const lodash = require('lodash')
      const regexMatch = (regex, base) => {
        const match = request.match(regex)
        if (match) {
          const subModules = match[1] ? match[1].split('/').map(name => {
            if (name.match(/\.vue$/)) {
              return name.replace(/\.vue$/, '')
            }
            return lodash.camelCase(name)
          }) : []
          return () => callback(null, ['coreApis', ...base, ...subModules], 'root')
        }
        return null
      }
      const matches = [
        {
          regex: /^@\/core\/(.+)$/,
          base: [],
        },
        {
          regex: /^@\/ui$/,
          base: ['ui'],
        },
        {
          regex: /^@\/components\/(.+)$/,
          base: ['componentApis'],
        },
        {
          regex: /^@\/plugins\/(.+)$/,
          base: ['pluginApis'],
        },
      ]
      for (const { regex, base } of matches) {
        const matchCallback = regexMatch(regex, base)
        if (matchCallback) {
          return matchCallback()
        }
      }
      return callback()
    },)
    return config
  }]
}))
