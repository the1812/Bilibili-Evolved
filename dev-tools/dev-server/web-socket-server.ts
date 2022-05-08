import exitHook from 'async-exit-hook'
import { Server } from 'http'
import { WebSocketServer } from 'ws'
import { Payload } from './payload'

let server: WebSocketServer

export const sendMessage = (message: Payload) => {
  if (!server) {
    return
  }
  const text = JSON.stringify(message)
  server.clients.forEach(client => {
    client.send(text)
  })
}
export const exitWebSocketServer = () => {
  if (!server) {
    return
  }
  sendMessage({ type: 'stop' })
  server.clients.forEach(c => c.close())
}
export const startWebSocketServer = (httpServer: Server) => new Promise<void>(resolve => {
  server = new WebSocketServer({ server: httpServer })
  server.on('connection', () => {
    sendMessage({ type: 'start' })
  })
  server.on('error', error => console.error(error))
  exitHook(exit => server.close(error => {
    if (error) {
      console.error(error)
    }
    exit()
  }))
  resolve()
})
