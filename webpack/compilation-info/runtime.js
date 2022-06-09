const commonMeta = require('../../src/client/common.meta.json')
const { altCdn } = require('../cdn')

module.exports = {
  year: new Date().getFullYear(),
  version: commonMeta.version,
  altCdn,
}
