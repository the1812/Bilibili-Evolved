import type { Payload } from 'dev-tools/dev-server/payload'
import type { AutoUpdateOptions } from '@/components/auto-update'
import { OptionsOfMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import { useScopedConsole } from '@/core/utils/log'
import { ComponentMetadata, componentsMap } from '@/components/component'
import { loadInstantStyle, removeStyle } from '@/core/style'
import { options as optionsDefinition } from './options'
import { CoreUpdateMethod, RegistryUpdateMethod } from './update-method'

const { options } = getComponentSettings<OptionsOfMetadata<typeof optionsDefinition>>('devClient')
const console = useScopedConsole('DevClient')

export class DevClient extends EventTarget {
  socket: WebSocket
  constructor() {
    super()
    this.createSocket()
  }

  createSocket() {
    this.closeSocket()

    const unloadHandler = () => {
      this.closeSocket()
    }
    this.socket = new WebSocket(`ws://localhost:${options.port}`)
    this.socket.addEventListener('error', () => {
      console.warn('未能连接到 DevServer')
    })
    this.socket.addEventListener('close', () => {
      console.log('已断开 DevServer 连接')
      window.removeEventListener('unload', unloadHandler)
    })
    this.socket.addEventListener('open', () => {
      console.log('已连接到 DevServer')
    })
    this.socket.addEventListener('message', e => {
      const { data } = e
      try {
        const payload: Payload = JSON.parse(data)
        console.log('接收信息', payload)
        switch (payload.type) {
          case 'start':
          default: {
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
      } catch (error) {
        console.error('无效信息', data)
      }
    })
    window.addEventListener('unload', unloadHandler)
  }

  closeSocket() {
    this.socket?.close()
    this.socket = null
  }

  private handleCoreUpdate() {
    this.dispatchEvent(new CustomEvent('coreUpdate'))
    if (options.coreUpdateMethod === CoreUpdateMethod.AlwaysReload) {
      console.log('本体已更新, 刷新页面...')
      location.reload()
    }
  }

  private async handleItemUpdate(path: string) {
    this.dispatchEvent(new CustomEvent('itemUpdate', { detail: path }))
    const { options: autoUpdateOptions } = getComponentSettings<AutoUpdateOptions>('autoUpdate')
    const url = `http://localhost:${options.port}${path}`
    const componentRecord = Object.entries(autoUpdateOptions.urls.components)
      .find(([, { devUrl }]) => devUrl === url)
    if (componentRecord) {
      const [name, { devUrl }] = componentRecord
      const oldComponent = componentsMap[name]
      const code: string = await coreApis.ajax.monkey({ url: devUrl })
      const { installFeatureFromCode } = await import(
        '@/core/install-feature'
      )
      const { metadata } = await installFeatureFromCode(code, url)
      const newComponent = metadata as ComponentMetadata
      const oldInstantStyles = oldComponent.instantStyles ?? []
      const newInstantStyles = newComponent.instantStyles ?? []
      const isEntryEmpty = oldComponent.entry === none && newComponent.entry === none
      console.log({ oldInstantStyles, newInstantStyles, isEntryEmpty })

      const doNotReload = () => {
        console.log(`组件 [${newComponent.displayName}] 已更新`)
      }
      const reloadInstantStyles = () => {
        if (oldInstantStyles.length > 0 || newInstantStyles.length > 0) {
          loadInstantStyle(newComponent)
          oldInstantStyles.forEach(style => {
            removeStyle(style.name)
          })
          // 修改旧的引用, 否则之前设的事件监听还是用旧样式
          oldComponent.instantStyles = newInstantStyles
          return true
        }
        return false
      }
      const reload = () => {
        console.log(`组件 [${newComponent.displayName}] 已更新, 刷新页面...`)
        location.reload()
      }
      switch (options.registryUpdateMethod) {
        case RegistryUpdateMethod.AlwaysReload: {
          reload()
          break
        }
        case RegistryUpdateMethod.PreferInstantStyles: {
          if (reloadInstantStyles()) {
            doNotReload()
          } else {
            reload()
          }
          break
        }
        case RegistryUpdateMethod.PreferEntry: {
          if (isEntryEmpty) {
            reloadInstantStyles()
            doNotReload()
          } else {
            reload()
          }
          break
        }
        default:
        case RegistryUpdateMethod.DoNotReload: {
          doNotReload()
          break
        }
      }
    }
    // TODO: plugin update
  }
}
export const devClient = new DevClient()
