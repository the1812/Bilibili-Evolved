import { CheckRule } from '../types'

export const generatedDocsRule: CheckRule = {
  name: 'generated-docs',
  check: ({ changedPaths }) => ({
    errors: changedPaths
      .filter(filePath => filePath.startsWith('doc/features/'))
      .map(
        filePath =>
          `${filePath}: generated feature docs must not be edited in ordinary pull requests.`,
      ),
  }),
}
