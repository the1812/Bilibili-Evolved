const buildByEntry = (entry: string) => {
  const match = entry.match(/\/?registry\/dist\/([^\/]+)\/(.+)\/index\.ts/)
  if (!match) {
    throw new Error(`Invalid entry path: ${entry}`)
  }
  const
  const path = require('path')
  const { getId } = require('./id')
  const id = getId(src, entry)
  const { getDefaultConfig } = require('../../webpack/webpack.config')
  const config = Object.assign(getDefaultConfig(path.resolve('./registry/lib/')), {
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
  })
  return config
}
module.exports = {
  buildByEntry,
}
