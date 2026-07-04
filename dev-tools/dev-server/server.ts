import { createServer, Server } from 'http'
import exitHook from 'async-exit-hook'
import handler from 'serve-handler'
import { devServerConfig } from './config'
import { exitWebSocketServer } from './web-socket-server'
import {
  featureSessions,
  parseRegistryUrl,
  readRegistryOutput,
  startFeatureSessionWatcher,
} from './registry-watcher'

export const startDevServer = () =>
  new Promise<Server>(resolve => {
    const { port } = devServerConfig

    const server = createServer((request, response) => {
      const { url } = request
      console.log('请求:', url)
      const serveStatic = () => {
        handler(request, response, {
          public: '.',
          directoryListing: ['/dist', '/dist/**'],
        })
      }
      const serveNotFound = () => {
        response.statusCode = 404
        response.end('Not found')
      }
      const serveRegistryOutput = (path: string, notFound = false) => {
        const output = readRegistryOutput(path)
        if (!output) {
          if (notFound) {
            serveNotFound()
          }
          return false
        }
        response.setHeader('Content-Type', 'application/javascript; charset=utf-8')
        response.end(output)
        return true
      }
      if (url.startsWith('/registry')) {
        const feature = parseRegistryUrl(url)
        const existingSession = feature && featureSessions.find(s => s.path === feature.path)
        if (existingSession && feature) {
          console.log(`已复用功能编译器: ${url}`)
        }
        if (!feature) {
          serveNotFound()
        } else if (!serveRegistryOutput(feature.path)) {
          startFeatureSessionWatcher(feature).then(() => serveRegistryOutput(feature.path, true))
        }
      } else {
        serveStatic()
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
