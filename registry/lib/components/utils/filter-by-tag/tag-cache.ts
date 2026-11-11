/**
 * 视频标签的获取与本地缓存.
 *
 * 首页推荐流的视频卡片上并不直接渲染标签, 只渲染 UP 主、播放量等信息,
 * 所以必须按 bvid 逐个查询 b 站接口才能拿到标签.
 * 查询结果会缓存在 localStorage 中, 避免同一视频被反复请求.
 */

export interface TagCacheEntry {
  /** 标签名列表, 查询失败时为 null */
  tags: string[] | null
  /** 写入时间戳 */
  time: number
}

const CACHE_KEY = 'bilibili-evolved-filter-by-tag-cache'
/** 成功结果缓存 7 天 */
const SUCCESS_TTL = 7 * 24 * 60 * 60 * 1000
/** 失败结果只缓存 10 分钟, 避免接口临时抽风导致长期误判 */
const FAILURE_TTL = 10 * 60 * 1000
/** 缓存条目上限, 超出后按时间淘汰最旧的一半 */
const MAX_ENTRIES = 4000
/** 同时进行的请求数上限, 过高容易触发 b 站的 -412 风控 */
const MAX_CONCURRENT = 2

type CacheMap = Record<string, TagCacheEntry>

let cache: CacheMap | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null
let running = 0
const queue: (() => void)[] = []

const loadCache = (): CacheMap => {
  if (cache !== null) {
    return cache
  }
  cache = {}
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CacheMap
      if (parsed && typeof parsed === 'object') {
        cache = parsed
        return cache
      }
    }
  } catch (error) {
    // 缓存损坏时直接重建, 不应该影响主流程
    console.warn('[filter-by-tag] 读取标签缓存失败, 将重新建立缓存', error)
  }
  return cache as CacheMap
}

const scheduleSave = () => {
  if (saveTimer !== null) {
    return
  }
  saveTimer = setTimeout(() => {
    saveTimer = null
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(loadCache()))
    } catch (error) {
      console.warn('[filter-by-tag] 写入标签缓存失败', error)
    }
  }, 1000)
}

const trimCache = (map: CacheMap) => {
  const keys = Object.keys(map)
  if (keys.length <= MAX_ENTRIES) {
    return
  }
  keys
    .sort((a, b) => map[a].time - map[b].time)
    .slice(0, keys.length - MAX_ENTRIES)
    .forEach(key => {
      delete map[key]
    })
}

const isFresh = (entry: TagCacheEntry) => {
  const ttl = entry.tags === null ? FAILURE_TTL : SUCCESS_TTL
  return Date.now() - entry.time < ttl
}

const withSlot = async <T>(task: () => Promise<T>): Promise<T> => {
  if (running >= MAX_CONCURRENT) {
    await new Promise<void>(resolve => queue.push(() => resolve()))
  }
  running += 1
  try {
    return await task()
  } finally {
    running -= 1
    const next = queue.shift()
    if (next) {
      next()
    }
  }
}

const requestTags = async (bvid: string): Promise<string[] | null> => {
  try {
    const response = await fetch(
      `https://api.bilibili.com/x/tag/archive/tags?bvid=${encodeURIComponent(bvid)}`,
      { credentials: 'include' },
    )
    if (!response.ok) {
      return null
    }
    const json = (await response.json()) as {
      code: number
      data?: { tag_name?: string }[]
    }
    if (json.code !== 0 || !Array.isArray(json.data)) {
      return null
    }
    return json.data.map(item => (item?.tag_name ?? '').trim()).filter(tag => tag.length > 0)
  } catch (error) {
    console.warn(`[filter-by-tag] 获取 ${bvid} 的标签失败`, error)
    return null
  }
}

/** 只读缓存, 不发起请求. 未命中时返回 undefined. */
export const getCachedTags = (bvid: string): string[] | null | undefined => {
  const entry = loadCache()[bvid]
  if (!entry || !isFresh(entry)) {
    return undefined
  }
  return entry.tags
}

/** 获取标签, 命中缓存时同步返回, 否则排队请求. 失败返回 null. */
export const getTags = async (bvid: string): Promise<string[] | null> => {
  const cached = getCachedTags(bvid)
  if (cached !== undefined) {
    return cached
  }
  const tags = await withSlot(() => requestTags(bvid))
  const map = loadCache()
  map[bvid] = { tags, time: Date.now() }
  trimCache(map)
  scheduleSave()
  return tags
}

export const clearTagCache = () => {
  cache = {}
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.warn('[filter-by-tag] 清空标签缓存失败', error)
  }
}

export const getCacheSize = () => Object.keys(loadCache()).length
