import { RuleSetUseItem } from 'webpack'
import { injectMetadata } from '../inject-metadata'

const babelLoader: RuleSetUseItem = {
  loader: 'babel-loader',
  options: {
    presets: [
      '@babel/preset-env',
      [
        '@babel/preset-typescript',
        {
          allExtensions: true,
        },
      ],
    ],
    plugins: [['@babel/plugin-proposal-class-properties'], injectMetadata],
  },
}

export const tsLoaders = [babelLoader]
