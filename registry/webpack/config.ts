import path from 'path'
import lodash from 'lodash'
import { Configuration } from 'webpack'
import { getDefaultConfig } from '../../webpack/webpack.config'
import { getId } from '../lib/id'

export const buildByEntry = (params: {
  src: string
  type: string
  entry: string
  mode?: Configuration['mode']
}) => {
  // const match = entry.match(/\/?registry\/dist\/([^\/]+)\/(.+)\/index\.ts/)
  // if (!match) {
  //   throw new Error(`Invalid entry path: ${entry}`)
  // }
  const { src, type, entry, mode = 'production' } = params
  const id = getId(src, entry)
  const defaultConfig = getDefaultConfig(path.resolve('./registry/lib/'))
  const config: Configuration = {
    ...defaultConfig,
    mode,
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
    externals: [
      // see src/client/init-vue.ts
      { vue: 'global Vue' },
      ...(defaultConfig.externals as any[]),
      ({ request }, callback) => {
        const regexMatch = (regex: RegExp, base: string[]) => {
          const match = request.match(regex)
          if (match) {
            const subModules = match[1]
              ? match[1].split('/').map(name => {
                  if (name.match(/\.vue$/)) {
                    return name.replace(/\.vue$/, '')
                  }
                  return lodash.camelCase(name)
                })
              : []
            return () => (callback as any)(null, ['coreApis', ...base, ...subModules], 'root')
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
      },
    ],
  }
  return config
}
