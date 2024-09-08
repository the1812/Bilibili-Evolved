import type { ItemStopPayload, Payload } from 'dev-tools/dev-server/payload'
import { useScopedConsole } from '@/core/utils/log'
import { ComponentMetadata, componentsMap } from '@/components/component'
import { loadInstantStyle, removeInstantStyle } from '@/core/style'
import { autoUpdateOptions, getDevClientOptions } from './options'
import { RefreshMethod, HotReloadMethod } from './update-method'
import { monkey } from '@/core/ajax'
import { plugins } from '@/plugins/plugin'
import { Toast } from '@/core/toast'

const options = getDevClientOptions()
const console = useScopedConsole('DevClient')
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
  SessionsUpdate = 'sessionsUpdate',
  ServerChange = 'serverChange',
  ServerConnected = 'serverConnected',
  ServerDisconnected = 'serverDisconnected',
}

export class DevClient extends EventTarget {
  socket: WebSocket
  sessions: string[] = []

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
            case 'start': {
              this.sessions = payload.sessions
              this.dispatchEvent(
                new CustomEvent(DevClientEvents.SessionsUpdate, { detail: this.sessions }),
              )
              break
            }
            case 'stop': {
              this.closeSocket()
              break
            }
            case 'coreUpdate': {
              this.handleCoreUpdate()
              break
            }
            case 'itemUpdate': {
              const { path } = payload
              this.handleItemUpdate(path)
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
    this.sessions = []
    this.dispatchEvent(new CustomEvent(DevClientEvents.SessionsUpdate, { detail: this.sessions }))
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

  private async querySessions() {
    return new Promise<string[]>(resolve => {
      this.socket?.addEventListener(
        'message',
        e => {
          handleSocketMessage(e, payload => {
            if (payload.type === 'querySessionsResponse') {
              this.sessions = payload.sessions
              this.dispatchEvent(
                new CustomEvent(DevClientEvents.SessionsUpdate, { detail: payload.sessions }),
              )
              resolve(payload.sessions)
            }
          })
        },
        { once: true },
      )
      this.socket?.send(JSON.stringify({ type: 'querySessions' }))
    })
  }

  async startDebug(url: string) {
    await monkey({ url })
    return this.querySessions()
  }

  async stopDebug(path: string) {
    const stopPayload: ItemStopPayload = {
      type: 'itemStop',
      path,
    }
    this.socket?.send(JSON.stringify(stopPayload))
    return this.querySessions()
  }
}
export const devClient = new DevClient()
