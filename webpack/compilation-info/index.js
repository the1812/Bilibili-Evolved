const commonMeta = require('../../src/client/common.meta.json')
const { altCdn } = require('../cdn')

const compilationInfo = {
  year: new Date().getFullYear(),
  version: commonMeta.version,
  altCdn,
  ...(typeof webpackGitInfo === 'object' ? webpackGitInfo : {}),
  // buildTime: Number(new Date()),
}
module.exports = {
  compilationInfo,
}
