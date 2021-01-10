const { declare } = require('@babel/helper-plugin-utils')

module.exports = declare(api => {
  api.assertVersion(7)

  return {
    name: 'syntax-top-level-return',

    manipulateOptions (opts, parserOpts) {
      parserOpts.allowReturnOutsideFunction = true
    },
  }
})