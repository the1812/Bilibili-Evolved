import { dmLog } from '../danmaku/log'
import type { DanmakuEngine } from '../danmaku/engine'
import type { NativeDanmakuApi } from '../danmaku/inject'
import type { ParsedDanmakuItem } from '../danmaku/parse'
import { formatPlayerNotReadyHint } from './helpers'
import { mergerToast } from '../ui/notify'

export interface InjectDanmakuMeta {
  id: string
  title?: string
  cid?: number | string
  author?: string
  pic?: string
  offset?: number
  bvid?: string
  groupTitle?: string
}

export interface InjectDanmakuResult {
  ok: boolean
  count: number
  screen: number
  list: boolean
  firstSec?: number | null
  reason?: string | null
  native?: boolean
}

export function createInjectDanmaku(nativeDanmaku: NativeDanmakuApi, engine: DanmakuEngine) {
  return async function injectDanmaku(
    danmakuList: ParsedDanmakuItem[],
    meta: InjectDanmakuMeta,
    silent = false,
    onProgress: ((phase: string) => void) | null = null,
  ): Promise<InjectDanmakuResult> {
    const emptyResult: InjectDanmakuResult = {
      ok: false,
      count: 0,
      screen: 0,
      list: false,
      reason: 'empty_input',
    }
    if (!danmakuList?.length) {
      if (!silent) {
        mergerToast('该视频没有可合并的弹幕')
      }
      return emptyResult
    }

    return nativeDanmaku.withPlaybackPreserved(async () => {
      onProgress?.('等待播放器')
      const playerReady = await nativeDanmaku.waitForPlayer(45000, onProgress)
      if (!playerReady || !engine.init()) {
        if (!silent) {
          const hint = formatPlayerNotReadyHint(nativeDanmaku.getPlayerReadiness(), 'merge')
          mergerToast(`弹幕引擎未就绪：${hint}`, 'error')
        }
        return {
          ok: false,
          count: danmakuList.length,
          screen: 0,
          list: false,
          reason: 'player_not_ready',
        }
      }

      const storeResolved = nativeDanmaku.resolveStoresDirect()
      dmLog('合并前 Store', storeResolved)
      if (!storeResolved?.ok) {
        onProgress?.('捕获列表 Store')
        nativeDanmaku.ensureCapture(true)
        await nativeDanmaku.burstCaptureStore()
      }

      engine.addSource(
        meta.id,
        danmakuList,
        {
          id: meta.id,
          title: meta.title,
          count: danmakuList.length,
          cid: meta.cid,
          author: meta.author,
          pic: meta.pic,
          offset: meta.offset || 0,
          bvid: meta.bvid,
          groupTitle: meta.groupTitle || meta.title,
        },
        true,
      )

      nativeDanmaku.installResyncHook(() => engine.sources)
      let sync = await nativeDanmaku.fullSyncAsync(engine.sources, onProgress)
      engine.lastListSync = !!sync.list
      engine.lastSyncResult = sync

      if (!sync.list && !nativeDanmaku.hasListStore()) {
        onProgress?.('等待列表 Store')
        const gotList =
          (await nativeDanmaku.waitForListStore(8000, onProgress)) ||
          (await nativeDanmaku.burstCaptureStore())
        if (gotList || nativeDanmaku.hasListStore()) {
          sync = await nativeDanmaku.fullSyncAsync(engine.sources, onProgress)
          engine.lastListSync = !!sync.list
          engine.lastSyncResult = sync
        } else {
          nativeDanmaku.waitForListStore(20000, onProgress).then(async late => {
            if (!late || !engine.sources?.size) {
              return
            }
            const retry = await nativeDanmaku.fullSyncAsync(engine.sources, undefined)
            engine.lastListSync = !!retry.list
            engine.lastSyncResult = retry
            document.dispatchEvent(new CustomEvent('dm-sources-updated'))
          })
        }
      } else if (!sync.list && nativeDanmaku.hasListStore()) {
        sync = await nativeDanmaku.fullSyncAsync(engine.sources, onProgress)
        engine.lastListSync = !!sync.list
        engine.lastSyncResult = sync
      }

      const ok = !!sync.ok
      const result: InjectDanmakuResult = {
        ok,
        count: danmakuList.length,
        screen: sync.screen || 0,
        list: !!engine.lastListSync,
        firstSec: sync.firstSec ?? null,
        reason: ok ? null : sync.reason || 'inject_failed',
        native: true,
      }

      if (result.screen > 0 || result.list) {
        nativeDanmaku.openListPanel()
      }

      document.dispatchEvent(new CustomEvent('dm-sources-updated'))

      dmLog('injectDanmaku 结果', {
        ok: result.ok,
        count: result.count,
        screen: result.screen,
        list: result.list,
        hasStore: nativeDanmaku.hasListStore(),
        diag: nativeDanmaku.diag(),
      })

      if (!silent) {
        if (!ok) {
          let msg = `原生注入失败（${danmakuList.length} 条未写入播放器）`
          if (result.reason === 'player_not_ready') {
            msg = 'DanmakuX 未就绪，请稍后重试'
          } else if (!nativeDanmaku.hasListStore()) {
            msg += '。请先播放视频几秒后再合并'
          }
          mergerToast(msg, 'error')
        } else {
          const hint = nativeDanmaku.formatInjectHint({
            count: result.count,
            screen: result.screen,
            list: result.list,
            firstSec: result.firstSec,
          })
          if (result.screen > 0 && !result.list) {
            mergerToast(
              `画面已注入 ${result.count} 条；列表未同步。请在设置 → 弹幕合并器 →「重新同步列表」`,
              'warn',
            )
          } else {
            mergerToast(`已注入原生弹幕 ${result.count} 条${hint ? `（${hint}）` : ''}`)
          }
        }
      }

      return result
    })
  }
}
