import VueLoaderPlugin from 'vue-loader/lib/plugin'
import TerserPlugin from 'terser-webpack-plugin'
import webpack, { Configuration } from 'webpack'
import path from 'path'
import get from 'lodash/get'
import { cssStyleLoaders, sassStyleLoaders } from './loaders/style-loaders'
import { tsLoaders } from './loaders/ts-loader'
import { runtimeInfo } from './compilation-info/runtime'
import commonMeta from '../src/client/common.meta.json'
import * as gitInfo from './compilation-info/git'

const relativePath = (p: string) => path.join(process.cwd(), p)
export const getDefaultConfig = (src = relativePath('src')): Configuration => {
  return {
    mode: 'development',
    // devtool: 'eval-source-map',
    watchOptions: {
      ignored: /node_modules/,
    },
    externals: [
      {
        lodash: 'lodash',
      },
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.vue', '.json'],
      alias: {
        '@': relativePath('src'),
        'fuse.js$': 'fuse.js/dist/fuse.basic.esm.min.js',
      },
    },
    performance: {
      hints: false,
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: {
              comments: /==\/?UserScript==|^[ ]?@|eslint-disable|spell-checker/i,
            },
          },
          extractComments: false,
        }),
      ],
    },
    module: {
      rules: [
        {
          test: /\.(woff2|jpg|png|gif)$/,
          type: 'asset/inline',
          include: [src],
        },
        {
          test: /\.(svg|md)$/,
          type: 'asset/source',
          include: [src],
        },
        {
          test: /\.css$/,
          use: ['style-loader', ...cssStyleLoaders],
          include: /node_modules/,
        },
        {
          test: /\.css$/,
          oneOf: [
            {
              resourceQuery: /vue/,
              use: ['style-loader', ...cssStyleLoaders],
            },
            {
              use: ['to-string-loader', ...cssStyleLoaders],
            },
          ],
          include: [src],
        },
        {
          test: /\.scss$/,
          oneOf: [
            {
              resourceQuery: /vue/,
              use: ['style-loader', ...sassStyleLoaders],
            },
            {
              use: ['to-string-loader', ...sassStyleLoaders],
            },
          ],
          include: [src],
        },
        {
          test: /\.tsx?$/,
          use: [...tsLoaders],
          include: [src, relativePath('tests'), relativePath('webpack')],
        },
        {
          test: /\.vue$/,
          use: [
            {
              loader: 'vue-loader',
              options: {
                optimizeSSR: false,
                hotReload: false,
              },
            },
          ],
          include: [src],
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new webpack.ProvidePlugin({
        webpackCompilationInfo: [relativePath('webpack/compilation-info'), 'compilationInfo'],
      }),
      new webpack.DefinePlugin({
        webpackGitInfo: JSON.stringify(gitInfo),
      }),
      // new WebpackBar(),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      // new HardSourcePlugin(),
    ],
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },
  }
}

const replaceVariables = (text: string) => {
  return text.replace(/\[([^\[\]]+)\]/g, match => {
    const value = get(runtimeInfo, match)
    if (value !== undefined) {
      return value
    }
    return match
  })
}
export const getBanner = (
  meta: Record<string, string | string[]>,
) => `// ==UserScript==\n${Object.entries(Object.assign(meta, commonMeta))
  .map(([key, value]) => {
    if (Array.isArray(value)) {
      const lines = [
        ...new Set(value.map(item => `// @${key.padEnd(16, ' ')}${replaceVariables(item)}`)),
      ]
      return lines.join('\n')
    }
    return `// @${key.padEnd(16, ' ')}${replaceVariables(value)}`
  })
  .join('\n')}
// ==/UserScript==
/* eslint-disable */ /* spell-checker: disable */
// @[ You can find all source codes in GitHub repo ]`
