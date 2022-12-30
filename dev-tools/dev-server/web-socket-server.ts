import exitHook from 'async-exit-hook'
import { Server } from 'http'
import { WebSocketServer } from 'ws'
import { Payload } from './payload'
import { stopInstance, watchers } from './registry-watcher'

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
export const startWebSocketServer = (httpServer: Server) =>
  new Promise<void>(resolve => {
    server = new WebSocketServer({ server: httpServer })
    server.on('connection', client => {
      sendMessage({ type: 'start', sessions: watchers.map(it => it.url) })
      client.on('message', data => {
        try {
          const payload: Payload = JSON.parse(data.toString())
          console.log('收到 DevClient 消息:', payload)
          switch (payload.type) {
            default: {
              break
            }
            case 'itemStop': {
              const { path } = payload
              const watcherIndex = watchers.findIndex(it => it.url === path)
              if (watcherIndex !== -1) {
                const [watcher] = watchers.splice(watcherIndex, 1)
                stopInstance(watcher.instance, () => {
                  console.log(`功能编译器已退出: ${watcher.url}`)
                })
              }
              break
            }
            case 'querySessions': {
              sendMessage({ type: 'querySessionsResponse', sessions: watchers.map(it => it.url) })
              break
            }
          }
        } catch (error) {
          console.error('无效信息', data)
        }
      })
    })
    server.on('error', error => console.error(error))
    exitHook(exit =>
      server.close(error => {
        if (error) {
          console.error(error)
        }
        exit()
      }),
    )
    resolve()
  })
