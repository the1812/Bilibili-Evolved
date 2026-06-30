/* eslint-disable no-underscore-dangle */
import type { ComponentEntryContext } from '@/components/types'
import type { MergerOptions } from './options'

/** 组件设置内嵌的持久化桶 */
export interface MergerPersistState {
  keys: string[]
  data: Record<string, unknown>
}

type MergerOptionsWithPersist = MergerOptions & {
  _mergerPersist: MergerPersistState
}

interface StorageBackend {
  get<T>(key: string, defaultValue?: T): T
  set(key: string, value: unknown): void
  delete(key: string): void
  trackKey(key: string): void
  listMergerKeys(): string[]
}

let storageBackend: StorageBackend | null = null

const ensurePersistState = (context: ComponentEntryContext): MergerPersistState => {
  const options = context.settings.options as MergerOptionsWithPersist
  if (!options._mergerPersist || typeof options._mergerPersist !== 'object') {
    options._mergerPersist = { keys: [], data: {} }
  }
  const persist = options._mergerPersist
  if (!persist.data || typeof persist.data !== 'object') {
    persist.data = {}
  }
  if (!Array.isArray(persist.keys)) {
    persist.keys = []
  }
  return persist
}

const createSettingsBackend = (persist: MergerPersistState): StorageBackend => ({
  get<T>(key: string, defaultValue?: T): T {
    if (Object.prototype.hasOwnProperty.call(persist.data, key)) {
      return persist.data[key] as T
    }
    return defaultValue as T
  },
  set(key: string, value: unknown): void {
    persist.data[key] = value
    this.trackKey(key)
  },
  delete(key: string): void {
    delete persist.data[key]
    persist.keys = persist.keys.filter(k => k !== key)
  },
  trackKey(key: string): void {
    if (!persist.keys.includes(key)) {
      persist.keys.push(key)
    }
  },
  listMergerKeys(): string[] {
    return [...persist.keys]
  },
})

/**
 * 经组件设置代理持久化，适配 loadFeatureCode 沙箱（沙箱内无法直接访问 GM_*）。
 * 写入会触发 BE settings 代理，最终由主包 GM_setValue 落盘。
 */
export const initStorageFromContext = (context: ComponentEntryContext): void => {
  storageBackend = createSettingsBackend(ensurePersistState(context))
}

/** 获取存储门面；须先 initStorageFromContext */
export const getStorage = () => {
  if (!storageBackend) {
    throw new Error('[弹幕合并器] storage 未初始化，请先调用 initStorageFromContext')
  }
  return storageBackend
}
