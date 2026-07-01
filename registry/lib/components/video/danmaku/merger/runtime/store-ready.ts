/* eslint-disable no-underscore-dangle */
import { dmLog } from '../danmaku/log'
import type { DanmakuEngine } from '../danmaku/engine'
import type { NativeDanmakuApi } from '../danmaku/inject'

type NativeDanmakuRuntime = NativeDanmakuApi & {
  _storeReadyRetryTimer?: number
  _fullSyncing?: boolean
}

declare global {
  interface Window {
    __dmMergerStoreReadyListener?: boolean
  }
}

/** Store 就绪后自动补同步画面与列表，或在无内存源时尝试恢复会话 */
export function bindStoreReadyListener(
  nativeDanmaku: NativeDanmakuRuntime,
  engine: DanmakuEngine,
  tryRestoreSession?: () => Promise<void>,
): void {
  if (window.__dmMergerStoreReadyListener) {
    return
  }
  window.__dmMergerStoreReadyListener = true

  document.addEventListener('dm-merger-store-ready', () => {
    clearTimeout(nativeDanmaku._storeReadyRetryTimer)
    nativeDanmaku._storeReadyRetryTimer = window.setTimeout(async () => {
      if (nativeDanmaku._fullSyncing) {
        return
      }
      if (!engine.sources?.size) {
        await tryRestoreSession?.()
        return
      }
      const activeSources = engine.getActiveSources()
      if (!activeSources?.size) {
        return
      }
      if (!nativeDanmaku.getDataBase() || !nativeDanmaku.hasListStore()) {
        return
      }
      const screen = nativeDanmaku.countMergedOnScreen()
      const listLen = nativeDanmaku.getStores()?.dmListStore?.allDm?.length ?? 0
      if (screen > 0 && listLen > 0) {
        return
      }
      dmLog('Store 就绪，自动补同步', { screen, listLen, sources: activeSources.size })
      const result = await nativeDanmaku.fullSyncAsync(activeSources, undefined)
      engine.lastListSync = !!result.list
      engine.lastSyncResult = result
      document.dispatchEvent(new CustomEvent('dm-sources-updated'))
      if (result.screen > 0 || result.list) {
        dmLog('自动补同步完成', result)
      }
    }, 1200)
  })
}
