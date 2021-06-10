const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const { getDefaultConfig } = require('./webpack.config')

const testConfig = Object.assign(getDefaultConfig(), {
  entry: './tests/index.ts',
  output: {
    path: path.resolve(process.cwd(), 'dev'),
    filename: 'tests.js',
  },
  externals: {
    chai: 'chai',
  },
})
testConfig.plugins.push(new HtmlWebpackPlugin({
  cache: true,
  title: 'Mocha Test',
  filename: 'tests.html',
  template: './tests/index.html',
}))
module.exports = testConfig
