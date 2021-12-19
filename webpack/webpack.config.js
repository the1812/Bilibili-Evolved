const VueLoaderPlugin = require('vue-loader/lib/plugin')
const TerserPlugin = require('terser-webpack-plugin')
// const HardSourcePlugin = require('hard-source-webpack-plugin')
const webpack = require('webpack')
const path = require('path')
// const WebpackBar = require('webpackbar')
const {
  cssStyleLoaders, sassStyleLoaders
} = require('./style-loaders')
const tsLoader = require('./ts-loader')
const { compilationInfo } = require('./compilation-info')

const relativePath = p => path.join(process.cwd(), p)
const getDefaultConfig = (srcFolder) => {
  const src = srcFolder || relativePath('src')
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
        'vue$': 'vue/dist/vue.esm.js',
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
          use: [
            'style-loader',
            ...cssStyleLoaders,
          ],
          include: /node_modules/,
        },
        {
          test: /\.css$/,
          oneOf: [
            {
              resourceQuery: /vue/,
              use: [
                'style-loader',
                ...cssStyleLoaders,
              ],
            },
            {
              use: [
                'to-string-loader',
                ...cssStyleLoaders,
              ],
            },
          ],
          include: [src],
        },
        {
          test: /\.scss$/,
          oneOf: [
            {
              resourceQuery: /vue/,
              use: [
                'style-loader',
                ...sassStyleLoaders,
              ],
            },
            {
              use: [
                'to-string-loader',
                ...sassStyleLoaders,
              ],
            },
          ],
          include: [src],
        },
        {
          test: /\.tsx?$/,
          use: [
            ...tsLoader,
          ],
          include: [
            src,
            relativePath('tests'),
          ],
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
      new webpack.DefinePlugin({
        webpackCompilationInfo: JSON.stringify(compilationInfo),
      }),
      // new WebpackBar(),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      // new HardSourcePlugin(),
    ],
    cache: {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      }
    }
  }
}

const commonMeta = require('../src/client/common.meta.json')

const year = new Date().getFullYear()
const getBanner = meta => `// ==UserScript==\n${Object.entries(Object.assign(meta, commonMeta)).map(([key, value]) => {
  if (Array.isArray(value)) {
    return value.map(item => `// @${key.padEnd(16, ' ')}${item}`).join('\n')
  }
  return `// @${key.padEnd(16, ' ')}${value.replace(/\[year\]/g, year)}`
}).join('\n')}
// ==/UserScript==
/* eslint-disable */ /* spell-checker: disable */
// @[ You can find all source codes in GitHub repo ]`

module.exports = {
  getDefaultConfig,
  getBanner,
}
