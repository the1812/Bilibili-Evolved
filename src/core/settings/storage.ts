// AdGuard 的异步写入可能因编码后的请求过大而失败, 同页 GM_getValue 仍会读到缓存的新值.
const chunkSize = 8192
const storagePrefix = '__bilibiliEvolvedSettings_v1__'
const journalPrefix = '__bilibiliEvolvedSettings_v2__'
const pageId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
let revisionNumber = 0
let lastTimestamp = 0

interface Snapshot {
  bank: 0 | 1
  revision: string
  length: number
  parts: number
}
interface Manifest {
  version: 1
  current: Snapshot
  previous?: Snapshot
}
interface StorageState {
  serialized: string | undefined
  chunks?: string[]
}
interface Commit {
  version: 2
  timestamp: number
  length: number
  chunks: string[]
  changedKeys?: string[]
}
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const states = new Map<string, StorageState>()
const manifestKey = (key: string) => `${storagePrefix}${key}`
const chunkKey = (key: string, bank: number, index: number) =>
  `${manifestKey(key)}:${bank}:${index}`

const readJournal = (key: string): boolean => {
  const prefix = `${journalPrefix}${key}:commit:`
  const commits = GM_listValues()
    .filter(name => name.startsWith(prefix))
    .map(name => ({ name, commit: GM_getValue<Commit>(name) }))
  const valid = commits.filter(
    ({ commit }) =>
      commit?.version === 2 &&
      Number.isSafeInteger(commit.timestamp) &&
      Number.isSafeInteger(commit.length) &&
      commit.length > 0 &&
      Array.isArray(commit.chunks) &&
      commit.chunks.length === Math.ceil(commit.length / chunkSize) &&
      (commit.changedKeys === undefined ||
        (Array.isArray(commit.changedKeys) &&
          commit.changedKeys.every(name => typeof name === 'string'))) &&
      commit.chunks.every(id => typeof id === 'string' && /^[a-z0-9-]+$/.test(id)),
  )
  valid.sort((a, b) => b.commit.timestamp - a.commit.timestamp || b.name.localeCompare(a.name))
  const complete: { commit: Commit; serialized: string; value: unknown }[] = []
  for (const { commit } of valid) {
    lastTimestamp = Math.max(lastTimestamp, commit.timestamp)
    const parts: string[] = []
    for (const id of commit.chunks) {
      parts.push(GM_getValue<string>(`${journalPrefix}${key}:chunk:${id}`))
    }
    if (
      parts.some(
        (part, index) =>
          typeof part !== 'string' ||
          part.length !== Math.min(chunkSize, commit.length - index * chunkSize),
      )
    ) {
      continue
    }
    try {
      const serialized = decodeURIComponent(parts.join(''))
      const value = JSON.parse(serialized)
      if (commit.changedKeys !== undefined && !isRecord(value)) {
        continue
      }
      complete.push({ commit, serialized, value })
    } catch {
      // 不把缺失或损坏的内容作为成功的写入.
    }
  }
  if (complete.length > 0) {
    const latest = complete[0]
    let merged: unknown
    const seen = new Set<string>()
    for (const record of complete.reverse()) {
      if (!isRecord(merged) || record.commit.changedKeys === undefined) {
        merged = JSON.parse(record.serialized)
        seen.clear()
        if (isRecord(merged)) {
          Object.keys(merged).forEach(name => seen.add(name))
        }
      } else {
        // 旧标签页只能修改它实际改动的组件, 不能用旧列表抹掉其他页的新安装.
        // 中间提交缺失时, 完整快照仍可补回未见过的组件; 已卸载的组件不复活.
        const names = new Set([
          ...record.commit.changedKeys,
          ...Object.keys(record.value).filter(name => !seen.has(name)),
        ])
        for (const name of names) {
          seen.add(name)
          if (Object.prototype.hasOwnProperty.call(record.value, name)) {
            Object.defineProperty(merged, name, {
              value: record.value[name],
              enumerable: true,
              configurable: true,
              writable: true,
            })
          } else {
            delete merged[name]
          }
        }
      }
    }
    const serialized = JSON.stringify(merged)
    states.set(key, {
      serialized,
      chunks: serialized === latest.serialized ? latest.commit.chunks : undefined,
    })
    if (latest.commit !== valid[0].commit || valid.length !== commits.length) {
      console.warn(`设置 '${key}' 的最新写入不完整, 已恢复上一份完整数据`)
    }
    return true
  }
  return commits.length > 0
}

const isSnapshot = (value: Snapshot) =>
  value &&
  (value.bank === 0 || value.bank === 1) &&
  typeof value.revision === 'string' &&
  value.revision.length > 0 &&
  Number.isSafeInteger(value.length) &&
  value.length > 0 &&
  value.parts === Math.ceil(value.length / chunkSize)

const readSnapshot = (key: string, snapshot: Snapshot): string | undefined => {
  if (!isSnapshot(snapshot)) {
    return undefined
  }
  const parts: string[] = []
  for (let index = 0; index < snapshot.parts; index++) {
    const chunk = GM_getValue<{ revision: string; data: string }>(
      chunkKey(key, snapshot.bank, index),
    )
    const expectedLength = Math.min(chunkSize, snapshot.length - index * chunkSize)
    if (
      !chunk ||
      chunk.revision !== snapshot.revision ||
      typeof chunk.data !== 'string' ||
      chunk.data.length !== expectedLength
    ) {
      return undefined
    }
    parts.push(chunk.data)
  }
  try {
    const serialized = decodeURIComponent(parts.join(''))
    JSON.parse(serialized)
    return serialized
  } catch {
    return undefined
  }
}

/** 读取设置, 兼容 AdGuard 分块存储和旧版未分块的数据. */
export const readSetting = <T>(key: string, defaultValue?: T): T => {
  if (GM_info.scriptHandler !== 'AdGuard') {
    return GM_getValue(key, defaultValue)
  }
  const cached = states.get(key)
  if (cached) {
    return cached.serialized === undefined ? defaultValue : JSON.parse(cached.serialized)
  }
  const hasJournal = readJournal(key)
  const journalState = states.get(key)
  if (journalState) {
    return JSON.parse(journalState.serialized)
  }
  const manifest = GM_getValue<Manifest>(manifestKey(key))
  if (manifest !== undefined) {
    if (!manifest || manifest.version !== 1 || !isSnapshot(manifest.current)) {
      throw new Error(`无法读取设置 '${key}': 分块存储索引无效`)
    }
    for (const snapshot of [manifest.current, manifest.previous]) {
      if (!snapshot) {
        continue
      }
      const serialized = readSnapshot(key, snapshot)
      if (serialized !== undefined) {
        states.set(key, {
          serialized,
        })
        if (snapshot !== manifest.current) {
          console.warn(`设置 '${key}' 的最新写入不完整, 已恢复上一份完整数据`)
        }
        return JSON.parse(serialized)
      }
    }
  }
  const legacyValue = GM_getValue<T>(key)
  if ((manifest !== undefined || hasJournal) && legacyValue === undefined) {
    throw new Error(`无法读取设置 '${key}': 分块数据不完整, 请保留存储数据以便恢复`)
  }
  if (manifest !== undefined) {
    console.warn(`设置 '${key}' 的分块数据不完整, 已恢复旧版存储数据`)
  }
  states.set(key, { serialized: JSON.stringify(legacyValue) })
  return legacyValue === undefined ? defaultValue : legacyValue
}

/** 写入设置. 分块和提交记录均不可变, 避免较早的异步请求覆盖较新的数据. */
export const writeSetting = (key: string, value: unknown) => {
  if (GM_info.scriptHandler !== 'AdGuard') {
    GM_setValue(key, value)
    return
  }
  if (!states.has(key)) {
    readSetting(key)
  }
  const state = states.get(key)
  const serialized = JSON.stringify(value)
  if (serialized === undefined) {
    throw new Error(`无法保存设置 '${key}': 值不可序列化`)
  }
  if (serialized === state.serialized) {
    return
  }
  // 先编码再切分, 每块只含 ASCII, 即使传输再次编码也不会超过约 25 KB.
  const encoded = encodeURIComponent(serialized)
  const revision = `${pageId}-${++revisionNumber}`
  const oldValue: unknown =
    state.serialized === undefined ? undefined : JSON.parse(state.serialized)
  const newValue: unknown = JSON.parse(serialized)
  const oldEncoded = state.chunks ? encodeURIComponent(state.serialized) : ''
  const chunks: string[] = []
  const writes: [string, string][] = []
  for (let offset = 0, index = 0; offset < encoded.length; offset += chunkSize, index++) {
    const part = encoded.slice(offset, offset + chunkSize)
    if (state.chunks?.[index] && oldEncoded.slice(offset, offset + chunkSize) === part) {
      chunks.push(state.chunks[index])
    } else {
      const id = `${revision}-${index}`
      chunks.push(id)
      writes.push([`${journalPrefix}${key}:chunk:${id}`, part])
    }
  }
  const commit: Commit = {
    version: 2,
    timestamp: Math.max(Date.now(), lastTimestamp + 1),
    length: encoded.length,
    chunks,
    changedKeys:
      isRecord(oldValue) && isRecord(newValue)
        ? [...new Set([...Object.keys(oldValue), ...Object.keys(newValue)])].filter(
            name => JSON.stringify(oldValue[name]) !== JSON.stringify(newValue[name]),
          )
        : undefined,
  }
  const commitKey = `${journalPrefix}${key}:commit:${revision}`
  if (encodeURIComponent(JSON.stringify({ key: commitKey, value: commit })).length > 32768) {
    throw new Error(`无法保存设置 '${key}': 分块索引过大`)
  }
  writes.forEach(([name, part]) => GM_setValue(name, part))
  GM_setValue(commitKey, commit)
  // shortcut: 暂不清理历史记录; 引入回收前需验证跨标签页引用和 AdGuard 原生写入确认.
  lastTimestamp = commit.timestamp
  state.serialized = serialized
  state.chunks = chunks
}
