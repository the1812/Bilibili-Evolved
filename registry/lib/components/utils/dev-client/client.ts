import type { Payload } from 'dev-tools/dev-server/payload'
import { OptionsOfMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import { useScopedConsole } from '@/core/utils/log'
import { options as optionsDefinition } from './options'
import { CoreUpdateMethod } from './update-method'

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

  private handleItemUpdate(path: string) {
    this.dispatchEvent(new CustomEvent('itemUpdate', { detail: path }))
    // TODO:
  }
}
export const devClient = new DevClient()
