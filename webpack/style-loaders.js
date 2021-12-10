const postcssPresetEnv = require('postcss-preset-env')
const autoPrefixer = require('autoprefixer')
// const sass = require('sass')

const cssLoader = {
  loader: 'css-loader',
  options: {
    esModule: false,
  },
}
const postCssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [
        postcssPresetEnv(),
        autoPrefixer(),
      ],
    },
  },
}
const sassLoader = {
  loader: 'fast-sass-loader',
  options: {
    // implementation: sass,
    // sassOptions: {
      includePaths: ['src/ui/'],
    // }
  },
}

module.exports = {
  cssLoader,
  postCssLoader,
  sassLoader,
  cssStyleLoaders: [ cssLoader, postCssLoader ],
  sassStyleLoaders: [ cssLoader, postCssLoader, sassLoader ],
}
