import { getLoadedDevPath } from '@/core/dev-features'
import { autoUpdateOptions } from './options'

export const getComponentDevPath = (name: string) => {
  const activePath = getLoadedDevPath('component', name)
  if (activePath) {
    return activePath
  }
  const source = autoUpdateOptions.urls.components[name]?.source
  if (!source) {
    return undefined
  }
  const path = source.kind === 'github' ? `/${source.path}` : source.url
  const registryPath = path.match(/\/registry\/dist\/components\/[^?#]+\.js(?=$|[?#])/)
  if (registryPath) {
    return registryPath[0]
  }
  const legacyPath = /^http:\/\/localhost:\d+(\/components\/[^?#]+\.js)(?=$|[?#])/.exec(path)
  return legacyPath && `/registry/dist${legacyPath[1]}`
}
