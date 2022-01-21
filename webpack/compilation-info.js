const process = require('child_process')
const commonMeta = require('../src/client/common.meta.json')

const commitHash = process
  .execSync('git rev-parse HEAD')
  .toString()
  .trim()
const branch = process
  .execSync('git rev-parse --abbrev-ref HEAD')
  .toString()
  .trim()
const nearestTag = process
  .execSync('git describe --abbrev=0 --tags --always')
  .toString()
  .trim()
const versionWithTag = process
  .execSync('git describe --tags --always')
  .toString()
  .trim()
const compilationInfo = {
  commitHash,
  branch,
  version: commonMeta.version,
  nearestTag,
  versionWithTag,
  // buildTime: Number(new Date()),
}
module.exports = {
  compilationInfo,
}
