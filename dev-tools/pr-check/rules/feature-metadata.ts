import { existsSync, readFileSync } from 'fs'
import * as path from 'path'
import {
  isRegistryFeatureIndex,
  parseFeatureMetadata,
  readComponentDisplayNames,
} from '../metadata'
import { CheckResult, CheckRule, FeatureMetadata } from '../types'

const hasIndexMarkdown = (indexPath: string) => {
  const directory = path.dirname(indexPath)
  return existsSync(path.join(directory, 'index.md'))
}

const isCamelCase = (name: string) => /^[a-z][a-zA-Z0-9]*$/.test(name)

const uiPluginDisplayNames = new Map([['vLoading', '加载提示']])

const checkPluginPrefixes = (
  file: string,
  { name, displayName }: FeatureMetadata,
  getComponentDisplayNames: () => Map<string, string>,
) => {
  const errors: string[] = []
  if (!name?.trim()) {
    errors.push(`${file}: plugin metadata name must be a non-empty static string.`)
  }
  if (!displayName?.trim()) {
    errors.push(`${file}: plugin metadata displayName must be a non-empty static string.`)
  }
  if (errors.length > 0) {
    return errors
  }

  const separator = name.indexOf('.')
  const componentName = separator > 0 ? name.slice(0, separator) : ''
  const componentDisplayName =
    uiPluginDisplayNames.get(componentName) ?? getComponentDisplayNames().get(componentName)
  if (!componentDisplayName) {
    return [
      `${file}: plugin metadata name "${name}" must start with an existing component's name or a registered UI plugin prefix, followed by ".".`,
    ]
  }
  const prefix = `${componentDisplayName} - `
  if (!displayName.startsWith(prefix) || !displayName.slice(prefix.length).trim()) {
    return [`${file}: plugin metadata displayName must start with "${prefix}" followed by a title.`]
  }
  return []
}

export const featureMetadataRule: CheckRule = {
  name: 'feature-metadata',
  check: ({ changedFiles, readBaseFile }) => {
    let componentDisplayNames: Map<string, string> | undefined
    const getComponentDisplayNames = () => (componentDisplayNames ??= readComponentDisplayNames())
    return changedFiles
      .filter(file => file.status !== 'D' && isRegistryFeatureIndex(file.path))
      .map((file): CheckResult => {
        const isPluginIndex = file.path.startsWith('registry/lib/plugins/')
        const metadata = parseFeatureMetadata(
          readFileSync(file.path, 'utf8'),
          isPluginIndex ? 'plugin' : 'component',
        )
        if (isPluginIndex && !metadata) {
          return { errors: [`${file.path}: could not read the plugin metadata object.`] }
        }
        if (!metadata) {
          return {}
        }

        const errors: string[] = []
        const isAdded = file.status.startsWith('A')

        const { kind, name, displayName } = metadata
        if (kind === 'component' && name && !isCamelCase(name)) {
          errors.push(`${file.path}: component metadata name must be camelCase.`)
        }
        if (isPluginIndex) {
          const previousPath = file.previousPath ?? file.path
          const previousMetadata =
            !isAdded && previousPath.startsWith('registry/lib/plugins/')
              ? parseFeatureMetadata(readBaseFile(previousPath), 'plugin')
              : undefined
          const nameChanged = previousMetadata?.kind !== 'plugin' || previousMetadata.name !== name
          if (nameChanged && name?.trim() && !name.split('.').every(isCamelCase)) {
            errors.push(`${file.path}: new plugin metadata names must use dot-separated camelCase.`)
          }
          if (
            nameChanged ||
            previousMetadata?.displayName !== displayName ||
            name === undefined ||
            displayName === undefined
          ) {
            errors.push(...checkPluginPrefixes(file.path, metadata, getComponentDisplayNames))
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
      )
  },
}
