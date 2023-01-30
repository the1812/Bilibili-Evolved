import exitHook from 'async-exit-hook'
import type { Server } from 'http'
import { createServer } from 'http'
import handler from 'serve-handler'
import type { Configuration } from 'webpack'

import { buildByEntry } from '../../registry/webpack/config'
import { devServerConfig } from './config'
import { parseRegistryUrl, startRegistryWatcher, watchers } from './registry-watcher'
import { exitWebSocketServer } from './web-socket-server'

export const startDevServer = () =>
  new Promise<Server>(resolve => {
    const { port } = devServerConfig

    const server = createServer((request, response) => {
      const { url } = request
      console.log('请求:', url)
      const callHandler = () => {
        handler(request, response, {
          public: '.',
          directoryListing: ['/dist', '/dist/**', '/registry/dist', '/registry/dist/**'],
        })
      }
      if (url.startsWith('/registry')) {
        const existingWatcher = watchers.find(w => w.url === url)
        const registryInfo = parseRegistryUrl(url)
        if (existingWatcher && registryInfo) {
          console.log(`已复用功能编译器: ${url}`)
        }
        if (existingWatcher || !registryInfo) {
          callHandler()
        } else {
          startRegistryWatcher(
            url,
            buildByEntry({
              ...registryInfo,
              mode: 'development',
            }) as Configuration,
          ).then(() => callHandler())
        }
      } else {
        callHandler()
      }
    })
    exitHook(exit => {
      exitWebSocketServer()
      server.close(error => {
        if (error) {
          console.error(error)
          exit()
          return
        }
        console.log('DevServer 已退出')
        exit()
      })
    })
    server.listen(port, () => {
      console.log(`DevServer 已启动, 端口: ${port}`)
      resolve(server)
    })
  })
