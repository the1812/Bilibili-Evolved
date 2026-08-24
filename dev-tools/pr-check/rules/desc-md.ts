import * as path from 'path'
import { CheckRule } from '../types'

export const descMarkdownRule: CheckRule = {
  name: 'desc-md',
  check: ({ changedFiles }) => ({
    errors: changedFiles
      .filter(file => file.status.startsWith('A') && path.basename(file.path) === 'desc.md')
      .map(file => `${file.path}: use index.md for component or plugin descriptions.`),
  }),
}
