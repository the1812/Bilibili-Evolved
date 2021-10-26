const webpack = require('webpack')
const previewConfig = require('./webpack.dev')

previewConfig.cache = { type: 'memory' }
if (webpack.version.match(/^5\./)) {
  throw new Error("Measure plugins doesn't support webpack 5")
} else {
  const Visualizer = require('webpack-visualizer-plugin')
  previewConfig.plugins.push(new Visualizer())

  const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
  const smp = new SpeedMeasurePlugin()
  module.exports = smp.wrap(previewConfig)
}
