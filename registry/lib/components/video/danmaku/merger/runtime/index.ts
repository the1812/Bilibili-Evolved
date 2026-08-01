import * as BiliApi from '../api/bilibili'
import { injectPageBridge, DM_MERGER_VERSION } from '../bridge/page-bridge'
import { DanmakuEngine } from '../danmaku/engine'
import { createNativeDanmaku } from '../danmaku/inject'
import { dmLog, dmWarn } from '../danmaku/log'
import { parseDanmakuXml } from '../danmaku/parse'
import { registerMergerMaintenance } from '../maintenance'
import { getStorage } from '../storage'
import type { MergerUiHost } from '../ui/contracts'
import { mergerToast } from '../ui/notify'
import { initQuickMerge } from '../ui/quick-merge-host'
import { createMergerVueHost, type MergerVueHostDeps } from '../ui/vue-host'
import { discardTimeStop, initTimeStop } from '../time-stop'
import {
  isSameDanmakuText,
  parseSourceIdFromDmid,
  readDanmakuTextFromElement,
  readDmidFromContext,
  resolveSourceIdByText,
} from '../time-stop/source-id'
/* eslint-disable no-underscore-dangle */
import {
  extractBvid,
  formatDurationShort,
  getCurrentPageCid,
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
let mergerVideoChangeHandler: ((ids?: { aid: string; cid: string }) => void) | null = null
let mergerBadgeClickHandler: ((event: MouseEvent) => void) | null = null
let mergerLastVideoId: string | null = null
let mergerLastCid: string | null = null

export const getMergerUiHost = (): MergerUiHost | null => mergerUiHost

export const handleMergerVideoChange = (ids?: { aid: string; cid: string }): void => {
  mergerVideoChangeHandler?.(ids)
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
    // 视频仍在走 XML；已删/空壳走 protobuf 兜底
    getDanmaku: BiliApi.fetchDanmakuForMerge,
    getPageList: BiliApi.getPageList,
  }

  // 兼容旧路径：若仍传入 xml 字符串则本地解析
  const parseDanmaku = (input: string | ReturnType<typeof parseDanmakuXml>) =>
    typeof input === 'string' ? parseDanmakuXml(input) : input
  const injectDanmaku = createInjectDanmaku(nativeDanmaku, engine)
  const batchRestoreDanmaku = createBatchRestoreDanmaku(nativeDanmaku, engine)

  // 时停：悬停已合并弹幕后点「时停」，拖进度再「恢复」写回源偏移
  const timeStopCleanup = initTimeStop({
    getCurrentTime: () => {
      const p = unsafeWindow.player as
        | { getCurrentTime?: () => number }
        | undefined
      if (p && typeof p.getCurrentTime === 'function') {
        return Number(p.getCurrentTime()) || 0
      }
      const v = document.querySelector('video')
      return v ? Number(v.currentTime) || 0 : 0
    },
    hasSource: id => !!engine.sources?.has(String(id)),
    // bpx 画面层通常不挂 data-dmid：文案反查 + 原生 allDm dmid 回落
    resolveSourceIdFromElement: el => {
      const text = readDanmakuTextFromElement(el)
      if (!text) {
        return null
      }
      // 1) 引擎源 list 文案（XML 原文，无列表前缀）
      if (engine.sources?.size) {
        const sources = Array.from(engine.sources.entries()).map(([id, source]) => ({
          id: String(id),
          texts: (source.list || []).map((dm: { text?: string }) => String(dm?.text || '')),
        }))
        const fromEngine = resolveSourceIdByText(text, sources)
        if (fromEngine) {
          return fromEngine
        }
      }
      // 2) 原生列表已注入项：text 可能带【BVxxx】前缀，dmid 带 dmmerger_
      try {
        const page = pageWin() as Window & {
          __dmMergerStores?: { dmListStore?: { allDm?: Array<{ dmid?: string; text?: string }> } }
        }
        const allDm = page.__dmMergerStores?.dmListStore?.allDm
        if (Array.isArray(allDm) && allDm.length) {
          const hits = new Set<string>()
          for (const item of allDm) {
            const dmid = String(item?.dmid || '')
            if (!dmid.startsWith('dmmerger_')) {
              continue
            }
            if (!isSameDanmakuText(text, item?.text)) {
              continue
            }
            const sid = parseSourceIdFromDmid(dmid)
            if (sid) {
              hits.add(sid)
            }
          }
          if (hits.size === 1) {
            return Array.from(hits)[0]
          }
          // 仅一个合并源时，放宽为该源
          if (engine.sources?.size === 1 && hits.size > 0) {
            return String(Array.from(engine.sources.keys())[0])
          }
        }
      } catch {
        // ignore
      }
      // 3) 只有一个合并源：任意命中合并弹幕文本即归到该源
      if (engine.sources?.size === 1) {
        const onlyId = String(Array.from(engine.sources.keys())[0])
        const source = engine.sources.get(onlyId)
        const ok = (source?.list || []).some((dm: { text?: string }) => isSameDanmakuText(text, dm?.text))
        if (ok) {
          return onlyId
        }
      }
      return null
    },
    isElementOfSource: (sourceId, el) => {
      const byDmid = parseSourceIdFromDmid(readDmidFromContext(el))
      if (byDmid) {
        return byDmid === String(sourceId)
      }
      const text = readDanmakuTextFromElement(el)
      if (!text) {
        return false
      }
      const source = engine.sources?.get(String(sourceId))
      if (source && (source.list || []).some((dm: { text?: string }) => isSameDanmakuText(text, dm?.text))) {
        return true
      }
      // 引擎 list 未命中时，用原生 allDm 的 dmid 归属判断
      try {
        const page = pageWin() as Window & {
          __dmMergerStores?: { dmListStore?: { allDm?: Array<{ dmid?: string; text?: string }> } }
        }
        const allDm = page.__dmMergerStores?.dmListStore?.allDm
        if (!Array.isArray(allDm)) {
          return false
        }
        return allDm.some(item => {
          const dmid = String(item?.dmid || '')
          if (parseSourceIdFromDmid(dmid) !== String(sourceId)) {
            return false
          }
          return isSameDanmakuText(text, item?.text)
        })
      } catch {
        return false
      }
    },
    applyOffsetDelta: async (sourceId, delta) => {
      try {
        const source = engine.sources?.get(String(sourceId))
        if (!source) {
          return
        }
        const oldOffset = Number(source.meta.offset) || 0
        // 偏移只保留 1 位小数，避免浮点尾巴写进状态
        const nextOffset = Math.round((oldOffset + delta) * 10) / 10
        // updateSource 内会 rebuildList + saveState
        engine.updateSource(sourceId, { offset: nextOffset })
        document.dispatchEvent(new CustomEvent('dm-sources-updated'))
      } catch (err) {
        dmWarn('时停写回偏移失败', err)
        mergerToast('时停写回偏移失败', 'error')
        // 抛回给 release，避免错误 toast 后再弹成功
        throw err
      }
    },
    toast: (message, level = 'info') => mergerToast(message, level),
  })

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

  /** 同 BV 切换分 P：先清除合并弹幕，仅注入属于当前分 P 的源 */
  const schedulePartResync = (targetCid: string) => {
    engine.setActiveViewCid(targetCid)
    let attempts = 0
    const maxAttempts = 60
    const tick = async () => {
      attempts += 1
      try {
        const playerReady = await nativeDanmaku.waitForPlayer(8000, null)
        if (!playerReady) {
          if (attempts < maxAttempts) {
            window.setTimeout(tick, 500)
          }
          return
        }
        nativeDanmaku.purgeMerged()
        const activeSources = engine.getActiveSources()
        if (!activeSources?.size) {
          mergerVueHostCtrl?.refreshBadge()
          dmLog('分P切换，当前分P无合并源', { targetCid })
          return
        }
        nativeDanmaku.ensureCapture(true)
        if (!nativeDanmaku.hasListStore()) {
          if (BiliApi.isPakkuActive()) {
            await nativeDanmaku.waitForListStore(12000, null)
          } else {
            await nativeDanmaku.burstCaptureStore()
          }
        }
        nativeDanmaku.installResyncHook(() => engine.getActiveSources())
        const result = await nativeDanmaku.fullSyncAsync(activeSources, undefined, {
          allowBurstCapture: !BiliApi.isPakkuActive(),
        })
        engine.lastListSync = !!result.list
        engine.lastSyncResult = result
        if (result.screen > 0 || result.list || attempts >= maxAttempts) {
          mergerVueHostCtrl?.refreshBadge()
          dmLog('分P切换补同步完成', { targetCid, attempts, result })
          return
        }
      } catch (err) {
        dmWarn('分P切换补同步失败', err)
      }
      if (attempts < maxAttempts) {
        window.setTimeout(tick, 500)
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
    fullSyncAsync: sources =>
      nativeDanmaku.fullSyncAsync(sources ?? engine.getActiveSources(), undefined, {
        allowBurstCapture: !BiliApi.isPakkuActive(),
      }),
    getStores: () => nativeDanmaku.getStores(),
    getEngineSources: () => engine.getActiveSources(),
    listMergerStoreKeys: () => getStorage().listMergerKeys(),
    deleteStorageKey: key => getStorage().delete(key),
  })

  mergerVideoChangeHandler = ids => {
    const videoId = engine.getCurrentVideoId()
    const cid = ids?.cid != null && !Array.isArray(ids.cid) ? String(ids.cid) : null
    const videoChanged = mergerLastVideoId !== null && mergerLastVideoId !== videoId
    const partChanged =
      !videoChanged && cid !== null && mergerLastCid !== null && mergerLastCid !== cid

    if (videoChanged) {
      discardTimeStop()
      engine.reset()
      mergerVueHostCtrl?.handleVideoChange()
      mergerLastCid = null
    } else if (partChanged && cid !== null) {
      discardTimeStop()
      dmLog('分P切换', { from: mergerLastCid, to: cid })
      nativeDanmaku.purgeMerged()
      schedulePartResync(cid)
      // 分 P 切换时刷新搜索预填，不关闭已打开的搜索弹窗
      mergerVueHostCtrl?.handlePartChange()
    }

    mergerLastVideoId = videoId
    if (cid !== null) {
      mergerLastCid = cid
      engine.setActiveViewCid(cid)
    } else {
      const pageCid = getCurrentPageCid()
      if (pageCid) {
        engine.setActiveViewCid(pageCid)
      }
    }

    if (!partChanged && !engine.sources?.size) {
      tryRestoreSession().catch(err => {
        dmLog('恢复触发异常', err)
      })
    }
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
  const initialCid = getCurrentPageCid()
  if (initialCid) {
    engine.setActiveViewCid(initialCid)
  }
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
    timeStopCleanup()
    registerMergerMaintenance(null)
    quickMergeHost?.destroy()
    quickMergeHost = null
    mergerVueHostCtrl?.destroy()
    mergerVueHostCtrl = null
    mergerUiHost = null
    mergerVideoChangeHandler = null
    mergerLastVideoId = null
    mergerLastCid = null
    engine.reset()
  }
}
