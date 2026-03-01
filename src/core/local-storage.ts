import { select } from './spin-query'
import { createPostHook, deleteValue, getRandomId } from './utils'

interface CrossOriginMessage {
  type: string
  id?: string
  key?: string
  value?: unknown
}
interface CrossOriginMessageListener {
  id: string
  resolve: (result: unknown) => void
}
interface CrossOriginStorageListener {
  id: string
  callback: (newValue: string) => void
}

const postMessage = async (message: CrossOriginMessage) => {
  const iframe = (await select(
    'iframe[src^="https://s1.hdslb.com/bfs/seed/jinkela/short/cols/iframe.html"][data-loaded="true"]',
  )) as HTMLIFrameElement
  if (!iframe) {
    throw new Error('COLS iframe not found')
  }
  iframe.contentWindow.postMessage(message, 'https://s1.hdslb.com')
}
const messageListeners: CrossOriginMessageListener[] = []
const storageListeners: CrossOriginStorageListener[] = []
window.addEventListener('message', e => {
  if (e.data.type === 'COLS_RES') {
    const data = e.data as CrossOriginMessage
    const { id } = data
    const handleMessageListeners = () => {
      const listenerIndex = messageListeners.findIndex(it => it.id === id)
      if (listenerIndex < 0) {
        return
      }
      const [listener] = messageListeners.splice(listenerIndex, 1)
      listener.resolve(data.value)
    }
    const handleStorageListeners = () => {
      const index = storageListeners.findIndex(it => it.id === id)
      if (index < 0) {
        return
      }
      storageListeners[index].callback(data.value as string)
    }
    handleMessageListeners()
    handleStorageListeners()
  }
})

const wrapMessageApi = <ReturnType = void>(handler: (messageId: string) => void) => {
  return () =>
    new Promise<ReturnType>(resolve => {
      const id = getRandomId(32)
      messageListeners.push({
        id,
        resolve,
      })
      handler(id)
    })
}
/** 跨域 Local Storage (由 b 站官方提供) */
export const crossOriginLocalStorage = {
  setItem: (key: string, item: unknown) => {
    return wrapMessageApi(id => {
      postMessage({
        id,
        type: 'COLS_SET',
        key,
        value: item,
      })
    })()
  },
  getItem: <ReturnType = string>(key: string) => {
    return wrapMessageApi<ReturnType>(id => {
      postMessage({
        id,
        type: 'COLS_GET',
        key,
      })
    })()
  },
  removeItem: (key: string) => {
    return wrapMessageApi(id => {
      postMessage({
        id,
        type: 'COLS_RM',
        key,
      })
    })()
  },
  keys: (prefix: string) => {
    return wrapMessageApi<string[]>(id => {
      postMessage({
        id,
        type: 'COLS_KEYS',
        key: prefix,
      })
    })()
  },
  clear: (prefix: string) => {
    return wrapMessageApi(id => {
      postMessage({
        id,
        type: 'COLS_CLR',
        key: prefix,
      })
    })()
  },
  addStorageListener: async (key: string, callback: CrossOriginStorageListener['callback']) => {
    const callbackId = getRandomId(32)
    storageListeners.push({
      id: callbackId,
      callback,
    })
    postMessage({
      type: 'COLS_LIS',
      key,
      id: callbackId,
    })
    return callbackId
  },
  removeStorageListener: async (key: string, callbackId: string) => {
    deleteValue(storageListeners, it => it.id === callbackId)
    postMessage({
      type: 'COLS_LIS_UN',
      key,
      id: callbackId,
    })
  },
}

type LocalStorageListener = (key: string, value: string) => void
const localStorageListeners: LocalStorageListener[] = []
let currentWindowLocalStorageHooked = false

/**
 * 添加对 LocalStorage 的变化监听, 支持当前 window 和同源的其他 window 产生的 LocalStorage 变化
 * @param onLocalStorageUpdate LocalStorage 变化回调
 * @returns 取消监听的函数
 */
export const watchLocalStorage = (onLocalStorageUpdate: LocalStorageListener) => {
  if (!currentWindowLocalStorageHooked) {
    createPostHook(unsafeWindow.localStorage, 'setItem', (key: string, value: string) => {
      localStorageListeners.forEach(listener => listener(key, value))
    })
    currentWindowLocalStorageHooked = true
  }
  localStorageListeners.push(onLocalStorageUpdate)
  const otherWindowLocalStorageListener = (e: StorageEvent) => {
    onLocalStorageUpdate(e.key, e.newValue)
  }
  window.addEventListener('storage', otherWindowLocalStorageListener)
  return () => {
    const index = localStorageListeners.indexOf(onLocalStorageUpdate)
    if (index > -1) {
      localStorageListeners.splice(index, 1)
    }
    window.removeEventListener('storage', otherWindowLocalStorageListener)
  }
}
