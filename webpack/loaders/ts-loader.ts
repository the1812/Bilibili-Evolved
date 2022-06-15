import { RuleSetUseItem } from 'webpack'
import { injectMetadata } from './inject-metadata'

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
    plugins: [
      ['@babel/plugin-proposal-class-properties'],
      // './webpack/loaders/inject-metadata.js',
      injectMetadata,
    ],
  },
}
// const esBuildLoader = {
//   loader: 'esbuild-loader',
//   options: {
//     target: 'esnext',
//     loader: 'ts',
//   },
// }
// const swcLoader = {
//   loader: 'swc-loader',
//   options: {
//     jsc: {
//       parser: {
//         syntax: 'typescript',
//         dynamicImport: true,
//       },
//     },
//   },
// }
// let tsLoader
// try {
//   require('swc-loader')
//   tsLoader = swcLoader
// } catch (e) {
//   tsLoader = babelLoader
// }

export const tsLoaders = [babelLoader]
