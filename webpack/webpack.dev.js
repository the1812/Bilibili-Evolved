const webpack = require('webpack')
const { getBanner, getDefaultConfig } = require('./webpack.config')
const previewMeta = require('../src/client/bilibili-evolved.preview.meta.json')

const previewConfig = Object.assign(getDefaultConfig(), {
  entry: './src/client/bilibili-evolved.ts',
  output: {
    filename: 'bilibili-evolved.dev.user.js',
  },
})
previewConfig.plugins.push(
  new webpack.BannerPlugin({
    banner: getBanner(previewMeta),
    raw: true,
    entryOnly: true,
  }),
)
module.exports = previewConfig
