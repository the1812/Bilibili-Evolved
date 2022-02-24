import { createServer } from 'http'
import { Watching } from 'webpack'
import * as webpack from 'webpack'
import handler from 'serve-handler'
import { devServerConfig } from './config'
import { buildByEntry } from '../../registry/webpack/config'

export const startRegistryWatcher = () => {
  const { maxWatchers, port } = devServerConfig
  const watchers: Record<string, Watching> = {}

  const createWatcher = (url: string): Promise<void> => {
    const watcher = webpack(buildByEntry())
  }

  const server = createServer((request, response) => {
    const { url } = request
    if (url.startsWith('/core/')) {
      handler(request, response, {
        public: './dist/',
      })
    }
    if (url.startsWith('/registry/')) {
      const existingWatcher = watchers[url]
      const registryRoot = './registry/dist/'
      if (existingWatcher) {
        handler(request, response, {
          public: registryRoot,
        })
      }
      createWatcher(url).then(
        () => handler(request, response, {
          public: registryRoot,
        }),
      )
    }
  })
  process.on('beforeExit', () => {
    server.close(error => {
      if (error) {
        console.error(error)
        return
      }
      console.log('Registry watcher stopped')
    })
  })
  server.listen(port, () => {
    console.log('Registry watcher started')
  })
}
