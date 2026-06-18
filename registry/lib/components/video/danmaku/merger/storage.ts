/** 合并器存储键索引，用于批量列举/清理会话数据 */
export const DM_MERGER_KEYS_INDEX = 'dm_merger_keys_index'

/** 由 entry 注入的 monkeyApis 存储能力（禁止 globalThis GM 垫片） */
export type MonkeyStorageSource = {
  GM_getValue: <T>(name: string, defaultValue?: T) => T
  GM_setValue: (name: string, value: unknown) => void
  GM_deleteValue: (name: string) => void
}

let storageSource: MonkeyStorageSource | null = null

/** 注入 BE monkeyApis 存储实现，须在 getStorage 之前调用 */
export const initStorage = (source: MonkeyStorageSource): void => {
  storageSource = source
}

const requireSource = (): MonkeyStorageSource => {
  if (!storageSource) {
    throw new Error('[弹幕合并器] storage 未初始化，请先调用 initStorage(monkeyApis)')
  }
  return storageSource
}

const readKeysIndex = (source: MonkeyStorageSource): string[] => {
  try {
    return JSON.parse(String(source.GM_getValue(DM_MERGER_KEYS_INDEX, '[]'))) as string[]
  } catch {
    return []
  }
}

const writeKeysIndex = (source: MonkeyStorageSource, keys: string[]): void => {
  source.GM_setValue(DM_MERGER_KEYS_INDEX, JSON.stringify(keys))
}

/** 获取存储门面；须先 initStorage */
export const getStorage = () => {
  const source = requireSource()

  return {
    get<T>(key: string, defaultValue?: T): T {
      return source.GM_getValue(key, defaultValue as T)
    },

    set(key: string, value: unknown): void {
      source.GM_setValue(key, value)
    },

    delete(key: string): void {
      source.GM_deleteValue(key)
    },

    /** 将键登记到索引，便于 listMergerKeys / 维护清理 */
    trackKey(key: string): void {
      try {
        const keys = readKeysIndex(source)
        if (!keys.includes(key)) {
          keys.push(key)
          writeKeysIndex(source, keys)
        }
      } catch {
        /* 索引写入失败不影响主流程 */
      }
    },

    /** 返回索引中登记过的所有合并器存储键 */
    listMergerKeys(): string[] {
      return readKeysIndex(source)
    },
  }
}