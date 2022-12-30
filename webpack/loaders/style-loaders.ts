import postcssPresetEnv from 'postcss-preset-env'
import autoPrefixer from 'autoprefixer'
import { RuleSetUseItem } from 'webpack'

export const cssLoader: RuleSetUseItem = {
  loader: 'css-loader',
  options: {
    esModule: false,
  },
}
export const postCssLoader: RuleSetUseItem = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [postcssPresetEnv(), autoPrefixer()],
    },
  },
}
export const sassLoader: RuleSetUseItem = {
  loader: 'fast-sass-loader',
  options: {
    includePaths: ['src/ui/'],
  },
}

export const cssStyleLoaders = [cssLoader, postCssLoader]
export const sassStyleLoaders = [cssLoader, postCssLoader, sassLoader]
