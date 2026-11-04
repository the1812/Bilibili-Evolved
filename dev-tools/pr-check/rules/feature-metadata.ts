import { existsSync, readFileSync } from 'fs'
import * as path from 'path'
import { isRegistryFeatureIndex, parseFeatureMetadata } from '../metadata'
import { CheckResult, CheckRule } from '../types'

const hasIndexMarkdown = (indexPath: string) => {
  const directory = path.dirname(indexPath)
  return existsSync(path.join(directory, 'index.md'))
}

const isCamelCase = (name: string) => /^[a-z][a-zA-Z0-9]*$/.test(name)

export const featureMetadataRule: CheckRule = {
  name: 'feature-metadata',
  check: ({ changedFiles, readBaseFile }) =>
    changedFiles
      .filter(file => file.status !== 'D' && isRegistryFeatureIndex(file.path))
      .map((file): CheckResult => {
        const metadata = parseFeatureMetadata(readFileSync(file.path, 'utf8'))
        if (!metadata) {
          return {}
        }

        const errors: string[] = []
        const isAdded = file.status.startsWith('A')

        const { kind, name } = metadata
        if (kind === 'component' && name && !isCamelCase(name)) {
          errors.push(`${file.path}: component metadata name must be camelCase.`)
        }
        if (kind === 'plugin' && name !== undefined && !name.split('.').every(isCamelCase)) {
          const previousPath = file.previousPath ?? file.path
          const previousMetadata =
            !isAdded && isRegistryFeatureIndex(previousPath)
              ? parseFeatureMetadata(readBaseFile(previousPath))
              : undefined
          if (previousMetadata?.kind !== 'plugin' || previousMetadata.name !== name) {
            errors.push(`${file.path}: new plugin metadata names must use dot-separated camelCase.`)
          }
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
          errors.push(`${file.path}: new components and plugins must include author metadata.`)
        }

        return { errors }
      })
      .reduce<CheckResult>(
        (result, current) => ({
          errors: [...(result.errors || []), ...(current.errors || [])],
        }),
        {},
      ),
}
