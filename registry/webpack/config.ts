import { getDefaultConfig } from '../../webpack/webpack.config'
import path from 'path'
import { getId } from '../lib/id'
import { Configuration } from 'webpack'

export const buildByEntry = ({ src, type, entry }: { src: string; type: string; entry: string }) => {
  // const match = entry.match(/\/?registry\/dist\/([^\/]+)\/(.+)\/index\.ts/)
  // if (!match) {
  //   throw new Error(`Invalid entry path: ${entry}`)
  // }
  const id = getId(src, entry)
  const defaultConfig = getDefaultConfig(path.resolve('./registry/lib/'))
  const config: Configuration = {
    ...defaultConfig,
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
    externals: [
      ...(defaultConfig.externals as any[]),
      ({ request }, callback) => {
        const lodash = require('lodash')
        const regexMatch = (regex: RegExp, base: string[]) => {
          const match = request.match(regex)
          if (match) {
            const subModules = match[1] ? match[1].split('/').map(name => {
              if (name.match(/\.vue$/)) {
                return name.replace(/\.vue$/, '')
              }
              return lodash.camelCase(name)
            }) : []
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
      }
    ],
  }
  return config
}
