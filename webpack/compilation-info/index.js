const runtimeInfo = require('./runtime')

const compilationInfo = {
  ...runtimeInfo,
  ...webpackGitInfo,
}
module.exports = {
  compilationInfo,
}
