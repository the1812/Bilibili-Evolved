const DB_NAME = 'bilibili-evolved-wasm-output'
const DB_VERSION = 124

export const storeNames = {
  cache: 'cache',
} as const

async function database() {
  return new Promise((reslove: (db: IDBDatabase) => void, reject) => {
    const req = unsafeWindow.indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = reject
    req.onupgradeneeded = () => {
      const db = req.result
      for (const name of db.objectStoreNames) {
        db.deleteObjectStore(name)
      }
      Object.values(storeNames).forEach(v => {
        db.createObjectStore(v)
      })
    }
    req.onsuccess = () => reslove(req.result)
  })
}

async function objectStore(name: string, mode?: IDBTransactionMode) {
  return database().then(
    db =>
      new Promise((reslove: (db: IDBObjectStore) => void, reject) => {
        const tr = db.transaction(name, mode)
        reslove(tr.objectStore(name))
        tr.onerror = reject
      }),
  )
}

async function get(store: IDBObjectStore, key: IDBValidKey | IDBKeyRange) {
  return new Promise((reslove: (db: any) => void, reject) => {
    const res = store.get(key)
    res.onerror = reject
    res.onsuccess = () => reslove(res.result)
  })
}

async function put(store: IDBObjectStore, value: any, key?: IDBValidKey) {
  return new Promise((reslove: (db: IDBValidKey) => void, reject) => {
    const res = store.put(value, key)
    res.onerror = reject
    res.onsuccess = () => reslove(res.result)
  })
}

export async function getOrLoad<K extends keyof typeof storeNames, V>(
  storeName: K,
  key: IDBValidKey,
  loader: (key: IDBValidKey) => V,
) {
  const value: V = await objectStore(storeName).then(store => get(store, key))
  if (value) {
    return value
  }
  const newValue = await loader(key)
  await objectStore(storeName, 'readwrite').then(store => put(store, newValue, key))
  return newValue
}
