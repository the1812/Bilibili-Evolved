import { WebSocket } from 'ws'
import { devServerConfig } from './config'
import { Payload, FeatureKind } from './payload'

const [, , command, kindText, ...args] = process.argv

const usage = () => {
  console.log(`Usage:
pnpm tsx dev-tools/dev-server/command.ts build <component|plugin> <id> [development|production]
pnpm tsx dev-tools/dev-server/command.ts watch <component|plugin> <id>
pnpm tsx dev-tools/dev-server/command.ts stop <component|plugin> <id>
pnpm tsx dev-tools/dev-server/command.ts sessions
pnpm tsx dev-tools/dev-server/command.ts create <component|plugin> <id> <name> <displayName> <authorName> [authorLink] [description]`)
}

const isFeatureKind = (value: string): value is FeatureKind =>
  value === 'component' || value === 'plugin'

const createRequestId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`

const createPayload = (): Payload => {
  if (command === 'sessions') {
    return { type: 'queryFeatureSessions' }
  }
  if (!isFeatureKind(kindText)) {
    usage()
    throw new Error(`无效功能类型: ${kindText}`)
  }
  const [id, modeOrName, displayName, authorName, authorLink = '', description = ''] = args
  if (!id) {
    usage()
    throw new Error('缺少功能 ID')
  }
  const requestId = createRequestId()
  if (command === 'build') {
    return {
      type: 'buildFeature',
      kind: kindText,
      id,
      mode: modeOrName === 'production' ? 'production' : 'development',
      requestId,
    }
  }
  if (command === 'watch') {
    return {
      type: 'startFeatureSession',
      kind: kindText,
      id,
      requestId,
    }
  }
  if (command === 'stop') {
    return {
      type: 'stopFeatureSession',
      kind: kindText,
      id,
      requestId,
    }
  }
  if (command === 'create') {
    if (!modeOrName || !displayName || !authorName) {
      usage()
      throw new Error('create 需要 id、name、displayName 和 authorName')
    }
    return {
      type: 'createFeature',
      kind: kindText,
      id,
      name: modeOrName,
      displayName,
      authorName,
      authorLink,
      description: description || displayName,
      requestId,
    }
  }
  usage()
  throw new Error(`无效命令: ${command}`)
}

const payload = createPayload()
const socket = new WebSocket(`ws://localhost:${devServerConfig.port}`)

socket.addEventListener('open', () => {
  socket.send(JSON.stringify(payload))
})

socket.addEventListener('message', event => {
  const response = JSON.parse(event.data.toString()) as Payload
  if (payload.type === 'queryFeatureSessions' && response.type === 'queryFeatureSessionsResponse') {
    console.log(response.featureSessions.join('\n'))
    socket.close()
    return
  }
  if ('requestId' in payload && response.type === 'commandResult') {
    if (response.requestId !== payload.requestId) {
      return
    }
    if (response.message) {
      console.log(response.message)
    }
    if (response.featureSessions) {
      console.log(`featureSessions: ${response.featureSessions.join(', ')}`)
    }
    if (!response.ok) {
      console.error(response.error)
      process.exitCode = 1
    }
    socket.close()
  }
})

socket.addEventListener('error', () => {
  console.error(`无法连接 DevServer: ws://localhost:${devServerConfig.port}`)
  process.exitCode = 1
})
