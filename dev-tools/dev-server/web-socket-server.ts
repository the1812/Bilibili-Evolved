import { Server } from 'http'
import { WebSocketServer } from 'ws'
import { devServerConfig } from './config'
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
export const startWebSocketServer = (httpServer: Server) => new Promise<void>((resolve, reject) => {
  const { port } = devServerConfig
  server = new WebSocketServer({ server: httpServer })
  server.on('close', () => sendMessage({ type: 'stop' }))
  server.on('listening', () => {
    console.log(`WebSocket server listening ${port}`)
    resolve()
  })
  server.on('error', () => reject())
})
