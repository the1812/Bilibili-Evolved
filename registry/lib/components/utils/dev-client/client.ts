import type { Payload } from './protocol'
import { useScopedConsole } from '@/core/utils/log'
import { ComponentMetadata, componentsMap } from '@/components/component'
import { isComponentEnabled, registerTemporaryComponentSettings } from '@/core/settings'
import { loadInstantStyle, removeInstantStyle } from '@/core/style'
import { getDevFeaturePaths, loadDevFeature, setDevFeaturePaths } from '@/core/dev-features'
import { getDevClientOptions } from './options'
import { HotReloadMethod, RefreshMethod } from './update-method'
import { Toast } from '@/core/toast'

const options = getDevClientOptions()
const console = useScopedConsole('DevClient')

export enum DevClientEvents {
  DebugPathsChange = 'debugPathsChange',
  ClientIdUpdate = 'clientIdUpdate',
  ServerChange = 'serverChange',
}

export class DevClient extends EventTarget {
  private socket?: WebSocket
  clientId: string | null = null

  get isConnected() {
    return this.socket?.readyState === WebSocket.OPEN
  }

  get debugPaths() {
    return getDevFeaturePaths()
  }

  private setDebugPaths(paths: string[]) {
    setDevFeaturePaths(paths)
    this.dispatchEvent(new CustomEvent(DevClientEvents.DebugPathsChange, { detail: paths }))
  }

  createSocket(toastError = false) {
    this.closeSocket()
    const socket = new WebSocket(`ws://localhost:${options.port}`)
    this.socket = socket
    return new Promise<boolean>(resolve => {
      socket.addEventListener('error', () => {
        console.warn('未能连接到 DevServer')
        if (toastError) {
          Toast.error('连接失败, 请确保 DevServer 已启动, 并检查连接配置.', 'DevClient', 2000)
        }
      })
      socket.addEventListener('close', () => {
        if (this.socket === socket) {
          this.closeSocket()
          this.reconcileSessions([])
        }
        resolve(false)
      })
      socket.addEventListener('message', event => {
        const payload: Payload = JSON.parse(event.data)
        switch (payload.type) {
          case 'serverReady': {
            this.clientId = payload.clientId
            this.dispatchEvent(new Event(DevClientEvents.ClientIdUpdate))
            this.dispatchEvent(new CustomEvent(DevClientEvents.ServerChange, { detail: true }))
            this.reconcileSessions(payload.featureSessions)
            resolve(true)
            break
          }
          case 'serverStop': {
            this.closeSocket()
            this.reconcileSessions([])
            break
          }
          case 'featureSessionsChanged': {
            this.reconcileSessions(payload.featureSessions)
            break
          }
          case 'commandResult': {
            if (payload.ok) {
              console.log(payload.message)
            } else {
              console.error(payload.error)
            }
            break
          }
          case 'coreUpdate': {
            if (options.coreRefreshMethod === RefreshMethod.AlwaysRefresh) {
              location.reload()
            }
            break
          }
          case 'itemUpdate': {
            this.reconcileSessions(payload.featureSessions)
            this.handleItemUpdate(payload.path).catch(console.error)
            break
          }
          case 'startDebugFeature': {
            this.handleStartDebugFeature(payload, socket)
            break
          }
          default:
            break
        }
      })
    })
  }

  private closeSocket() {
    const { socket } = this
    if (!socket) {
      return
    }
    this.socket = undefined
    socket.close()
    this.clientId = null
    this.dispatchEvent(new Event(DevClientEvents.ClientIdUpdate))
    this.dispatchEvent(new CustomEvent(DevClientEvents.ServerChange, { detail: false }))
  }

  disconnect() {
    this.setDebugPaths([])
    this.closeSocket()
  }

  private reconcileSessions(sessions: string[]) {
    const current = this.debugPaths
    const paths = current.filter(path => sessions.includes(path))
    if (paths.length !== current.length) {
      this.setDebugPaths(paths)
    }
  }

  private async applyInstantStyles(component: ComponentMetadata) {
    const previous = componentsMap[component.name]
    const oldStyles = previous?.instantStyles ?? []
    const newStyles = component.instantStyles ?? []
    if (oldStyles.length === 0 && newStyles.length === 0) {
      return false
    }
    removeInstantStyle(...oldStyles)
    await loadInstantStyle(component)
    if (previous) {
      previous.instantStyles = newStyles
    }
    return true
  }

  private async handleItemUpdate(path: string) {
    if (!this.debugPaths.includes(path)) {
      return
    }
    const isComponent = path.startsWith('/registry/dist/components/')
    const hotReload = isComponent && options.registryReloadMethod === HotReloadMethod.Enabled
    let displayName = path
    if (hotReload) {
      const feature = await loadDevFeature(options.port, path)
      displayName = feature.metadata.displayName
      if (
        feature.kind === 'component' &&
        componentsMap[feature.metadata.name] &&
        (await this.applyInstantStyles(feature.metadata))
      ) {
        console.log(`组件 [${displayName}] 已更新`)
        return
      }
    }
    const message = `${isComponent ? '组件' : '插件'} [${displayName}] 已更新`
    const reload = hotReload || options.registryRefreshMethod === RefreshMethod.AlwaysRefresh
    console.log(reload ? `${message}, 刷新页面...` : message)
    if (reload) {
      location.reload()
    }
  }

  async startDebug(path: string, expected?: { kind: 'component' | 'plugin'; name?: string }) {
    const feature = await loadDevFeature(options.port, path)
    if (
      expected &&
      (feature.kind !== expected.kind || (expected.name && feature.metadata.name !== expected.name))
    ) {
      throw new Error(`调试功能不匹配: ${path}`)
    }
    this.setDebugPaths([...new Set([...this.debugPaths, path])])
    console.log(`功能监听已启动: ${path}`)
    return feature
  }

  stopDebug(path: string) {
    this.setDebugPaths(this.debugPaths.filter(item => item !== path))
    this.socket?.send(JSON.stringify({ type: 'stopFeatureSession', path } satisfies Payload))
  }

  private async handleStartDebugFeature(
    payload: Extract<Payload, { type: 'startDebugFeature' }>,
    socket: WebSocket,
  ) {
    const { kind, path, requestId } = payload
    try {
      const feature = await this.startDebug(path, { kind })
      if (feature.kind === 'component') {
        registerTemporaryComponentSettings(feature.metadata)
        if (isComponentEnabled(feature.metadata)) {
          await this.applyInstantStyles(feature.metadata)
        }
      }
      socket.send(
        JSON.stringify({
          type: 'startDebugFeatureResult',
          requestId,
          ok: true,
          message: `已开始调试: ${kind}/${payload.id}`,
        } satisfies Payload),
      )
    } catch (error) {
      console.error('加载调试功能失败', error)
      socket.send(
        JSON.stringify({
          type: 'startDebugFeatureResult',
          requestId,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        } satisfies Payload),
      )
    }
  }
}
export const devClient = new DevClient()
