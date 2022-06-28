import { runtimeInfo } from './runtime'

export const compilationInfo = {
  ...runtimeInfo,
  ...webpackGitInfo,
}
