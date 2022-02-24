import { startCoreWatcher } from './core-watcher'
import { startWebSocketServer } from './server'

startWebSocketServer().then(() => {
  startCoreWatcher()
})
