import process from 'child_process'

export const commitHash = process.execSync('git rev-parse HEAD').toString().trim()
export const branch = process.execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
export const nearestTag = process
  .execSync('git describe --abbrev=0 --tags --always')
  .toString()
  .trim()
export const versionWithTag = process.execSync('git describe --tags --always').toString().trim()
