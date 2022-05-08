import { createServer, Server } from 'http'
import webpack, { Watching, Configuration } from 'webpack'
import exitHook from 'async-exit-hook'
import handler from 'serve-handler'
import { devServerConfig } from './config'
import { buildByEntry } from '../../registry/webpack/config'
import { fromId } from '../../registry/webpack/id'
import { defaultWatcherHandler } from './watcher-common'
import { sendMessage } from './web-socket-server'

export const startRegistryWatcher = () => new Promise<Server>(resolve => {
  const { maxWatchers, port } = devServerConfig
  const watchers: { url: string; instance: Watching }[] = []
  const parseRegistryUrl = (url: string) => {
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

  const createWatcher = (url: string, config: Configuration) => new Promise<void>(
    resolveWatcher => {
      const watcher = webpack(config)
      const instance = watcher.watch({}, defaultWatcherHandler(
        () => {
          console.log(`Registry watcher started, url = ${url}`)
          resolveWatcher()
        },
        result => {
          console.log('itemUpdate', result.hash, url)
          sendMessage({
            type: 'itemUpdate',
            path: url,
          })
        },
      ))
      exitHook(exit => {
        if (!instance.closed) {
          instance.close(() => {
            console.log(`Registry watcher stopped, url = ${url}`)
            exit()
          })
        }
      })
      if (watchers.length >= maxWatchers) {
        const oldInstance = watchers.shift()
        if (!oldInstance.instance.closed) {
          oldInstance.instance.close(() => {
            console.log(`Registry watcher stopped, url = ${oldInstance.url}`)
          })
        }
      }
      watchers.push({ url, instance })
    },
  )

  const server = createServer((request, response) => {
    const { url } = request
    const callHandler = () => {
      handler(request, response, {
        public: '.',
        directoryListing: [
          '/dist',
          '/dist/**',
          '/registry/dist',
          '/registry/dist/**',
        ],
      })
    }
    if (url.startsWith('/registry')) {
      const existingWatcher = watchers.find(w => w.url === url)
      const registryInfo = parseRegistryUrl(url)
      console.log('existingWatcher', Boolean(existingWatcher))
      console.log('registryInfo', registryInfo)
      if (existingWatcher || !registryInfo) {
        callHandler()
      } else {
        createWatcher(url, buildByEntry(registryInfo) as Configuration).then(
          () => callHandler(),
        )
      }
    } else {
      callHandler()
    }
  })
  exitHook(exit => {
    server.close(error => {
      if (error) {
        console.error(error)
        exit()
        return
      }
      console.log('Registry server stopped')
      exit()
    })
  })
  server.listen(port, () => {
    console.log(`Registry server listening at ${port}`)
    resolve(server)
  })
})
