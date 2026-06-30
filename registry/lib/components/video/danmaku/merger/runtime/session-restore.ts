import { dmLog } from '../danmaku/log'
import type { DanmakuEngine } from '../danmaku/engine'
import type { ParsedDanmakuItem } from '../danmaku/parse'
import { getStorage } from '../storage'
import { mergerProgressToast, mergerProgressToastDone, mergerToast } from '../ui/notify'
import type { InjectDanmakuMeta, InjectDanmakuResult } from './inject-flow'

export interface MergerApi {
  getDanmaku: (cid: number | string) => Promise<string>
}

/** 读取会话存储，兼容历史大小写 BV 键名 */
export const readMergerSessionRaw = (videoId: string): string | undefined => {
  const storage = getStorage()
  const canonicalKey = `dm_merger_store_${videoId}`
  let raw = storage.get<string>(canonicalKey)
  if (raw || !/^BV[a-zA-Z0-9]{10}$/i.test(videoId)) {
    return raw
  }
  const legacyKeys = [
    `dm_merger_store_${videoId.toUpperCase()}`,
    `dm_merger_store_${videoId.toLowerCase()}`,
  ].filter((key, index, keys) => keys.indexOf(key) === index && key !== canonicalKey)
  for (const legacyKey of legacyKeys) {
    raw = storage.get<string>(legacyKey)
    if (raw) {
      storage.set(canonicalKey, raw)
      storage.trackKey(canonicalKey)
      return raw
    }
  }
  return undefined
}

const normalizeRestoreMeta = (meta: InjectDanmakuMeta): InjectDanmakuMeta | null => {
  const { cid } = meta
  if (cid == null) {
    return null
  }
  const id = meta.id || (meta.bvid ? `${meta.bvid}_${cid}` : String(cid))
  return { ...meta, id: String(id) }
}

export function createSessionRestore(deps: {
  engine: DanmakuEngine
  api: MergerApi
  parseDanmaku: (xml: string) => ParsedDanmakuItem[]
  batchRestoreDanmaku: (
    entries: Array<{ list: ParsedDanmakuItem[]; meta: InjectDanmakuMeta }>,
  ) => Promise<InjectDanmakuResult>
  onRestored: () => void
}) {
  let restoreSessionStoreKey: string | null = null
  let restoreSessionPromise: Promise<void> | null = null

  return async function tryRestoreSession() {
    const videoId = deps.engine.getCurrentVideoId()
    const storeKey = `dm_merger_store_${videoId}`
    const raw = readMergerSessionRaw(videoId)
    if (!raw) {
      return
    }
    if (deps.engine.sources?.size) {
      return
    }

    if (restoreSessionPromise && restoreSessionStoreKey === storeKey) {
      await restoreSessionPromise
      return
    }

    restoreSessionStoreKey = storeKey
    restoreSessionPromise = (async () => {
      try {
        const sources = JSON.parse(raw) as InjectDanmakuMeta[]
        if (!Array.isArray(sources) || sources.length === 0) {
          return
        }

        dmLog('开始恢复会话', { storeKey, count: sources.length })
        mergerProgressToast(`正在恢复 ${sources.length} 个任务...`)

        const metas = sources
          .map(rawMeta => normalizeRestoreMeta(rawMeta))
          .filter((meta): meta is InjectDanmakuMeta => meta != null)
        const fetchResults = await Promise.all(
          metas.map(async meta => {
            try {
              if (meta.cid == null || meta.cid === '') {
                return null
              }
              const xml = await deps.api.getDanmaku(meta.cid)
              return { list: deps.parseDanmaku(xml), meta }
            } catch (err) {
              dmLog('单源弹幕拉取失败', { id: meta.id, err })
              return null
            }
          }),
        )
        const entries = fetchResults.filter(
          (entry): entry is { list: ParsedDanmakuItem[]; meta: InjectDanmakuMeta } => entry != null,
        )

        if (!entries.length) {
          mergerProgressToastDone()
          mergerToast('恢复失败，请手动重新合并', 'error')
          return
        }

        const result = await deps.batchRestoreDanmaku(entries)
        const restored = deps.engine.sources?.size || 0

        mergerProgressToastDone()
        if (result.ok || restored > 0) {
          mergerToast(`已恢复 ${restored}/${sources.length} 个弹幕源`)
        } else {
          mergerToast('恢复失败，请手动重新合并', 'error')
        }
        deps.onRestored()
      } catch (err) {
        dmLog('恢复会话异常', err)
        mergerProgressToastDone()
      }
    })()

    try {
      await restoreSessionPromise
    } finally {
      if (restoreSessionStoreKey === storeKey) {
        restoreSessionStoreKey = null
        restoreSessionPromise = null
      }
    }
  }
}
