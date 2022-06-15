import postcssPresetEnv from 'postcss-preset-env'
import autoPrefixer from 'autoprefixer'

export const cssLoader = {
  loader: 'css-loader',
  options: {
    esModule: false,
  },
}
export const postCssLoader = {
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
export const sassLoader = {
  loader: 'fast-sass-loader',
  options: {
    // implementation: sass,
    // sassOptions: {
      includePaths: ['src/ui/'],
    // }
  },
}

export const cssStyleLoaders = [ cssLoader, postCssLoader ]
export const sassStyleLoaders = [ cssLoader, postCssLoader, sassLoader ]
