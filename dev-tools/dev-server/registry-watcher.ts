import { createServer, Server } from 'http'
import webpack, { Watching, Configuration } from 'webpack'
import exitHook from 'async-exit-hook'
import handler from 'serve-handler'
import path from 'path'
import { devServerConfig } from './config'
import { buildByEntry } from '../../registry/webpack/config'
import { fromId } from '../../registry/webpack/id'
import { defaultWatcherHandler } from './watcher-common'
import { sendMessage } from './web-socket-server'

export const startRegistryWatcher = () => new Promise<Server>(resolve => {
  const { maxWatchers, port } = devServerConfig
  const watchers: { url: string; instance: Watching }[] = []
  const parseRegistryUrl = (url: string) => {
    /* example: http://localhost:2333/registry/components/style/auto-hide-sidebar.js
    -> src: ./registry/lib/components/
    -> type: component
    -> entry: ./registry/lib/components/style/auto-hide-sidebar/index.ts
    */
    const regex = new RegExp('http://[^/]+/registry/(.+)s/(.+)\\.js')
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

  const createWatcher = async (url: string, config: Configuration) => {
    const watcher = webpack(config)
    const instance = watcher.watch({}, defaultWatcherHandler(
      () => console.log(`Registry watcher started, url = ${url}`),
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
  }

  const server = createServer((request, response) => {
    const { url } = request
    if (url.startsWith('/core')) {
      request.url = url.replace(/^\/core/, '')
      console.log('request from', request.url)
      handler(request, response, {
        public: path.resolve('./dist/'),
      })
    }
    if (url.startsWith('/registry')) {
      request.url = url.replace(/^\/registry/, '')
      const existingWatcher = watchers[url]
      const registryInfo = parseRegistryUrl(url)
      const registryRoot = path.resolve('./registry/dist/')
      if (existingWatcher || !registryInfo) {
        handler(request, response, {
          public: registryRoot,
        })
      } else {
        createWatcher(url, buildByEntry(registryInfo) as Configuration).then(
          () => handler(request, response, {
            public: registryRoot,
          }),
        )
      }
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
