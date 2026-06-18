import type { DanmakuEngine } from '../danmaku/engine'
import type { ParsedDanmakuItem } from '../danmaku/parse'
import { getStorage } from '../storage'
import { mergerProgressToast, mergerProgressToastDone, mergerToast } from '../ui/notify'
import type { InjectDanmakuMeta, InjectDanmakuResult } from './inject-flow'

export interface MergerApi {
  getDanmaku: (cid: number | string) => Promise<string>
}

export function createSessionRestore(deps: {
  engine: DanmakuEngine
  api: MergerApi
  parseDanmaku: (xml: string) => ParsedDanmakuItem[]
  injectDanmaku: (
    list: ParsedDanmakuItem[],
    meta: InjectDanmakuMeta,
    silent?: boolean,
  ) => Promise<InjectDanmakuResult>
  onRestored: () => void
}) {
  let restoreSessionStoreKey: string | null = null
  let restoreSessionPromise: Promise<void> | null = null

  return async function tryRestoreSession() {
    const videoId = deps.engine.getCurrentVideoId()
    const storeKey = `dm_merger_store_${videoId}`
    const raw = getStorage().get<string>(storeKey)
    if (!raw) {
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

        mergerProgressToast(`正在恢复 ${sources.length} 个任务...`)

        let restored = 0
        for (const meta of sources) {
          try {
            const { cid } = meta
            if (cid == null) {
              continue
            }
            const xml = await deps.api.getDanmaku(cid)
            const list = deps.parseDanmaku(xml)
            const result = await deps.injectDanmaku(list, meta, true)
            if (result.ok) {
              restored++
            }
          } catch {
            // 单源恢复失败时继续下一源
          }
        }

        mergerProgressToastDone()
        mergerToast(
          restored > 0
            ? `已恢复 ${restored}/${sources.length} 个弹幕源`
            : '恢复失败，请手动重新合并',
          restored > 0 ? 'success' : 'error',
        )
        deps.onRestored()
      } catch {
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
