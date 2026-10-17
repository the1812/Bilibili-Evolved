import { dmLog } from '../danmaku/log'
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
  getDanmaku: (
    cid: number | string,
    options?: {
      videoId?: string
      aid?: number | string
      forceFallback?: boolean
      unavailableReason?: string
    },
  ) => Promise<
    { list: import('../danmaku/parse').ParsedDanmakuItem[]; mode: string; notice?: string } | string
  >
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
  // 保留存储里的 viewCid。缺失时不要整批写成当前分P，否则多分P源会串到同一P。
  // 旧数据无 viewCid 时，sourceMatchesViewCid 会回落到 meta.cid 比对。
  const viewCid = meta.viewCid != null && String(meta.viewCid) !== '' ? meta.viewCid : undefined
  return { ...meta, id: String(id), viewCid }
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
              const fetched = await withTimeout(
                deps.api.getDanmaku(meta.cid, {
                  videoId: meta.bvid || String(meta.cid),
                  aid: meta.aid,
                }),
                45000,
                `拉取弹幕 ${meta.cid}`,
              )
              const list = typeof fetched === 'string' ? deps.parseDanmaku(fetched) : fetched.list
              if (!list.length) {
                return null
              }
              const nextMeta = { ...meta }
              if (typeof fetched !== 'string') {
                nextMeta.fetchMode = fetched.mode
                nextMeta.fetchNotice = fetched.notice
                if (fetched.notice) {
                  // 恢复阶段统一在结束后提示；这里先写入 meta
                }
              }
              return { list, meta: nextMeta }
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

        const result = await withTimeout(deps.batchRestoreDanmaku(entries), 60000, '注入恢复弹幕')
        const restored = deps.engine.sources?.size || 0
        const activeCount = deps.engine.getActiveSources()?.size || 0
        const injected = !!(result.list || result.screen > 0)

        mergerProgressToastDone()
        if (result.ok || restored > 0) {
          const fallbackCount = entries.filter(
            entry => entry.meta.fetchMode === 'protobuf-fallback',
          ).length
          let msg = `已恢复 ${restored}/${sources.length} 个弹幕源`
          if (activeCount === 0 && restored > 0) {
            msg += '（当前分P无匹配源，切回对应分P后自动注入）'
            mergerToast(msg, 'warn')
          } else if (!injected && activeCount > 0) {
            msg += '（注入未完成，将自动重试）'
            mergerToast(msg, 'warn')
          } else if (fallbackCount > 0) {
            msg += `（其中 ${fallbackCount} 个视频不可用，已走历史弹幕兜底）`
            mergerToast(msg, 'warn')
          } else {
            mergerToast(msg)
          }
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
