import * as BiliApi from '../api/bilibili'
import { injectPageBridge, DM_MERGER_VERSION } from '../bridge/page-bridge'
import { DanmakuEngine } from '../danmaku/engine'
import { createNativeDanmaku } from '../danmaku/inject'
import { dmLog, dmWarn } from '../danmaku/log'
import { parseDanmakuXml } from '../danmaku/parse'
import { registerMergerMaintenance } from '../maintenance'
import { getStorage } from '../storage'
import type { MergerUiHost } from '../ui/contracts'
import { initQuickMerge } from '../ui/quick-merge-host'
import { createMergerVueHost, type MergerVueHostDeps } from '../ui/vue-host'
/* eslint-disable no-underscore-dangle */
import {
  extractBvid,
  formatDurationShort,
  loadPartModeState,
  parseDurationText,
  resolveSourceBvid,
  savePartModeState,
} from './helpers'
import { createBatchRestoreDanmaku, createInjectDanmaku } from './inject-flow'
import { createSessionRestore, readMergerSessionRaw } from './session-restore'
import { bindStoreReadyListener } from './store-ready'

let mergerUiHost: MergerUiHost | null = null
let mergerVueHostCtrl: ReturnType<typeof createMergerVueHost> | null = null
let quickMergeHost: ReturnType<typeof initQuickMerge> | null = null
let mergerVideoChangeHandler: (() => void) | null = null
let mergerBadgeClickHandler: ((event: MouseEvent) => void) | null = null
let mergerLastVideoId: string | null = null

export const getMergerUiHost = (): MergerUiHost | null => mergerUiHost

export const handleMergerVideoChange = (): void => {
  mergerVideoChangeHandler?.()
}

export type MergerCleanup = () => void

export const initDanmakuMerger = (): MergerCleanup => {
  dmLog('BE 组件版 v2.0 已加载（Vue UI）')
  const pageWin = () => unsafeWindow
  try {
    pageWin().__dmMergerLoadedVersion = DM_MERGER_VERSION
  } catch {
    // 页面环境受限时跳过版本标记
  }

  const nativeDanmaku = createNativeDanmaku(pageWin)
  const engine = new DanmakuEngine(nativeDanmaku)

  const API = {
    search: BiliApi.searchVideos,
    getView: BiliApi.getView,
    getDanmaku: BiliApi.getDanmakuXml,
    getPageList: BiliApi.getPageList,
  }

  const parseDanmaku = parseDanmakuXml
  const injectDanmaku = createInjectDanmaku(nativeDanmaku, engine)
  const batchRestoreDanmaku = createBatchRestoreDanmaku(nativeDanmaku, engine)

  const tryRestoreSession = createSessionRestore({
    engine,
    api: API,
    parseDanmaku,
    batchRestoreDanmaku,
    onRestored: () => mergerVueHostCtrl?.refreshBadge(),
  })

  bindStoreReadyListener(
    nativeDanmaku as Parameters<typeof bindStoreReadyListener>[0],
    engine,
    tryRestoreSession,
  )

  const scheduleInitialRestore = () => {
    let attempts = 0
    const maxAttempts = 120
    const tick = async () => {
      try {
        attempts += 1
        const videoId = engine.getCurrentVideoId()
        const raw = readMergerSessionRaw(videoId)
        if (!raw) {
          return
        }
        if (engine.sources?.size) {
          return
        }
        await tryRestoreSession()
        if (!engine.sources?.size && attempts < maxAttempts) {
          window.setTimeout(tick, 500)
        }
      } catch (err) {
        dmWarn('恢复调度失败', err)
        if (attempts < maxAttempts) {
          window.setTimeout(tick, 500)
        }
      }
    }
    window.setTimeout(tick, 300)
  }

  registerMergerMaintenance({
    diagAsync: timeout => nativeDanmaku.diagAsync(timeout) as Promise<unknown>,
    waitForPlayer: (timeout, onProgress) =>
      nativeDanmaku.waitForPlayer(timeout, onProgress) as Promise<boolean>,
    getPlayerReadiness: () => nativeDanmaku.getPlayerReadiness(),
    ensureCapture: force => nativeDanmaku.ensureCapture(force),
    hasListStore: () => nativeDanmaku.hasListStore(),
    burstCaptureStore: () => nativeDanmaku.burstCaptureStore(),
    fullSyncAsync: sources => nativeDanmaku.fullSyncAsync(sources, undefined),
    getStores: () => nativeDanmaku.getStores(),
    getEngineSources: () => engine.sources,
    listMergerStoreKeys: () => getStorage().listMergerKeys(),
    deleteStorageKey: key => getStorage().delete(key),
  })

  mergerVideoChangeHandler = () => {
    const videoId = engine.getCurrentVideoId()
    if (mergerLastVideoId !== null && mergerLastVideoId !== videoId) {
      engine.reset()
      mergerVueHostCtrl?.handleVideoChange()
    }
    mergerLastVideoId = videoId
    void tryRestoreSession()
  }

  mergerVueHostCtrl = createMergerVueHost({
    engine: engine as unknown as MergerVueHostDeps['engine'],
    api: API,
    parseDanmaku,
    injectDanmaku: injectDanmaku as unknown as MergerVueHostDeps['injectDanmaku'],
    extractBvid,
    resolveSourceBvid,
    formatDurationShort,
    parseDurationText,
    loadPartModeState,
    savePartModeState,
    hasListStore: () => nativeDanmaku.hasListStore(),
    formatInjectHint: result => nativeDanmaku.formatInjectHint(result),
    onSourcesUpdated: () => undefined,
  })
  mergerUiHost = mergerVueHostCtrl.host
  try {
    pageWin().__dmMergerDebug = () => {
      const managerMask = document.querySelector('.dm-manager-modal-mask')
      const sampleBtn = document.querySelector('.dm-quick-merge-btn') as HTMLElement | null
      const videoId = engine.getCurrentVideoId()
      const storeKey = `dm_merger_store_${videoId}`
      const storedRaw = readMergerSessionRaw(videoId)
      let storedCount = 0
      try {
        storedCount = storedRaw ? (JSON.parse(storedRaw) as unknown[]).length : 0
      } catch {
        storedCount = -1
      }
      return {
        version: DM_MERGER_VERSION,
        videoId,
        storeKey,
        storedCount,
        memorySources: engine.getSources().length,
        badge: !!document.querySelector('#dm-merger-count'),
        badgeText: document.querySelector('#dm-merger-count')?.textContent?.trim() ?? null,
        managerMask: !!managerMask,
        managerMaskDisplay: managerMask ? getComputedStyle(managerMask).display : null,
        hostReady: !!mergerUiHost,
        quickMerge: quickMergeHost?.getDebugInfo?.() ?? null,
        sampleQuickBtnOpacity: sampleBtn ? getComputedStyle(sampleBtn).opacity : null,
        openManager: () => mergerUiHost?.openManagerModal(),
      }
    }
  } catch {
    // 页面环境受限时跳过调试入口
  }
  mergerBadgeClickHandler = (event: MouseEvent) => {
    const { target } = event
    if (!(target instanceof Element) || !target.closest('#dm-merger-count')) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    mergerUiHost?.openManagerModal()
  }
  document.addEventListener('click', mergerBadgeClickHandler, true)
  // 恢复不依赖弹窗挂载，提前调度避免等 Vue chunk 加载
  scheduleInitialRestore()
  mergerVueHostCtrl.mount().then(() => {
    mergerVueHostCtrl?.refreshBadge()
  })

  quickMergeHost = initQuickMerge({
    getSources: () => engine.getSources() as Array<{ bvid?: string }>,
    removeSource: id => engine.removeSource(id),
    api: API,
    parseDanmaku,
    injectDanmaku: injectDanmaku as unknown as Parameters<
      typeof initQuickMerge
    >[0]['injectDanmaku'],
    formatInjectHint: result => nativeDanmaku.formatInjectHint(result),
    onSourcesUpdated: () => mergerVueHostCtrl?.refreshBadge(),
  })

  injectPageBridge(pageWin)
  document.addEventListener('DOMContentLoaded', () => {
    if (!pageWin().__dmMergerBridge) {
      dmWarn('DOM 就绪后补注页面桥接')
      injectPageBridge(pageWin)
    }
  })

  return () => {
    if (mergerBadgeClickHandler) {
      document.removeEventListener('click', mergerBadgeClickHandler, true)
      mergerBadgeClickHandler = null
    }
    registerMergerMaintenance(null)
    quickMergeHost?.destroy()
    quickMergeHost = null
    mergerVueHostCtrl?.destroy()
    mergerVueHostCtrl = null
    mergerUiHost = null
    mergerVideoChangeHandler = null
    mergerLastVideoId = null
    engine.reset()
  }
}
