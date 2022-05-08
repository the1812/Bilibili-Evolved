import { startDevServer } from './server'
import { startCoreWatcher } from './core-watcher'
import { startWebSocketServer } from './web-socket-server'

startDevServer().then(server => {
  startCoreWatcher()
  startWebSocketServer(server)
})
