const webpack = require('webpack')
const { getBanner, getDefaultConfig } = require('./webpack.config')

const mainMeta = require('../src/client/bilibili-evolved.meta.json')

const mainConfig = Object.assign(getDefaultConfig(), {
  mode: 'production',
  entry: './src/client/bilibili-evolved.ts',
  output: {
    filename: 'bilibili-evolved.user.js',
  },
})
mainConfig.plugins.push(
  new webpack.BannerPlugin({
    banner: getBanner(mainMeta),
    raw: true,
    entryOnly: true,
  }),
)
const previewConfig = require('./webpack.dev')

previewConfig.output.filename = 'bilibili-evolved.preview.user.js'
previewConfig.mode = 'production'
const packageConfig = Object.assign(getDefaultConfig(), {
  mode: 'production',
  entry: './src/components/package.ts',
  output: {
    filename: 'package.js',
    library: 'bilibiliEvolvedUpdate',
    libraryTarget: 'window',
  },
})
const targets = [mainConfig, previewConfig, packageConfig].map(config => {
  config.cache = { type: 'memory' }
  config.devtool = false
  return config
})
module.exports = targets
