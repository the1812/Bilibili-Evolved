import { dmLog } from '../danmaku/log'
import { getCurrentPageCid } from './helpers'
import type { DanmakuEngine } from '../danmaku/engine'
import type { ParsedDanmakuItem } from '../danmaku/parse'
import { getStorage } from '../storage'
import { mergerProgressToast, mergerProgressToastDone, mergerToast } from '../ui/notify'
import type { InjectDanmakuMeta, InjectDanmakuResult } from './inject-flow'

const withTimeout = async <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timer: number | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error(`${label}超时（${ms}ms）`)), ms)
      }),
    ])
  } finally {
    if (timer != null) {
      window.clearTimeout(timer)
    }
  }
}

export interface MergerApi {
  /** 直接返回解析后的弹幕列表（protobuf 优先） */
  getDanmaku: (
    cid: number | string,
    aid?: number | string,
  ) => Promise<ParsedDanmakuItem[]>
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
  const viewCid = meta.viewCid ?? getCurrentPageCid() ?? undefined
  return { ...meta, id: String(id), viewCid }
}

export function createSessionRestore(deps: {
  engine: DanmakuEngine
  api: MergerApi
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
    // 已有源但全部 list 为空：视为恢复失败残留，允许重新拉取
    if (deps.engine.sources?.size) {
      const hasAnyDm = Array.from(deps.engine.sources.values()).some(
        source => Array.isArray(source.list) && source.list.length > 0,
      )
      if (hasAnyDm) {
        return
      }
      dmLog('内存源均为空列表，重新拉取恢复', {
        storeKey,
        sources: deps.engine.sources.size,
      })
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
              const list = await withTimeout(
                deps.api.getDanmaku(meta.cid, meta.aid),
                45000,
                `拉取弹幕 ${meta.cid}`,
              )
              if (!list.length) {
                dmLog('单源弹幕为空，跳过', { id: meta.id, cid: meta.cid })
                return null
              }
              return { list, meta }
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

        // 清掉空 list 残留，避免 addSource 覆盖前仍显示 0 条
        if (deps.engine.sources?.size) {
          Array.from(deps.engine.sources.keys()).forEach(id => {
            const source = deps.engine.sources?.get(id)
            if (!source?.list?.length) {
              deps.engine.sources?.delete(id)
            }
          })
        }

        const result = await withTimeout(
          deps.batchRestoreDanmaku(entries),
          60000,
          '注入恢复弹幕',
        )
        const restored = deps.engine.sources?.size || 0
        const restoredWithDm = entries.filter(e => e.list.length > 0).length

        mergerProgressToastDone()
        if (result.ok || restored > 0) {
          mergerToast(`已恢复 ${restoredWithDm}/${sources.length} 个弹幕源`)
        } else {
          mergerToast('恢复失败，请手动重新合并', 'error')
        }
        deps.onRestored()
      } catch (err) {
        dmLog('恢复会话异常', err)
        mergerProgressToastDone()
        mergerToast('恢复超时或失败，可手动重新合并', 'error')
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
