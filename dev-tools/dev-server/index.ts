import { startCoreWatcher } from './core-watcher'
import { startRegistryWatcher } from './registry-watcher'
import { startWebSocketServer } from './web-socket-server'

startRegistryWatcher().then(server => {
  startCoreWatcher()
  startWebSocketServer(server)
})
