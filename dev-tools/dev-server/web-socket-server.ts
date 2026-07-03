import exitHook from 'async-exit-hook'
import { Server } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import { Payload } from './payload'
import {
  buildFeature,
  getFeatureSessionPaths,
  startFeatureSession,
  stopFeatureSession,
  stopFeatureSessionByPath,
} from './registry-watcher'
import { createFeature } from './scaffold'

let server: WebSocketServer

export const broadcastMessage = (message: Payload) => {
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
  broadcastMessage({ type: 'serverStop' })
  server.clients.forEach(c => c.close())
}
const sendMessage = (client: WebSocket, payload: Payload) => {
  client.send(JSON.stringify(payload))
}

const sendCommandResult = (
  client: WebSocket,
  payload: { requestId?: string },
  result: Omit<Extract<Payload, { type: 'commandResult' }>, 'type' | 'requestId'>,
) => {
  sendMessage(client, {
    type: 'commandResult',
    requestId: payload.requestId,
    featureSessions: getFeatureSessionPaths(),
    ...result,
  })
}

export const startWebSocketServer = (httpServer: Server) =>
  new Promise<void>(resolve => {
    server = new WebSocketServer({ server: httpServer })
    server.on('connection', client => {
      sendMessage(client, { type: 'serverReady', featureSessions: getFeatureSessionPaths() })
      client.on('message', async data => {
        let payload: Payload | undefined
        try {
          payload = JSON.parse(data.toString())
          console.log('收到 DevClient 消息:', payload)
          switch (payload.type) {
            default: {
              break
            }
            case 'startFeatureSession': {
              await startFeatureSession(payload.kind, payload.id)
              sendCommandResult(client, payload, {
                ok: true,
                message: `功能调试已启动: ${payload.kind}/${payload.id}`,
              })
              break
            }
            case 'stopFeatureSession': {
              if (!payload.path && (!payload.kind || !payload.id)) {
                throw new Error('stopFeatureSession 需要 path 或 kind + id')
              }
              const stopped = payload.path
                ? await stopFeatureSessionByPath(payload.path)
                : await stopFeatureSession(payload.kind, payload.id)
              sendCommandResult(client, payload, {
                ok: true,
                message: stopped ? '功能调试已停止' : '功能调试未运行',
              })
              break
            }
            case 'buildFeature': {
              await buildFeature(payload.kind, payload.id, payload.mode)
              sendCommandResult(client, payload, {
                ok: true,
                message: `功能已编译: ${payload.kind}/${payload.id}`,
              })
              break
            }
            case 'createFeature': {
              const directory = createFeature(payload)
              sendCommandResult(client, payload, {
                ok: true,
                message: `功能已创建: ${directory}`,
              })
              break
            }
            case 'queryFeatureSessions': {
              sendMessage(client, {
                type: 'queryFeatureSessionsResponse',
                featureSessions: getFeatureSessionPaths(),
              })
              break
            }
          }
        } catch (error) {
          console.error('无效信息', data)
          if (payload && 'requestId' in payload) {
            sendCommandResult(client, payload, {
              ok: false,
              error: (error as Error).message,
            })
          }
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
