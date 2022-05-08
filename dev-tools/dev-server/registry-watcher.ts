import { Watching, Configuration, webpack } from 'webpack'
import exitHook from 'async-exit-hook'
import { fromId } from '../../registry/webpack/id'
import { defaultWatcherHandler } from './watcher-common'
import { sendMessage } from './web-socket-server'
import { devServerConfig } from './config'

export const watchers: { url: string; instance: Watching }[] = []
export const parseRegistryUrl = (url: string) => {
  /* example: http://localhost:2333/registry/dist/components/feeds/copy-link.js
  -> src: ./registry/lib/components/
  -> type: component
  -> entry: ./registry/lib/components/feeds/copy-link/index.ts
  */
  const regex = new RegExp('/registry/dist/([^/]+)s/(.+)\\.js')
  const match = url.match(regex)
  if (!match) {
    return null
  }
  const [, type, id] = match
  const src = `./registry/lib/${type}s/`
  return {
    src,
    type,
    entry: fromId(src, id),
  }
}

export const startRegistryWatcher = (url: string, config: Configuration) => new Promise<void>(
  resolve => {
    console.log(`功能编译中... ${url}`)
    const { maxWatchers } = devServerConfig
    const watcher = webpack(config)
    const instance = watcher.watch({}, defaultWatcherHandler(
      () => {
        resolve()
      },
      result => {
        console.log('功能已编译:', result.hash, url)
        sendMessage({
          type: 'itemUpdate',
          path: url,
        })
      },
    ))
    exitHook(exit => {
      if (!instance.closed) {
        instance.close(() => {
          console.log(`功能编译器已退出: ${url}`)
          exit()
        })
      }
    })
    if (watchers.length >= maxWatchers) {
      const oldInstance = watchers.shift()
      if (!oldInstance.instance.closed) {
        oldInstance.instance.close(() => {
          console.log(`已达到 maxWatchers 数量 (${maxWatchers}), 退出了功能编译器: ${oldInstance.url}`)
        })
      }
    }
    watchers.push({ url, instance })
  },
)
