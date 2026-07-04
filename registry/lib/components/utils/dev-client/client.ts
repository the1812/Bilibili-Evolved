import type { Payload, StopFeatureSessionPayload } from './protocol'
import { useScopedConsole } from '@/core/utils/log'
import { ComponentMetadata, componentsMap } from '@/components/component'
import { loadInstantStyle, removeInstantStyle } from '@/core/style'
import { getComponentSettings, isComponentEnabled } from '@/core/settings'
import { autoUpdateOptions, getDevClientOptions } from './options'
import { RefreshMethod, HotReloadMethod } from './update-method'
import { monkey } from '@/core/ajax'
import { plugins } from '@/plugins/plugin'
import { Toast } from '@/core/toast'

const options = getDevClientOptions()
const console = useScopedConsole('DevClient')
const createRequestId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`
const handleSocketMessage = (event: MessageEvent, callback: (payload: Payload) => void) => {
  const { data } = event
  try {
    const payload: Payload = JSON.parse(data)
    console.log('接收信息', payload)
    callback(payload)
  } catch (error) {
    console.error('无效信息', data)
  }
}
export enum DevClientEvents {
  CoreUpdate = 'coreUpdate',
  ItemUpdate = 'itemUpdate',
  FeatureSessionsUpdate = 'featureSessionsUpdate',
  ClientIdUpdate = 'clientIdUpdate',
  ServerChange = 'serverChange',
  ServerConnected = 'serverConnected',
  ServerDisconnected = 'serverDisconnected',
  ServerStop = 'serverStop',
}

export class DevClient extends EventTarget {
  socket: WebSocket
  clientId: string | null = null
  featureSessions: string[] = []
  private pendingFeatureSessionQueries: ((featureSessions: string[]) => void)[] = []
  private pendingCommandResults = new Map<
    string,
    (payload: Extract<Payload, { type: 'commandResult' }>) => void
  >()

  addEventListener(
    type: DevClientEvents,
    callback: EventListenerOrEventListenerObject,
    eventOptions?: boolean | AddEventListenerOptions,
  ) {
    super.addEventListener(type, callback, eventOptions)
  }
  removeEventListener(
    type: DevClientEvents,
    callback: EventListenerOrEventListenerObject,
    eventOptions?: boolean | EventListenerOptions,
  ) {
    super.removeEventListener(type, callback, eventOptions)
  }

  createSocket(toastError = false) {
    return new Promise<boolean>(resolve => {
      this.closeSocket()

      const unloadHandler = () => {
        this.closeSocket()
      }
      this.socket = new WebSocket(`ws://localhost:${options.port}`)
      this.socket.addEventListener('error', () => {
        console.warn('未能连接到 DevServer')
        if (toastError) {
          Toast.error('连接失败, 请确保 DevServer 已启动, 并检查连接配置.', 'DevClient', 2000)
        }
        this.closeSocket()
        resolve(false)
      })
      this.socket.addEventListener('close', () => {
        console.log('已断开 DevServer 连接')
        window.removeEventListener('unload', unloadHandler)
      })
      this.socket.addEventListener('open', () => {
        console.log('已连接到 DevServer')
        this.dispatchEvent(new CustomEvent(DevClientEvents.ServerChange, { detail: true }))
        this.dispatchEvent(new CustomEvent(DevClientEvents.ServerConnected))
        resolve(true)
      })
      this.socket.addEventListener('message', e => {
        handleSocketMessage(e, payload => {
          switch (payload.type) {
            default: {
              break
            }
            case 'serverReady': {
              this.updateClientId(payload.clientId)
              this.updateFeatureSessions(payload.featureSessions)
              break
            }
            case 'serverStop': {
              this.dispatchEvent(new CustomEvent(DevClientEvents.ServerStop))
              this.closeSocket()
              break
            }
            case 'featureSessionsChanged':
            case 'queryFeatureSessionsResponse': {
              this.updateFeatureSessions(payload.featureSessions)
              break
            }
            case 'commandResult': {
              if (payload.requestId) {
                this.pendingCommandResults.get(payload.requestId)?.(payload)
                this.pendingCommandResults.delete(payload.requestId)
              }
              break
            }
            case 'coreUpdate': {
              this.handleCoreUpdate()
              break
            }
            case 'itemUpdate': {
              const { path } = payload
              this.updateFeatureSessions(payload.featureSessions)
              this.handleItemUpdate(path)
              break
            }
            case 'startDebugFeature': {
              this.handleStartDebugFeature(payload)
              break
            }
          }
        })
      })
      window.addEventListener('unload', unloadHandler)
    })
  }

  closeSocket() {
    if (!this.socket) {
      return
    }
    this.socket.close()
    this.socket = null
    this.updateClientId(null)
    this.updateFeatureSessions([])
    this.dispatchEvent(new CustomEvent(DevClientEvents.ServerChange, { detail: false }))
    this.dispatchEvent(new CustomEvent(DevClientEvents.ServerDisconnected))
  }

  get isConnected() {
    return this.socket?.readyState === WebSocket.OPEN
  }

  private handleCoreUpdate() {
    this.dispatchEvent(new CustomEvent(DevClientEvents.CoreUpdate))
    if (options.coreRefreshMethod === RefreshMethod.AlwaysRefresh) {
      console.log('本体已更新, 刷新页面...')
      location.reload()
    }
  }

  private async handleItemUpdate(path: string) {
    this.dispatchEvent(new CustomEvent(DevClientEvents.ItemUpdate, { detail: path }))
    const url = `http://localhost:${options.port}${path}`
    const componentRecord = Object.entries(autoUpdateOptions.urls.components).find(
      ([, { url: itemUrl }]) => itemUrl.endsWith(path),
    )
    if (componentRecord) {
      const [name] = componentRecord
      const oldComponent = componentsMap[name]
      if (!oldComponent) {
        return
      }
      const code: string = await monkey({ url })
      const { installFeatureFromCode } = await import('@/core/install-feature')
      const { metadata } = await installFeatureFromCode(code, url)
      const newComponent = metadata as ComponentMetadata
      const oldInstantStyles = oldComponent.instantStyles ?? []
      const newInstantStyles = newComponent.instantStyles ?? []
      // const isEntryEmpty = oldComponent.entry === none && newComponent.entry === none
      // console.log({ oldInstantStyles, newInstantStyles, isEntryEmpty })

      const doNotReload = () => {
        console.log(`组件 [${newComponent.displayName}] 已更新`)
      }
      const reload = () => {
        console.log(`组件 [${newComponent.displayName}] 已更新, 刷新页面...`)
        location.reload()
      }
      const reloadInstantStyles = () => {
        if (oldInstantStyles.length > 0 || newInstantStyles.length > 0) {
          oldInstantStyles.forEach(style => {
            removeInstantStyle(style)
          })
          loadInstantStyle(newComponent)
          // 修改旧的引用, 否则之前设的事件监听还是用旧样式
          oldComponent.instantStyles = newInstantStyles
          return true
        }
        return false
      }
      switch (options.registryReloadMethod) {
        default:
        case HotReloadMethod.Disabled: {
          if (options.registryRefreshMethod === RefreshMethod.DoNotRefresh) {
            doNotReload()
          } else {
            reload()
          }
          break
        }
        case HotReloadMethod.Enabled: {
          if (reloadInstantStyles()) {
            doNotReload()
          } else {
            reload()
          }
          break
        }
      }
      return
    }

    const pluginRecord = Object.entries(autoUpdateOptions.urls.plugins).find(
      ([, { url: itemUrl }]) => itemUrl.endsWith(path),
    )
    if (pluginRecord) {
      const [name] = pluginRecord
      const plugin = plugins.find(p => p.name === name)
      if (!plugin) {
        return
      }
      const { displayName } = plugin
      if (options.registryRefreshMethod !== RefreshMethod.DoNotRefresh) {
        console.log(`插件 [${displayName}] 已更新, 刷新页面...`)
        location.reload()
      } else {
        console.log(`插件 [${displayName}] 已更新`)
      }
    }
  }

  private async queryFeatureSessions() {
    return new Promise<string[]>(resolve => {
      if (!this.isConnected) {
        this.updateFeatureSessions([])
        resolve([])
        return
      }
      this.pendingFeatureSessionQueries.push(resolve)
      this.socket?.send(JSON.stringify({ type: 'queryFeatureSessions' }))
    })
  }

  private async sendCommand(payload: Payload & { requestId?: string }) {
    return new Promise<Extract<Payload, { type: 'commandResult' }>>(resolve => {
      if (!this.isConnected) {
        resolve({
          type: 'commandResult',
          requestId: payload.requestId,
          ok: false,
        })
        return
      }
      if (payload.requestId) {
        this.pendingCommandResults.set(payload.requestId, resolve)
      }
      this.socket?.send(JSON.stringify(payload))
    })
  }

  private updateFeatureSessions(featureSessions: string[]) {
    this.featureSessions = featureSessions
    this.dispatchEvent(
      new CustomEvent(DevClientEvents.FeatureSessionsUpdate, { detail: this.featureSessions }),
    )
    this.pendingFeatureSessionQueries.splice(0).forEach(resolve => resolve(this.featureSessions))
  }

  private updateClientId(clientId: string | null) {
    this.clientId = clientId
    this.dispatchEvent(new CustomEvent(DevClientEvents.ClientIdUpdate, { detail: clientId }))
  }

  async startDebug(url: string) {
    await monkey({ url })
    return this.queryFeatureSessions()
  }

  async stopDebug(path: string) {
    const stopPayload: StopFeatureSessionPayload = {
      type: 'stopFeatureSession',
      path,
      requestId: createRequestId(),
    }
    const result = await this.sendCommand(stopPayload)
    if (result.featureSessions) {
      this.updateFeatureSessions(result.featureSessions)
      return result.featureSessions
    }
    return this.queryFeatureSessions()
  }

  private async handleStartDebugFeature(payload: Extract<Payload, { type: 'startDebugFeature' }>) {
    const { kind, path, requestId, url } = payload
    if (!path || !url) {
      this.socket?.send(
        JSON.stringify({
          type: 'startDebugFeatureResult',
          requestId,
          ok: false,
          error: 'startDebugFeature 缺少 path 或 url',
        } satisfies Payload),
      )
      return
    }
    let debugStage = 'load code'
    try {
      const code: string = await monkey({ url })
      debugStage = 'parse code'
      const { loadFeatureCode } = await import('@/core/external-input')
      const parsedFeature = loadFeatureCode(code) as { name: string }
      debugStage = 'install code'
      const { installFeatureFromCode } = await import('@/core/install-feature')
      const autoUpdateRecords = autoUpdateOptions.urls[`${kind}s`]
      const originalAutoUpdateUrl = autoUpdateRecords[parsedFeature.name]?.url
      const oldComponent = kind === 'component' ? componentsMap[parsedFeature.name] : undefined
      const { metadata } = await installFeatureFromCode(code, url)
      debugStage = 'update auto update record'
      const existingDevRecord = options.devRecords[metadata.name]
      const existingAutoUpdateRecord = autoUpdateRecords[metadata.name]
      if (!existingDevRecord && originalAutoUpdateUrl && originalAutoUpdateUrl !== url) {
        options.devRecords[metadata.name] = {
          name: metadata.name,
          originalUrl: originalAutoUpdateUrl,
        }
      }
      if (existingAutoUpdateRecord) {
        existingAutoUpdateRecord.url = url
      }
      if (kind === 'component') {
        debugStage = 'load component style'
        const component = metadata as ComponentMetadata
        const settings = getComponentSettings(component)
        settings.enabled = true
        oldComponent?.instantStyles?.forEach(style => removeInstantStyle(style))
        componentsMap[component.name] = component
        if (isComponentEnabled(component)) {
          await loadInstantStyle(component)
        }
      }
      this.updateFeatureSessions([...new Set([...this.featureSessions, path])])
      this.socket?.send(
        JSON.stringify({
          type: 'startDebugFeatureResult',
          requestId,
          ok: true,
          message: `功能已安装并启用调试: ${kind}/${payload.id}`,
        } satisfies Payload),
      )
    } catch (error) {
      console.error('调试功能安装失败', error)
      const message =
        error instanceof Error && error.message
          ? error.message
          : String(error) || Object.prototype.toString.call(error)
      this.socket?.send(
        JSON.stringify({
          type: 'startDebugFeatureResult',
          requestId,
          ok: false,
          error: `${debugStage}: ${message}`,
        } satisfies Payload),
      )
    }
  }
}
export const devClient = new DevClient()
