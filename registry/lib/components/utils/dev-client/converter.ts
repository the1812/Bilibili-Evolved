import { getLoadedDevPath } from '@/core/dev-features'
import type { RegistryFeatureType } from '@/core/feature-types'
import { autoUpdateOptions } from './options'

export const getFeatureDevPath = (kind: RegistryFeatureType, name: string) => {
  const activePath = getLoadedDevPath(kind, name)
  if (activePath) {
    return activePath
  }
  const directory = kind === 'component' ? 'components' : 'plugins'
  const source = autoUpdateOptions.urls[directory][name]?.source
  if (!source) {
    return undefined
  }
  const path = source.kind === 'github' ? `/${source.path}` : source.url
  const registryPath = path.match(/\/registry\/dist\/(components|plugins)\/[^?#]+\.js(?=$|[?#])/)
  if (registryPath?.[1] === directory) {
    return registryPath[0]
  }
  const legacyPath = /^http:\/\/localhost:\d+(\/(components|plugins)\/[^?#]+\.js)(?=$|[?#])/.exec(
    path,
  )
  return legacyPath?.[2] === directory ? `/registry/dist${legacyPath[1]}` : undefined
}
