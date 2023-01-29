declare global {
  interface GitInfo {
    commitHash: string
    branch: string
    nearestTag: string
    versionWithTag: string
  }
  const webpackGitInfo: GitInfo
}

export {}
