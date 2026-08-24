import { CheckRule } from '../types'

export const buildOutputsRule: CheckRule = {
  name: 'build-outputs',
  check: ({ changedPaths }) => ({
    errors: changedPaths
      .filter(filePath => filePath.startsWith('dist/') || filePath.startsWith('registry/dist/'))
      .map(filePath => `${filePath}: build outputs must not be submitted in pull requests.`),
  }),
}
