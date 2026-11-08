import type { ComponentMetadata } from '@/components/types'
import type { PluginMetadata } from '@/plugins/plugin'
import { monkey } from './ajax'

type DevFeature =
  | { kind: 'component'; path: string; metadata: ComponentMetadata }
  | { kind: 'plugin'; path: string; metadata: PluginMetadata }

const pathPattern = /^\/registry\/dist\/(components|plugins)\/.+\.js$/
const storageKey = 'bilibiliEvolved.devFeatures'
export const getDevFeaturePaths = (): string[] =>
  JSON.parse(sessionStorage.getItem(storageKey) ?? '[]')
export const setDevFeaturePaths = (paths: string[]) => {
  if (paths.length > 0) {
    sessionStorage.setItem(storageKey, JSON.stringify(paths))
  } else {
    sessionStorage.removeItem(storageKey)
  }
}

export const loadDevFeature = async (port: number, path: string): Promise<DevFeature> => {
  const match = pathPattern.exec(path)
  if (!match) {
    throw new Error(`无效的调试路径: ${path}`)
  }
  const url = `http://localhost:${port}${path}`
  const { loadFeatureCode } = await import('./external-input')
  const metadata = loadFeatureCode(await monkey<string>({ url })) as ComponentMetadata &
    PluginMetadata
  if (match[1] === 'components' && metadata?.name && typeof metadata.entry === 'function') {
    const { isBuiltInComponent } = await import('@/components/built-in-components')
    if (!isBuiltInComponent(metadata.name)) {
      return { kind: 'component', path, metadata }
    }
  }
  if (match[1] === 'plugins' && metadata?.name && typeof metadata.setup === 'function') {
    const { pluginsMap } = await import('@/plugins/plugin')
    if (!pluginsMap[metadata.name]) {
      return { kind: 'plugin', path, metadata }
    }
  }
  throw new Error(`无效的调试功能: ${path}`)
}

const getListeningPaths = (port: number) =>
  new Promise<string[]>(resolve => {
    const socket = new WebSocket(`ws://localhost:${port}`)
    let timeout: ReturnType<typeof setTimeout>
    const finish = (paths: string[]) => {
      clearTimeout(timeout)
      socket.close()
      resolve(paths)
    }
    timeout = setTimeout(() => finish([]), 1000)
    socket.addEventListener('error', () => finish([]), { once: true })
    socket.addEventListener('close', () => finish([]), { once: true })
    socket.addEventListener(
      'message',
      event => {
        const { featureSessions } = JSON.parse(event.data) as { featureSessions: string[] }
        finish(featureSessions)
      },
      { once: true },
    )
  })

const loadedFeatures: DevFeature[] = []
export const getLoadedDevPath = (kind: DevFeature['kind'], name: string) =>
  loadedFeatures.find(feature => feature.kind === kind && feature.metadata.name === name)?.path

export const loadDevFeatures = lodash.once(async () => {
  const { registerTemporaryComponentSettings, settings } = await import('./settings')
  const { isIframe } = await import('./utils')
  const devClient = settings.userComponents.devClient?.settings
  if (!devClient?.enabled || isIframe()) {
    return loadedFeatures
  }
  const port = devClient.options.port as number
  const savedPaths = getDevFeaturePaths()
  if (savedPaths.length === 0) {
    return loadedFeatures
  }
  const listeningPaths = await getListeningPaths(port)
  const paths = savedPaths.filter(path => listeningPaths.includes(path))
  setDevFeaturePaths(paths)
  const features = await Promise.allSettled(paths.map(path => loadDevFeature(port, path)))
  features.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.kind === 'component') {
        registerTemporaryComponentSettings(result.value.metadata)
      }
      loadedFeatures.push(result.value)
    } else {
      console.error('加载调试功能失败', paths[index], result.reason)
    }
  })
  return loadedFeatures
})
