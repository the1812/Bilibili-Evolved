import { Watching, Configuration, Stats, webpack } from 'webpack'
import exitHook from 'async-exit-hook'
import { fromId } from '../../registry/lib/id'
import { buildByEntry } from '../../registry/webpack/config'
import { defaultWatcherHandler } from './watcher-common'
import { broadcastMessage } from './web-socket-server'
import { devServerConfig } from './config'
import { FeatureKind } from './payload'

export interface RegistryFeature {
  kind: FeatureKind
  id: string
  src: string
  entry: string
  path: string
}

export const featureSessions: {
  feature: RegistryFeature
  path: string
  watcher: Watching
}[] = []

export const getFeatureSessionPaths = () => featureSessions.map(it => it.path)

const normalizeId = (id: string) => id.replace(/\\/g, '/').replace(/^\/+/, '')

export const getRegistryFeature = (kind: FeatureKind, id: string): RegistryFeature => {
  const normalizedId = normalizeId(id)
  const src = `./registry/lib/${kind}s/`
  return {
    kind,
    id: normalizedId,
    src,
    entry: fromId(src, normalizedId),
    path: `/registry/dist/${kind}s/${normalizedId}.js`,
  }
}

const getBuildConfig = (feature: RegistryFeature, mode: Configuration['mode'] = 'development') =>
  buildByEntry({
    src: feature.src,
    type: feature.kind,
    entry: feature.entry,
    mode,
  }) as Configuration

const notifyFeatureSessionsChanged = () => {
  broadcastMessage({
    type: 'featureSessionsChanged',
    featureSessions: getFeatureSessionPaths(),
  })
}

export const parseRegistryUrl = (url: string) => {
  const { pathname } = new URL(url, 'http://localhost')
  const regex = new RegExp('/registry/dist/(component|plugin)s/(.+)\\.js$')
  const match = pathname.match(regex)
  if (!match) {
    return null
  }
  const [, kind, id] = match as [string, FeatureKind, string]
  return getRegistryFeature(kind, id)
}

export const stopInstance = (instance: Watching, onClose: () => void) => {
  if (instance.closed) {
    onClose()
    return
  }
  instance.close(() => {
    onClose()
  })
}

export const startFeatureSessionWatcher = (
  feature: RegistryFeature,
  config = getBuildConfig(feature),
) =>
  new Promise<void>(resolve => {
    const { path } = feature
    const existingSession = featureSessions.find(s => s.path === path)
    if (existingSession) {
      console.log(`已复用功能编译器: ${path}`)
      resolve()
      return
    }
    console.log(`功能编译中... ${path}`)
    const { maxWatchers } = devServerConfig
    const watcher = webpack(config)
    const watcherInstance = watcher.watch(
      {},
      defaultWatcherHandler(
        () => {
          resolve()
        },
        result => {
          console.log('功能已编译:', result.hash, path)
          broadcastMessage({
            type: 'itemUpdate',
            path,
            featureSessions: getFeatureSessionPaths(),
          })
          broadcastMessage({
            type: 'featureBuilt',
            kind: feature.kind,
            id: feature.id,
            path,
            hash: result.hash,
            featureSessions: getFeatureSessionPaths(),
          })
        },
      ),
    )
    exitHook(exit => {
      if (!watcherInstance.closed) {
        watcherInstance.close(() => {
          console.log(`功能编译器已退出: ${path}`)
          exit()
        })
      }
    })
    if (featureSessions.length >= maxWatchers) {
      const oldSession = featureSessions.shift()
      stopInstance(oldSession.watcher, () => {
        console.log(
          `已达到 maxWatchers 数量 (${maxWatchers}), 退出了功能编译器: ${oldSession.path}`,
        )
        notifyFeatureSessionsChanged()
      })
    }
    featureSessions.push({ feature, path, watcher: watcherInstance })
    notifyFeatureSessionsChanged()
  })

export const startFeatureSession = (kind: FeatureKind, id: string) =>
  startFeatureSessionWatcher(getRegistryFeature(kind, id))

export const startFeatureSessionFromUrl = (url: string) => {
  const feature = parseRegistryUrl(url)
  if (!feature) {
    return null
  }
  return startFeatureSessionWatcher(feature)
}

export const stopFeatureSessionByPath = (path: string) =>
  new Promise<boolean>(resolve => {
    const sessionIndex = featureSessions.findIndex(it => it.path === path)
    if (sessionIndex === -1) {
      resolve(false)
      return
    }
    const [session] = featureSessions.splice(sessionIndex, 1)
    stopInstance(session.watcher, () => {
      console.log(`功能编译器已退出: ${session.path}`)
      notifyFeatureSessionsChanged()
      resolve(true)
    })
  })

export const stopFeatureSession = (kind: FeatureKind, id: string) =>
  stopFeatureSessionByPath(getRegistryFeature(kind, id).path)

export const buildFeature = (
  kind: FeatureKind,
  id: string,
  mode: Configuration['mode'] = 'development',
) =>
  new Promise<Stats>((resolve, reject) => {
    const feature = getRegistryFeature(kind, id)
    const compiler = webpack(getBuildConfig(feature, mode))
    console.log(`功能单次编译中... ${feature.path}`)
    compiler.run((error, result) => {
      compiler.close(closeError => {
        const finalError = error || closeError
        if (finalError) {
          broadcastMessage({
            type: 'featureBuildFailed',
            kind,
            id: feature.id,
            message: finalError.message,
          })
          reject(finalError)
          return
        }
        if (!result) {
          reject(new Error('Webpack 未返回编译结果'))
          return
        }
        if (result.hasErrors()) {
          const message = result.toString({
            hash: false,
            assets: false,
            modules: false,
            chunks: false,
            colors: true,
          })
          broadcastMessage({
            type: 'featureBuildFailed',
            kind,
            id: feature.id,
            message,
          })
          reject(new Error(message))
          return
        }
        console.log('功能单次编译完成:', result.hash, feature.path)
        broadcastMessage({
          type: 'featureBuilt',
          kind,
          id: feature.id,
          path: feature.path,
          hash: result.hash,
          featureSessions: getFeatureSessionPaths(),
        })
        resolve(result)
      })
    })
  })
