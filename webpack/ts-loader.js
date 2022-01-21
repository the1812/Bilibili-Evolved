const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    cacheCompression: false,
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
      './webpack/inject-metadata.js',
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

module.exports = [babelLoader]
