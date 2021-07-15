const process = require('child_process')

const commitHash = process
  .execSync('git rev-parse HEAD')
  .toString()
  .trim()
const branch = process
  .execSync('git rev-parse --abbrev-ref HEAD')
  .toString()
  .trim()
const compilationInfo = {
  commitHash,
  branch,
  buildTime: Number(new Date()),
}
module.exports = {
  compilationInfo,
}
