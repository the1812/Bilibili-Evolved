const process = require('child_process')

const commitHash = process
  .execSync('git rev-parse HEAD')
  .toString()
  .trim()
const branch = process
  .execSync('git rev-parse --abbrev-ref HEAD')
  .toString()
  .trim()
const nearestTag = process
  .execSync('git describe --abbrev=0 --tags')
  .toString()
  .trim()
const versionWithTag = process
  .execSync('git describe --tags')
  .toString()
  .trim()
const compilationInfo = {
  commitHash,
  branch,
  nearestTag,
  versionWithTag,
  // buildTime: Number(new Date()),
}
module.exports = {
  compilationInfo,
}
