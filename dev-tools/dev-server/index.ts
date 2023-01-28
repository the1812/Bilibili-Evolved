import { startCoreWatcher } from './core-watcher'
import { startDevServer } from './server'
import { startWebSocketServer } from './web-socket-server'

startDevServer().then(server => {
  startCoreWatcher()
  startWebSocketServer(server)
})
