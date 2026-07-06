import { existsSync } from 'fs'
import * as path from 'path'
import { getFeatureMetadata, isRegistryFeatureIndex } from '../metadata'
import { CheckResult, CheckRule } from '../types'

const hasIndexMarkdown = (indexPath: string) => {
  const directory = path.dirname(indexPath)
  return existsSync(path.join(directory, 'index.md'))
}

const isCamelCase = (name: string) => /^[a-z][a-zA-Z0-9]*$/.test(name)

export const featureMetadataRule: CheckRule = {
  name: 'feature-metadata',
  check: ({ changedFiles }) =>
    changedFiles
      .filter(file => isRegistryFeatureIndex(file.path))
      .map((file): CheckResult => {
        const metadata = getFeatureMetadata(file.path)
        if (!metadata) {
          return {}
        }

        const errors: string[] = []
        const warnings: string[] = []
        const isAdded = file.status.startsWith('A')

        if (metadata.name && !isCamelCase(metadata.name)) {
          errors.push(`${file.path}: ${metadata.kind} metadata name must be camelCase.`)
        }

        if (metadata.properties.has('description')) {
          errors.push(`${file.path}: do not hand-write metadata description; use index.md instead.`)
        }

        const hasReload = metadata.properties.has('reload')
        const hasUnload = metadata.properties.has('unload')
        if (hasReload !== hasUnload) {
          errors.push(`${file.path}: metadata reload and unload must be defined together.`)
        }

        if (isAdded && !hasIndexMarkdown(file.path)) {
          errors.push(
            `${file.path}: new components and plugins must include an index.md description file.`,
          )
        }
        if (isAdded && !metadata.properties.has('author')) {
          warnings.push(`${file.path}: new components and plugins should include author metadata.`)
        }

        return { errors, warnings }
      })
      .reduce<CheckResult>(
        (result, current) => ({
          errors: [...(result.errors || []), ...(current.errors || [])],
          warnings: [...(result.warnings || []), ...(current.warnings || [])],
        }),
        {},
      ),
}
