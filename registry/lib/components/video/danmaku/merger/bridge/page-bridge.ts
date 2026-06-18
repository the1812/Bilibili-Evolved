/* eslint-disable @typescript-eslint/ban-ts-comment, no-underscore-dangle, no-empty, no-empty-function, @typescript-eslint/no-empty-function, no-extend-native, no-loop-func, func-names, @typescript-eslint/no-use-before-define */
// @ts-nocheck
import { useScopedConsole } from '@/core/utils/log'

export const DM_MERGER_VERSION = '2.2'

const scopedConsole = useScopedConsole('弹幕合并器')
const dmLog = (...args) => scopedConsole.log(...args)

// --- 播放器 Store 捕获：注入页面主世界（油猴隔离沙箱 + blob 桥接）---
function dmMergerPageBridgeMain() {
  const w = window
  if (w.__dmMergerBridge) {
    return
  }
  w.__dmMergerBridge = true
  w.__dmMergerLoadedVersion = '1.6'
  w.__dmMergerBridgeInstalled = true
  w.__dmMergerStores = w.__dmMergerStores || null

  let lastWebpackPatchAt = 0
  const dmPageLog = (...args) => console.log('[弹幕合并器][页面]', ...args)

  const captureStores = (target, from) => {
    if (!target || typeof target !== 'object') {
      return false
    }
    let listStore = null
    let danmakuStore = null
    let mpdStore = null
    let configStore = null
    if (target.tag === 'DmListStore' && typeof target.appendDm === 'function') {
      listStore = target
      danmakuStore = target.danmakuStore || w.__dmMergerStores?.danmakuStore || null
      mpdStore = target.mpdStore || w.__dmMergerStores?.mpdStore
      configStore = target.configStore || w.__dmMergerStores?.configStore
    } else if (target.dmListStore?.appendDm) {
      listStore = target.dmListStore
      danmakuStore = target.danmakuStore || null
      mpdStore = target.mpdStore
      configStore = target.configStore
    } else {
      return false
    }
    const prev = w.__dmMergerStores?.dmListStore
    if (prev === listStore) {
      return true
    }
    w.__dmMergerStores = { dmListStore: listStore, danmakuStore, mpdStore, configStore }
    dmPageLog(prev ? 'Store 已更新' : 'Store 已捕获', {
      from: from || 'unknown',
      allDm: listStore.allDm?.length,
    })
    try {
      document.dispatchEvent(
        new CustomEvent('dm-merger-store-ready', {
          detail: { from: from || 'unknown', allDm: listStore.allDm?.length },
        }),
      )
    } catch (x) {}
    if (typeof w.__dmMergerUninstallCallHook === 'function') {
      w.__dmMergerUninstallCallHook()
    }
    return true
  }

  const getPlayerCore = () => {
    const p = w.player
    if (!p) {
      return null
    }
    let core = p.__core
    if (typeof core === 'function') {
      try {
        core = core.call(p)
      } catch (x) {
        try {
          core = core()
        } catch (y) {
          core = null
        }
      }
    }
    return core && typeof core === 'object' ? core : null
  }

  const getReactFiber = el => {
    if (!el) {
      return null
    }
    for (const k of Object.keys(el)) {
      if (k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')) {
        return el[k]
      }
    }
    return null
  }

  const scanFiberForStore = () => {
    try {
      w.player?.auxiliary?.openTabList?.()
    } catch (x) {}
    const seeds = [
      document.querySelector('.dm-info-row'),
      document.querySelector('.bui-long-list-list'),
      document.querySelector('.bpx-player-auxiliary-danmaku'),
      document.querySelector('.bpx-player-container'),
      document.querySelector('#bilibili-player'),
    ]
    for (const el of seeds) {
      let f = getReactFiber(el)
      for (let i = 0; i < 80 && f; i++) {
        const pools = [
          f.memoizedProps,
          f.pendingProps,
          f.stateNode,
          f.memoizedState?.memoizedState,
          f.memoizedState?.element?.props,
        ]
        for (const c of pools) {
          if (c?.dmListStore?.appendDm && captureStores(c, 'fiber')) {
            return true
          }
          if (c?.store?.dmListStore?.appendDm && captureStores(c.store, 'fiber.store')) {
            return true
          }
        }
        if (f.stateNode?.dmListStore?.appendDm && captureStores(f.stateNode, 'fiber.stateNode')) {
          return true
        }
        f = f.return
      }
    }
    return false
  }

  w.__dmMergerRefreshListUI = store => {
    if (!store?.setState) {
      return false
    }
    try {
      store.setState({
        count: store.allDm?.length ?? 0,
        viewCount: store.allDm?.length ?? 0,
      })
      dmPageLog('列表 UI 已刷新', { allDm: store.allDm?.length })
      return true
    } catch (x) {
      dmPageLog('列表 UI 刷新失败', x)
      return false
    }
  }

  w.__dmMergerResolveStores = () => {
    const p = w.player
    if (!p) {
      return { ok: false, reason: 'no_player' }
    }
    const core = getPlayerCore()
    if (core?.subStores && captureStores(core.subStores, 'core.subStores')) {
      return { ok: true, from: 'subStores', allDm: w.__dmMergerStores?.dmListStore?.allDm?.length }
    }
    if (core && (core.dmListStore || core.danmakuStore) && captureStores(core, 'player.__core')) {
      return { ok: true, from: '__core', allDm: core.dmListStore?.allDm?.length }
    }
    const ob = p.__ob__?.value
    if (ob?.dmListStore?.appendDm || ob?.danmakuStore) {
      captureStores(ob, 'player.__ob__')
      return { ok: true, from: '__ob__', allDm: ob.dmListStore?.allDm?.length }
    }
    if (scanFiberForStore()) {
      return { ok: true, from: 'fiber', allDm: w.__dmMergerStores?.dmListStore?.allDm?.length }
    }
    return { ok: false, reason: 'not_found' }
  }

  const patchWebpackDecompose = () => {
    const now = Date.now()
    if (now - lastWebpackPatchAt < 1500) {
      return { patched: 0, skipped: true }
    }
    lastWebpackPatchAt = now
    let wpRequire = null
    for (const key of Object.keys(w)) {
      if (!key.startsWith('webpackChunk')) {
        continue
      }
      try {
        w[key].push([
          [Math.random().toString(36).slice(2)],
          {},
          r => {
            wpRequire = r
          },
        ])
      } catch (x) {}
      if (wpRequire) {
        break
      }
    }
    let patched = 0
    if (wpRequire?.m) {
      for (const id of Object.keys(wpRequire.m)) {
        try {
          const exp = wpRequire(id)
          if (!exp || typeof exp !== 'object') {
            continue
          }
          for (const k of Object.keys(exp)) {
            const cls = exp[k]
            if (!cls?.prototype?.decomposeSubStores || cls.prototype.__dmMergerPatched) {
              continue
            }
            const orig = cls.prototype.decomposeSubStores
            cls.prototype.decomposeSubStores = function (e) {
              const r = orig.call(this, e)
              captureStores(e, 'webpack-decompose')
              if (this.subStores) {
                captureStores(this.subStores, 'webpack-subStores')
              }
              return r
            }
            cls.prototype.__dmMergerPatched = true
            patched++
          }
        } catch (x) {}
      }
    }
    if (wpRequire?.c) {
      for (const id of Object.keys(wpRequire.c)) {
        try {
          const exp = wpRequire.c[id]?.exports
          if (exp?.dmListStore && captureStores(exp, 'webpack-live')) {
            break
          }
          if (exp && typeof exp === 'object') {
            for (const k of Object.keys(exp)) {
              if (exp[k]?.dmListStore && captureStores(exp[k], `webpack-live:${k}`)) {
                break
              }
            }
          }
        } catch (x) {}
        if (w.__dmMergerStores?.dmListStore) {
          break
        }
      }
    }
    return { patched }
  }

  const scanPlayerForStore = () => {
    const resolved = w.__dmMergerResolveStores()
    if (resolved?.ok) {
      return true
    }
    const p = w.player
    if (!p) {
      return false
    }
    if (captureStores(p, 'player-root')) {
      return true
    }

    const seen = new WeakSet()
    const queue = [{ o: p, d: 0 }]
    while (queue.length) {
      const { o, d } = queue.shift()
      if (!o || typeof o !== 'object' || seen.has(o) || d > 8) {
        continue
      }
      seen.add(o)
      if (o.tag === 'DmListStore' && typeof o.appendDm === 'function') {
        captureStores(o, 'walk-DmListStore')
        return true
      }
      if (o.dmListStore?.appendDm && captureStores(o, 'player-walk')) {
        return true
      }
      if (o.danmakuStore?.dmListStore?.appendDm && captureStores(o.danmakuStore, 'danmakuStore')) {
        return true
      }
      for (const k of Object.keys(o)) {
        if (
          !/store|danmaku|dm|root|sub|state|component|graph|session/i.test(k) &&
          k !== 'subStores'
        ) {
          continue
        }
        try {
          const v = o[k]
          if (v && typeof v === 'object') {
            queue.push({ o: v, d: d + 1 })
          }
        } catch (x) {}
      }
    }
    return scanFiberForStore()
  }

  const hookNanoOnce = () => {
    if (!w.nano?.createPlayer || w.nano.__dmMergerHooked) {
      return
    }
    w.nano.__dmMergerHooked = true
    const orig = w.nano.createPlayer
    w.nano.createPlayer = function (...args) {
      const api = orig.apply(this, args)
      captureStores(api, 'nano.createPlayer')
      return api
    }
  }

  const hookPlayerEventsOnce = () => {
    const p = w.player
    if (!p?.on || w.__dmMergerPlayerHooked) {
      return
    }
    w.__dmMergerPlayerHooked = true
    const onCapture = () => scanPlayerForStore()
    ;[
      'PLAYER_STORE_MOUNTED',
      'Player_Store_Mounted',
      'PLAYER_GRAPH_FLATTEN',
      'danmaku-loaded',
      'dm-loaded',
      'segment',
    ].forEach(ev => {
      try {
        p.on(ev, onCapture)
      } catch (x) {}
    })
  }

  let callHookRestore = null
  const uninstallCallHook = () => {
    if (callHookRestore && Function.prototype.call !== callHookRestore) {
      Function.prototype.call = callHookRestore
    }
    w.__dmMergerCallHooked = false
  }
  w.__dmMergerUninstallCallHook = uninstallCallHook

  const installAppendDmCallHook = ttlMs => {
    if (w.__dmMergerCallHooked) {
      return
    }
    if (w.__dmMergerStores?.dmListStore?.appendDm) {
      return
    }
    w.__dmMergerCallHooked = true
    callHookRestore = Function.prototype.call
    Function.prototype.call = function (thisArg, ...args) {
      try {
        if (!w.__dmMergerStores?.dmListStore?.appendDm) {
          if (thisArg?.dmListStore?.appendDm && thisArg?.tag !== 'DmListStore') {
            captureStores(
              {
                danmakuStore: thisArg,
                dmListStore: thisArg.dmListStore,
                mpdStore: thisArg.mpdStore,
                configStore: thisArg.configStore,
              },
              'call-hook',
            )
          } else if (thisArg?.tag === 'DmListStore' && this === thisArg.appendDm) {
            captureStores(thisArg, 'call-hook-DmListStore')
          }
        }
      } catch (x) {}
      return callHookRestore.apply(this, [thisArg, ...args])
    }
    setTimeout(uninstallCallHook, ttlMs || 30000)
  }

  w.__dmMergerEnsureCapture = withCallHook => {
    w.__dmMergerResolveStores()
    hookNanoOnce()
    hookPlayerEventsOnce()
    scanPlayerForStore()
    patchWebpackDecompose()
    if (withCallHook) {
      installAppendDmCallHook(60000)
    }
  }

  w.__dmMergerBurstCapture = async () => {
    const p = w.player
    if (!p) {
      return false
    }
    const v = document.querySelector('video')
    const saved = {
      time: (typeof p.getCurrentTime === 'function' ? p.getCurrentTime() : v?.currentTime) || 0,
      paused: v ? v.paused : true,
    }
    const restore = () => {
      const t = Math.max(0, saved.time)
      try {
        p.seek(t)
      } catch (x) {}
      if (v) {
        try {
          v.currentTime = t
        } catch (x) {}
        if (saved.paused) {
          try {
            v.pause()
          } catch (x) {}
          try {
            p.pause?.()
          } catch (x) {}
        } else {
          try {
            p.play?.()
          } catch (x) {}
          try {
            v.play().catch(() => {})
          } catch (x) {}
        }
      }
    }
    try {
      w.__dmMergerEnsureCapture(true)
      const dur = p.getDuration?.() || 300
      const targets = [0, 5, 30, 90, 150, 300].filter(t => t < dur - 2)
      for (const t of targets) {
        if (w.__dmMergerStores?.dmListStore?.appendDm) {
          return true
        }
        try {
          p.seek(t)
        } catch (x) {}
        await new Promise(r => setTimeout(r, 900))
        w.__dmMergerResolveStores()
        scanPlayerForStore()
        patchWebpackDecompose()
      }
      return !!w.__dmMergerStores?.dmListStore?.appendDm
    } finally {
      await new Promise(r => setTimeout(r, 80))
      restore()
      setTimeout(restore, 150)
    }
  }

  w.__dmMergerDiag = () => {
    w.__dmMergerEnsureCapture(false)
    const st = w.__dmMergerStores
    const core = getPlayerCore()
    const diag = {
      hasPlayer: !!w.player,
      hasCore: !!core,
      coreHasDmList: !!core?.dmListStore,
      stores: !!st?.dmListStore,
      allDmLen: st?.dmListStore?.allDm?.length ?? null,
      listDomRows: document.querySelectorAll('.dm-info-row,.bui-long-list-item').length,
      dmArrayLen: w.player?.danmaku?.getDanmakuX?.()?.manager?.dataBase?.dmArray?.length ?? null,
      callHooked: !!w.__dmMergerCallHooked,
    }
    dmPageLog('诊断', diag)
    return diag
  }

  const hookPlayerAssignment = () => {
    if (w.__dmMergerPlayerAssignHooked) {
      return
    }
    const desc = Object.getOwnPropertyDescriptor(w, 'player')
    if (!desc || !desc.configurable) {
      return
    }
    let val = w.player
    try {
      Object.defineProperty(w, 'player', {
        configurable: true,
        enumerable: true,
        get() {
          return val
        },
        set(v) {
          val = v
          if (v) {
            dmPageLog('player 已赋值')
            scanPlayerForStore()
            hookPlayerEventsOnce()
          }
        },
      })
      w.__dmMergerPlayerAssignHooked = true
      if (val) {
        scanPlayerForStore()
        hookPlayerEventsOnce()
      }
    } catch (x) {}
  }

  const startDeferredWatcher = () => {
    if (w.__dmMergerDeferredWatcher) {
      return
    }
    w.__dmMergerDeferredWatcher = true
    const iv = setInterval(() => {
      hookNanoOnce()
      hookPlayerEventsOnce()
      hookPlayerAssignment()
      if (!w.__dmMergerStores?.dmListStore?.appendDm && w.player) {
        scanPlayerForStore()
      }
    }, 400)
    setTimeout(() => clearInterval(iv), 120000)
  }

  hookNanoOnce()
  hookPlayerEventsOnce()
  hookPlayerAssignment()
  startDeferredWatcher()
  dmPageLog('惰性桥接已安装')
}

export const injectPageBridge = (pageWin: () => Window) => {
  const w = pageWin()
  if (w.__dmMergerBridge) {
    return
  }
  const root = document.documentElement || document.head || document.body
  if (!root) {
    return
  }
  const src = `;(${dmMergerPageBridgeMain.toString()})();`
  const injectByBlob = () => {
    const blob = new Blob([src], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    const s = document.createElement('script')
    s.src = url
    s.onload = () => URL.revokeObjectURL(url)
    s.onerror = () => {
      URL.revokeObjectURL(url)
      injectInline()
    }
    root.appendChild(s)
    s.remove()
  }
  const injectInline = () => {
    const s = document.createElement('script')
    s.textContent = src
    root.appendChild(s)
    s.remove()
  }
  try {
    injectByBlob()
  } catch (e) {
    injectInline()
  }
  dmLog('页面桥接注入请求已发送')
}
