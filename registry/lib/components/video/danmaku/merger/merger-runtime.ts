/* eslint-disable */
// @ts-nocheck
import { addStyle, removeStyle } from '@/core/style'
import { useScopedConsole } from '@/core/utils/log'

const DM_MERGER_STYLE_NAME = 'danmakuMerger'
const DM_MERGER_KEYS_INDEX = 'dm_merger_keys_index'

const trackMergerStorageKey = key => {
  try {
    const keys = JSON.parse(String(GM_getValue(DM_MERGER_KEYS_INDEX, '[]')))
    if (!keys.includes(key)) {
      keys.push(key)
      GM_setValue(DM_MERGER_KEYS_INDEX, JSON.stringify(keys))
    }
  } catch (e) { /* ignore */ }
}

const listMergerStorageKeys = () => {
  try {
    return JSON.parse(String(GM_getValue(DM_MERGER_KEYS_INDEX, '[]')))
  } catch (e) {
    return []
  }
}

const console = useScopedConsole('弹幕合并器')
const dmLog = (...args) => console.log(...args)
const dmWarn = (...args) => console.warn(...args)

export type MergerCleanup = () => void

const bindMonkeyApisFromBe = () => {
  const host = (
    typeof unsafeWindow !== 'undefined' ? unsafeWindow : globalThis
  ) as typeof globalThis & {
    bilibiliEvolved?: {
      monkeyApis?: {
        GM_getValue?: typeof GM_getValue
        GM_setValue?: typeof GM_setValue
        GM_deleteValue?: typeof GM_deleteValue
        GM_xmlhttpRequest?: typeof GM_xmlhttpRequest
        GM_info?: typeof GM_info
      }
    }
  }
  const monkey = host.bilibiliEvolved?.monkeyApis
  if (!monkey) return
  const g = globalThis as Record<string, unknown>
  for (const [name, fn] of Object.entries(monkey)) {
    if (typeof fn === 'function' && typeof g[name] !== 'function') {
      g[name] = fn
    }
  }
}

export const initDanmakuMerger = (): MergerCleanup => {
  bindMonkeyApisFromBe()
  dmLog('BE 组件版 v1.6 已加载（addStyle）')
  const menuCommandIds = []
  const registerMergerMenu = (name, fn) => {
    if (typeof GM_registerMenuCommand !== 'function') {
      dmWarn('GM_registerMenuCommand 不可用，跳过菜单项:', name)
      return
    }
    menuCommandIds.push(GM_registerMenuCommand(name, fn))
  }
        const pageWin = () => unsafeWindow
    try { pageWin().__dmMergerLoadedVersion = '1.6'; } catch (e) { }

    // --- 播放器 Store 捕获：注入页面主世界（油猴隔离沙箱 + blob 桥接）---
    function dmMergerPageBridgeMain() {
        const w = window;
        if (w.__dmMergerBridge) return;
        w.__dmMergerBridge = true;
        w.__dmMergerLoadedVersion = '1.6';
        w.__dmMergerBridgeInstalled = true;
        w.__dmMergerStores = w.__dmMergerStores || null;

        let lastWebpackPatchAt = 0;
        const dmPageLog = (...args) => console.log('[弹幕合并器][页面]', ...args);

        const captureStores = (target, from) => {
            if (!target || typeof target !== 'object') return false;
            let listStore = null;
            let danmakuStore = null;
            let mpdStore = null;
            let configStore = null;
            if (target.tag === 'DmListStore' && typeof target.appendDm === 'function') {
                listStore = target;
                danmakuStore = target.danmakuStore || w.__dmMergerStores?.danmakuStore || null;
                mpdStore = target.mpdStore || w.__dmMergerStores?.mpdStore;
                configStore = target.configStore || w.__dmMergerStores?.configStore;
            } else if (target.dmListStore?.appendDm) {
                listStore = target.dmListStore;
                danmakuStore = target.danmakuStore || null;
                mpdStore = target.mpdStore;
                configStore = target.configStore;
            } else {
                return false;
            }
            const prev = w.__dmMergerStores?.dmListStore;
            if (prev === listStore) return true;
            w.__dmMergerStores = { dmListStore: listStore, danmakuStore, mpdStore, configStore };
            dmPageLog(prev ? 'Store 已更新' : 'Store 已捕获', { from: from || 'unknown', allDm: listStore.allDm?.length });
            try {
                document.dispatchEvent(new CustomEvent('dm-merger-store-ready', {
                    detail: { from: from || 'unknown', allDm: listStore.allDm?.length },
                }));
            } catch (x) { }
            if (typeof w.__dmMergerUninstallCallHook === 'function') w.__dmMergerUninstallCallHook();
            return true;
        };

        const getPlayerCore = () => {
            const p = w.player;
            if (!p) return null;
            let core = p.__core;
            if (typeof core === 'function') {
                try { core = core.call(p); } catch (x) { try { core = core(); } catch (y) { core = null; } }
            }
            return core && typeof core === 'object' ? core : null;
        };

        const getReactFiber = (el) => {
            if (!el) return null;
            for (const k of Object.keys(el)) {
                if (k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')) return el[k];
            }
            return null;
        };

        const scanFiberForStore = () => {
            try { w.player?.auxiliary?.openTabList?.(); } catch (x) { }
            const seeds = [
                document.querySelector('.dm-info-row'),
                document.querySelector('.bui-long-list-list'),
                document.querySelector('.bpx-player-auxiliary-danmaku'),
                document.querySelector('.bpx-player-container'),
                document.querySelector('#bilibili-player'),
            ];
            for (const el of seeds) {
                let f = getReactFiber(el);
                for (let i = 0; i < 80 && f; i++) {
                    const pools = [
                        f.memoizedProps,
                        f.pendingProps,
                        f.stateNode,
                        f.memoizedState?.memoizedState,
                        f.memoizedState?.element?.props,
                    ];
                    for (const c of pools) {
                        if (c?.dmListStore?.appendDm && captureStores(c, 'fiber')) return true;
                        if (c?.store?.dmListStore?.appendDm && captureStores(c.store, 'fiber.store')) return true;
                    }
                    if (f.stateNode?.dmListStore?.appendDm && captureStores(f.stateNode, 'fiber.stateNode')) return true;
                    f = f.return;
                }
            }
            return false;
        };

        w.__dmMergerRefreshListUI = (store) => {
            if (!store?.setState) return false;
            try {
                store.setState({
                    count: store.allDm?.length ?? 0,
                    viewCount: store.allDm?.length ?? 0,
                });
                dmPageLog('列表 UI 已刷新', { allDm: store.allDm?.length });
                return true;
            } catch (x) {
                dmPageLog('列表 UI 刷新失败', x);
                return false;
            }
        };

        w.__dmMergerResolveStores = () => {
            const p = w.player;
            if (!p) return { ok: false, reason: 'no_player' };
            const core = getPlayerCore();
            if (core?.subStores && captureStores(core.subStores, 'core.subStores')) {
                return { ok: true, from: 'subStores', allDm: w.__dmMergerStores?.dmListStore?.allDm?.length };
            }
            if (core && (core.dmListStore || core.danmakuStore) && captureStores(core, 'player.__core')) {
                return { ok: true, from: '__core', allDm: core.dmListStore?.allDm?.length };
            }
            const ob = p.__ob__?.value;
            if (ob?.dmListStore?.appendDm || ob?.danmakuStore) {
                captureStores(ob, 'player.__ob__');
                return { ok: true, from: '__ob__', allDm: ob.dmListStore?.allDm?.length };
            }
            if (scanFiberForStore()) {
                return { ok: true, from: 'fiber', allDm: w.__dmMergerStores?.dmListStore?.allDm?.length };
            }
            return { ok: false, reason: 'not_found' };
        };

        const patchWebpackDecompose = () => {
            const now = Date.now();
            if (now - lastWebpackPatchAt < 1500) return { patched: 0, skipped: true };
            lastWebpackPatchAt = now;
            let wpRequire = null;
            for (const key of Object.keys(w)) {
                if (!key.startsWith('webpackChunk')) continue;
                try { w[key].push([[Math.random().toString(36).slice(2)], {}, (r) => { wpRequire = r; }]); } catch (x) { }
                if (wpRequire) break;
            }
            let patched = 0;
            if (wpRequire?.m) {
                for (const id of Object.keys(wpRequire.m)) {
                    try {
                        const exp = wpRequire(id);
                        if (!exp || typeof exp !== 'object') continue;
                        for (const k of Object.keys(exp)) {
                            const cls = exp[k];
                            if (!cls?.prototype?.decomposeSubStores || cls.prototype.__dmMergerPatched) continue;
                            const orig = cls.prototype.decomposeSubStores;
                            cls.prototype.decomposeSubStores = function (e) {
                                const r = orig.call(this, e);
                                captureStores(e, 'webpack-decompose');
                                if (this.subStores) captureStores(this.subStores, 'webpack-subStores');
                                return r;
                            };
                            cls.prototype.__dmMergerPatched = true;
                            patched++;
                        }
                    } catch (x) { }
                }
            }
            if (wpRequire?.c) {
                for (const id of Object.keys(wpRequire.c)) {
                    try {
                        const exp = wpRequire.c[id]?.exports;
                        if (exp?.dmListStore && captureStores(exp, 'webpack-live')) break;
                        if (exp && typeof exp === 'object') {
                            for (const k of Object.keys(exp)) {
                                if (exp[k]?.dmListStore && captureStores(exp[k], `webpack-live:${k}`)) break;
                            }
                        }
                    } catch (x) { }
                    if (w.__dmMergerStores?.dmListStore) break;
                }
            }
            return { patched };
        };

        const scanPlayerForStore = () => {
            const resolved = w.__dmMergerResolveStores();
            if (resolved?.ok) return true;
            const p = w.player;
            if (!p) return false;
            if (captureStores(p, 'player-root')) return true;

            const seen = new WeakSet();
            const queue = [{ o: p, d: 0 }];
            while (queue.length) {
                const { o, d } = queue.shift();
                if (!o || typeof o !== 'object' || seen.has(o) || d > 8) continue;
                seen.add(o);
                if (o.tag === 'DmListStore' && typeof o.appendDm === 'function') {
                    captureStores(o, 'walk-DmListStore');
                    return true;
                }
                if (o.dmListStore?.appendDm && captureStores(o, 'player-walk')) return true;
                if (o.danmakuStore?.dmListStore?.appendDm && captureStores(o.danmakuStore, 'danmakuStore')) return true;
                for (const k of Object.keys(o)) {
                    if (!/store|danmaku|dm|root|sub|state|component|graph|session/i.test(k) && k !== 'subStores') continue;
                    try {
                        const v = o[k];
                        if (v && typeof v === 'object') queue.push({ o: v, d: d + 1 });
                    } catch (x) { }
                }
            }
            return scanFiberForStore();
        };

        const hookNanoOnce = () => {
            if (!w.nano?.createPlayer || w.nano.__dmMergerHooked) return;
            w.nano.__dmMergerHooked = true;
            const orig = w.nano.createPlayer;
            w.nano.createPlayer = function (...args) {
                const api = orig.apply(this, args);
                captureStores(api, 'nano.createPlayer');
                return api;
            };
        };

        const hookPlayerEventsOnce = () => {
            const p = w.player;
            if (!p?.on || w.__dmMergerPlayerHooked) return;
            w.__dmMergerPlayerHooked = true;
            const onCapture = () => scanPlayerForStore();
            ['PLAYER_STORE_MOUNTED', 'Player_Store_Mounted', 'PLAYER_GRAPH_FLATTEN', 'danmaku-loaded', 'dm-loaded', 'segment'].forEach((ev) => {
                try { p.on(ev, onCapture); } catch (x) { }
            });
        };

        let callHookRestore = null;
        const uninstallCallHook = () => {
            if (callHookRestore && Function.prototype.call !== callHookRestore) {
                Function.prototype.call = callHookRestore;
            }
            w.__dmMergerCallHooked = false;
        };
        w.__dmMergerUninstallCallHook = uninstallCallHook;

        const installAppendDmCallHook = (ttlMs) => {
            if (w.__dmMergerCallHooked) return;
            if (w.__dmMergerStores?.dmListStore?.appendDm) return;
            w.__dmMergerCallHooked = true;
            callHookRestore = Function.prototype.call;
            Function.prototype.call = function (thisArg, ...args) {
                try {
                    if (!w.__dmMergerStores?.dmListStore?.appendDm) {
                        if (thisArg?.dmListStore?.appendDm && thisArg?.tag !== 'DmListStore') {
                            captureStores({
                                danmakuStore: thisArg,
                                dmListStore: thisArg.dmListStore,
                                mpdStore: thisArg.mpdStore,
                                configStore: thisArg.configStore,
                            }, 'call-hook');
                        } else if (thisArg?.tag === 'DmListStore' && this === thisArg.appendDm) {
                            captureStores(thisArg, 'call-hook-DmListStore');
                        }
                    }
                } catch (x) { }
                return callHookRestore.apply(this, [thisArg, ...args]);
            };
            setTimeout(uninstallCallHook, ttlMs || 30000);
        };

        w.__dmMergerEnsureCapture = (withCallHook) => {
            w.__dmMergerResolveStores();
            hookNanoOnce();
            hookPlayerEventsOnce();
            scanPlayerForStore();
            patchWebpackDecompose();
            if (withCallHook) installAppendDmCallHook(60000);
        };

        w.__dmMergerBurstCapture = async () => {
            const p = w.player;
            if (!p) return false;
            const v = document.querySelector('video');
            const saved = {
                time: (typeof p.getCurrentTime === 'function' ? p.getCurrentTime() : v?.currentTime) || 0,
                paused: v ? v.paused : true,
            };
            const restore = () => {
                const t = Math.max(0, saved.time);
                try { p.seek(t); } catch (x) { }
                if (v) {
                    try { v.currentTime = t; } catch (x) { }
                    if (saved.paused) {
                        try { v.pause(); } catch (x) { }
                        try { p.pause?.(); } catch (x) { }
                    } else {
                        try { p.play?.(); } catch (x) { }
                        try { v.play().catch(() => { }); } catch (x) { }
                    }
                }
            };
            try {
                w.__dmMergerEnsureCapture(true);
                const dur = p.getDuration?.() || 300;
                const targets = [0, 5, 30, 90, 150, 300].filter((t) => t < dur - 2);
                for (const t of targets) {
                    if (w.__dmMergerStores?.dmListStore?.appendDm) return true;
                    try { p.seek(t); } catch (x) { }
                    await new Promise((r) => setTimeout(r, 900));
                    w.__dmMergerResolveStores();
                    scanPlayerForStore();
                    patchWebpackDecompose();
                }
                return !!w.__dmMergerStores?.dmListStore?.appendDm;
            } finally {
                await new Promise((r) => setTimeout(r, 80));
                restore();
                setTimeout(restore, 150);
            }
        };

        w.__dmMergerDiag = () => {
            w.__dmMergerEnsureCapture(false);
            const st = w.__dmMergerStores;
            const core = getPlayerCore();
            const diag = {
                hasPlayer: !!w.player,
                hasCore: !!core,
                coreHasDmList: !!core?.dmListStore,
                stores: !!st?.dmListStore,
                allDmLen: st?.dmListStore?.allDm?.length ?? null,
                listDomRows: document.querySelectorAll('.dm-info-row,.bui-long-list-item').length,
                dmArrayLen: w.player?.danmaku?.getDanmakuX?.()?.manager?.dataBase?.dmArray?.length ?? null,
                callHooked: !!w.__dmMergerCallHooked,
            };
            dmPageLog('诊断', diag);
            return diag;
        };

        const hookPlayerAssignment = () => {
            if (w.__dmMergerPlayerAssignHooked) return;
            const desc = Object.getOwnPropertyDescriptor(w, 'player');
            if (!desc || !desc.configurable) return;
            let val = w.player;
            try {
                Object.defineProperty(w, 'player', {
                    configurable: true,
                    enumerable: true,
                    get() { return val; },
                    set(v) {
                        val = v;
                        if (v) {
                            dmPageLog('player 已赋值');
                            scanPlayerForStore();
                            hookPlayerEventsOnce();
                        }
                    },
                });
                w.__dmMergerPlayerAssignHooked = true;
                if (val) {
                    scanPlayerForStore();
                    hookPlayerEventsOnce();
                }
            } catch (x) { }
        };

        const startDeferredWatcher = () => {
            if (w.__dmMergerDeferredWatcher) return;
            w.__dmMergerDeferredWatcher = true;
            const iv = setInterval(() => {
                hookNanoOnce();
                hookPlayerEventsOnce();
                hookPlayerAssignment();
                if (!w.__dmMergerStores?.dmListStore?.appendDm && w.player) scanPlayerForStore();
            }, 400);
            setTimeout(() => clearInterval(iv), 120000);
        };

        hookNanoOnce();
        hookPlayerEventsOnce();
        hookPlayerAssignment();
        startDeferredWatcher();
        dmPageLog('惰性桥接已安装');
    }

    const injectPageBridge = () => {
        const w = pageWin();
        if (w.__dmMergerBridge) return;
        const root = document.documentElement || document.head || document.body;
        if (!root) return;
        const src = `;(${dmMergerPageBridgeMain.toString()})();`;
        const injectByBlob = () => {
            const blob = new Blob([src], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            const s = document.createElement('script');
            s.src = url;
            s.onload = () => URL.revokeObjectURL(url);
            s.onerror = () => {
                URL.revokeObjectURL(url);
                injectInline();
            };
            root.appendChild(s);
            s.remove();
        };
        const injectInline = () => {
            const s = document.createElement('script');
            s.textContent = src;
            root.appendChild(s);
            s.remove();
        };
        try {
            injectByBlob();
        } catch (e) {
            injectInline();
        }
        dmLog('页面桥接注入请求已发送');
    };
    const DM_MERGER_PREFIX = 'dmmerger_';

    // --- 原生弹幕桥接（屏幕 + 右侧列表双写）---
    const NativeDanmaku = {
        page() {
            return pageWin();
        },
        getPlayerCore() {
            const p = this.page().player;
            if (!p) return null;
            let core = p.__core;
            if (typeof core === 'function') {
                try { core = core.call(p); } catch (e) {
                    try { core = core(); } catch (e2) { core = null; }
                }
            }
            return core && typeof core === 'object' ? core : null;
        },
        assignStores(target, from, logResult = false) {
            if (!target || typeof target !== 'object') return null;
            const w = this.page();
            let listStore = null;
            if (target.tag === 'DmListStore' && typeof target.appendDm === 'function') {
                listStore = target;
                if (w.__dmMergerStores?.dmListStore === listStore) {
                    return { ok: true, from, allDm: listStore.allDm?.length ?? null, cached: true };
                }
                w.__dmMergerStores = {
                    dmListStore: listStore,
                    danmakuStore: target.danmakuStore || w.__dmMergerStores?.danmakuStore || null,
                    mpdStore: target.mpdStore || w.__dmMergerStores?.mpdStore,
                    configStore: target.configStore || w.__dmMergerStores?.configStore,
                };
                const r = { ok: true, from, allDm: listStore.allDm?.length ?? null };
                if (logResult) dmLog('Store 直捕', r);
                return r;
            }
            if (!target.dmListStore && !target.danmakuStore) return null;
            listStore = target.dmListStore;
            if (w.__dmMergerStores?.dmListStore === listStore) {
                return { ok: true, from, allDm: listStore?.allDm?.length ?? null, cached: true };
            }
            w.__dmMergerStores = {
                dmListStore: target.dmListStore,
                danmakuStore: target.danmakuStore,
                mpdStore: target.mpdStore,
                configStore: target.configStore,
            };
            const r = { ok: true, from, allDm: target.dmListStore?.allDm?.length ?? null };
            if (logResult) dmLog('Store 直捕', r);
            return r;
        },
        getReactFiber(el) {
            if (!el) return null;
            for (const k of Object.keys(el)) {
                if (k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')) return el[k];
            }
            return null;
        },
        scanFiberForStore() {
            const w = this.page();
            try { w.player?.auxiliary?.openTabList?.(); } catch (e) { }
            const seeds = [
                document.querySelector('.dm-info-row'),
                document.querySelector('.bui-long-list-list'),
                document.querySelector('.bpx-player-auxiliary-danmaku'),
                document.querySelector('.bpx-player-container'),
                document.querySelector('#bilibili-player'),
            ];
            for (const el of seeds) {
                let f = this.getReactFiber(el);
                for (let i = 0; i < 80 && f; i++) {
                    const pools = [
                        f.memoizedProps,
                        f.pendingProps,
                        f.stateNode,
                        f.memoizedState?.memoizedState,
                        f.memoizedState?.element?.props,
                    ];
                    for (const c of pools) {
                        if (c?.dmListStore?.appendDm) {
                            const r = this.assignStores(c, 'fiber');
                            if (r) return r;
                        }
                        if (c?.store?.dmListStore?.appendDm) {
                            const r = this.assignStores(c.store, 'fiber.store');
                            if (r) return r;
                        }
                    }
                    if (f.stateNode?.dmListStore?.appendDm) {
                        const r = this.assignStores(f.stateNode, 'fiber.stateNode');
                        if (r) return r;
                    }
                    f = f.return;
                }
            }
            return null;
        },
        resolveStoresDirect(logResult = false) {
            const w = this.page();
            if (w.__dmMergerStores?.dmListStore?.appendDm) {
                return { ok: true, from: 'cached', allDm: w.__dmMergerStores.dmListStore.allDm?.length };
            }
            const p = w.player;
            if (!p) return { ok: false, reason: 'no_player' };

            const core = this.getPlayerCore();
            if (core?.subStores) {
                const r = this.assignStores(core.subStores, 'subStores', logResult);
                if (r) return r;
            }
            if (core?.dmListStore || core?.danmakuStore) {
                const r = this.assignStores(core, '__core', logResult);
                if (r) return r;
            }
            const ob = p.__ob__?.value;
            if (ob?.dmListStore || ob?.danmakuStore) {
                const r = this.assignStores(ob, '__ob__', logResult);
                if (r) return r;
            }

            const seen = new WeakSet();
            const queue = [{ o: p, d: 0 }];
            while (queue.length) {
                const { o, d } = queue.shift();
                if (!o || typeof o !== 'object' || seen.has(o) || d > 8) continue;
                seen.add(o);
                if (o.tag === 'DmListStore' && typeof o.appendDm === 'function') {
                    const r = this.assignStores(o, 'walk-DmListStore', logResult);
                    if (r) return r;
                }
                if (o.dmListStore?.appendDm) {
                    const r = this.assignStores(o, 'walk', logResult);
                    if (r) return r;
                }
                if (o.danmakuStore?.dmListStore?.appendDm) {
                    const r = this.assignStores(o.danmakuStore, 'danmakuStore', logResult);
                    if (r) return r;
                }
                for (const k of Object.keys(o)) {
                    if (!/store|danmaku|dm|root|sub|state|component|graph|session/i.test(k) && k !== 'subStores') continue;
                    try {
                        const v = o[k];
                        if (v && typeof v === 'object') queue.push({ o: v, d: d + 1 });
                    } catch (e) { }
                }
            }

            const fiber = this.scanFiberForStore();
            if (fiber) return fiber;
            return { ok: false, reason: 'not_found' };
        },
        getPlayer() {
            try {
                return this.page().player || null;
            } catch (e) {
                return null;
            }
        },
        getDataBase() {
            try {
                const p = this.getPlayer();
                return p?.danmaku?.getDanmakuX?.()?.manager?.dataBase || null;
            } catch (e) {
                return null;
            }
        },
        getPlayerReadiness() {
            const w = this.page();
            const p = this.getPlayer();
            const db = this.getDataBase();
            return {
                hasNano: !!w.nano,
                hasPlayer: !!p,
                hasDanmakuApi: !!p?.danmaku,
                hasDanmakuX: !!db,
                hasVideo: !!document.querySelector('video'),
                hasBpx: !!document.querySelector('.bpx-player-container,#bilibili-player'),
                playerInit: p?.isInitialized,
            };
        },
        getStores() {
            return this.page().__dmMergerStores;
        },
        hasListStore() {
            return typeof this.getStores()?.dmListStore?.appendDm === 'function';
        },
        ensureCapture(withCallHook = false) {
            const direct = this.resolveStoresDirect();
            if (direct?.ok) return;
            try {
                const w = this.page();
                const resolved = w.__dmMergerResolveStores?.();
                if (resolved?.ok) dmLog('Store 页面桥接', resolved);
                w.__dmMergerEnsureCapture?.(withCallHook);
                this.resolveStoresDirect();
            } catch (e) {
                dmWarn('ensureCapture 异常', e);
            }
        },
        refreshListUI(store) {
            if (!store?.setState) return false;
            try {
                store.setState({
                    count: store.allDm?.length ?? 0,
                    viewCount: store.allDm?.length ?? 0,
                });
                return true;
            } catch (e) {
                dmWarn('refreshListUI 失败', e);
                return false;
            }
        },
        diag() {
            this.ensureCapture(false);
            this.resolveStoresDirect(true);
            const w = this.page();
            const core = this.getPlayerCore();
            const st = w.__dmMergerStores;
            const ready = this.getPlayerReadiness();
            let hint = null;
            if (!ready.hasBpx && !ready.hasVideo) {
                hint = '当前页无播放器，请在视频页操作';
            } else if (!ready.hasPlayer) {
                hint = '播放器未挂载，请刷新或等待几秒后重试';
            } else if (!ready.hasDanmakuX) {
                hint = '请点击播放 2～5 秒以初始化弹幕引擎';
            } else if (!st?.dmListStore) {
                hint = '弹幕引擎已就绪，列表 Store 未捕获，点「重新同步列表」';
            }
            const diag = {
                bridgeInstalled: !!w.__dmMergerBridge,
                scriptVersion: w.__dmMergerLoadedVersion ?? null,
                ...ready,
                hasCore: !!core,
                coreHasDmList: !!core?.dmListStore,
                stores: !!st?.dmListStore,
                allDmLen: st?.dmListStore?.allDm?.length ?? null,
                dmArrayLen: this.getDataBase()?.dmArray?.length ?? null,
                hint,
            };
            dmLog('诊断', diag);
            return diag;
        },
        async diagAsync(timeout = 8000) {
            const start = Date.now();
            while (Date.now() - start < timeout) {
                const d = this.diag();
                if (d.hasDanmakuX) return d;
                this.ensureCapture(false);
                await new Promise((r) => setTimeout(r, 500));
            }
            return this.diag();
        },
        async burstCaptureStore() {
            const p = this.page().player;
            if (!p) return false;
            if (this.resolveStoresDirect().ok) return true;
            const saved = this.capturePlaybackState();
            try {
                const dur = p.getDuration?.() || 300;
                const targets = [0, 5, 30, 90, 150, 300].filter((t) => t < dur - 2);
                for (const t of targets) {
                    if (this.hasListStore()) return true;
                    try { p.seek(t); } catch (e) { }
                    await new Promise((r) => setTimeout(r, 1000));
                    if (this.resolveStoresDirect().ok) return true;
                }
                try {
                    const fn = this.page().__dmMergerBurstCapture;
                    if (typeof fn === 'function') return await fn();
                } catch (e) { }
                return this.hasListStore();
            } finally {
                await new Promise((r) => setTimeout(r, 80));
                this.restorePlaybackState(saved);
            }
        },
        waitForPlayer(timeout = 45000, onProgress) {
            if (this.getDataBase()) return Promise.resolve(true);
            this.ensureCapture(false);
            return new Promise((resolve) => {
                const w = this.page();
                const start = Date.now();
                let lastHookAt = 0;
                let triedWake = false;
                let callHookRequested = false;
                const tick = () => {
                    try {
                        const ready = this.getPlayerReadiness();
                        if (this.getDataBase()) return resolve(true);
                        if (ready.hasPlayer && !ready.hasDanmakuX) {
                            onProgress?.('播放器已挂载，等待弹幕引擎…');
                        } else if (!ready.hasPlayer) {
                            onProgress?.('等待播放器挂载…');
                        }
                        const elapsed = Date.now() - start;
                        if (elapsed - lastHookAt > 2000) {
                            lastHookAt = elapsed;
                            w.__dmMergerEnsureCapture?.(false);
                            if (!callHookRequested && elapsed > 8000 && !w.__dmMergerStores?.dmListStore?.appendDm) {
                                callHookRequested = true;
                                w.__dmMergerEnsureCapture?.(true);
                            }
                        }
                        if (!triedWake && elapsed > 4000 && ready.hasVideo && !ready.hasDanmakuX) {
                            triedWake = true;
                            const v = document.querySelector('video');
                            if (v?.paused) {
                                try { v.play().catch(() => { }); } catch (e) { }
                            }
                            try { w.player?.play?.(); } catch (e) { }
                        }
                    } catch (e) { }
                    const elapsed = Date.now() - start;
                    if (elapsed > timeout) return resolve(false);
                    onProgress?.(`等待就绪 ${Math.ceil((timeout - elapsed) / 1000)}s`);
                    setTimeout(tick, 350);
                };
                tick();
            });
        },
        waitForListStore(timeout = 12000, onProgress) {
            if (this.hasListStore()) return Promise.resolve(true);
            this.ensureCapture(true);
            return new Promise((resolve) => {
                const start = Date.now();
                const tick = () => {
                    try {
                        this.ensureCapture(false);
                        if (this.hasListStore()) return resolve(true);
                    } catch (e) { }
                    const elapsed = Date.now() - start;
                    if (elapsed > timeout) return resolve(false);
                    onProgress?.(`等待列表 Store ${Math.ceil((timeout - elapsed) / 1000)}s`);
                    setTimeout(tick, 500);
                };
                tick();
            });
        },
        yieldUI() {
            return new Promise((r) => setTimeout(r, 0));
        },
        capturePlaybackState() {
            const p = this.getPlayer();
            const v = document.querySelector('video');
            let time = 0;
            try {
                if (p && typeof p.getCurrentTime === 'function') time = p.getCurrentTime();
                else if (v) time = v.currentTime;
            } catch (e) { }
            return {
                time: Math.max(0, Number(time) || 0),
                paused: v ? !!v.paused : true,
                rate: v?.playbackRate || 1,
            };
        },
        restorePlaybackState(state) {
            if (!state || state.time == null) return;
            const p = this.getPlayer();
            const v = document.querySelector('video');
            const t = Math.max(0, state.time);
            const apply = () => {
                try { p?.seek?.(t); } catch (e) { }
                if (v) {
                    try { v.currentTime = t; } catch (e) { }
                    if (state.rate && v.playbackRate !== state.rate) {
                        try { v.playbackRate = state.rate; } catch (e) { }
                    }
                    if (state.paused) {
                        try { v.pause(); } catch (e) { }
                        try { p?.pause?.(); } catch (e) { }
                    } else {
                        try { p?.play?.(); } catch (e) { }
                        try { v.play().catch(() => { }); } catch (e) { }
                    }
                }
            };
            apply();
            setTimeout(apply, 80);
            setTimeout(apply, 250);
        },
        async withPlaybackPreserved(fn) {
            this._playbackPreserveDepth = (this._playbackPreserveDepth || 0) + 1;
            if (this._playbackPreserveDepth === 1) {
                this._playbackSavedState = this.capturePlaybackState();
            }
            try {
                return await fn();
            } finally {
                this._playbackPreserveDepth--;
                if (this._playbackPreserveDepth === 0) {
                    const saved = this._playbackSavedState;
                    this._playbackSavedState = null;
                    await this.yieldUI();
                    await new Promise((r) => setTimeout(r, 50));
                    this.restorePlaybackState(saved);
                }
            }
        },
        listPrefix(meta) {
            const bv = extractBvid(meta?.bvid || meta?.id || '');
            if (bv) return bv;
            return meta?.id ? `P${meta.id}` : '合并';
        },
        toNativeItem(dm, meta) {
            const text = (dm.text || '').trim();
            if (!text) return null;
            const title = (meta.groupTitle || meta.title || '').trim();
            if (title && (text === title || text.startsWith(title.slice(0, 20)))) return null;

            const offset = parseFloat(meta.offset) || 0;
            const sec = (parseFloat(dm.time) || 0) + offset;
            const prefix = this.listPrefix(meta);
            const srcId = String(meta.bvid || meta.id).replace(/[^\w-]/g, '_');
            const rawDmid = String(dm.dmid || `${Math.floor(sec * 1000)}_${(dm.text || '').length}`)
                .replace(/[^\w.-]/g, '_')
                .slice(0, 48);
            return {
                stime: Math.max(0, sec) * 1000,
                mode: dm.type || 1,
                size: dm.size || 25,
                color: dm.color || 16777215,
                text,
                listText: `【${prefix}】${text}`,
                date: dm.date || Math.floor(Date.now() / 1000),
                weight: 10,
                pool: 0,
                dmid: `${DM_MERGER_PREFIX}${srcId}_${rawDmid}`,
                attr: 0,
                animation: '',
                colorful: 0,
                oid: 0,
                dmFrom: 0,
                isRealTime: false,
            };
        },
        toListRow(item, listStore) {
            const offsetMs = (listStore.mpdStore?.dmStartOffset || 0) * 1000;
            if (item.stime < offsetMs) return null;
            return {
                stime: item.stime - offsetMs,
                mode: item.mode,
                size: item.size,
                color: item.color,
                text: item.listText || item.text,
                date: item.date,
                weight: item.weight,
                pool: item.pool,
                dmid: item.dmid,
                attr: item.attr,
                animation: item.animation || '',
                colorful: item.colorful || 0,
                oid: item.oid || 0,
                dmFrom: item.dmFrom || 0,
                isRealTime: !!item.isRealTime,
                rawMode: item.mode,
                id_str: String(item.dmid),
                uhash: '',
                uname: '',
                border: false,
                borderColor: 6750207,
                isHighLike: false,
                isMine: false,
                prefix: null,
                suffix: null,
            };
        },
        filterNewItems(items) {
            const db = this.getDataBase();
            const seen = new Set((db?.dmArray || []).map((d) => String(d.dmid)));
            return items.filter((it) => it?.dmid && !seen.has(String(it.dmid)));
        },
        injectList(items) {
            if (!items.length) return false;
            let resolved = this.resolveStoresDirect();
            if (!resolved?.ok) {
                this.ensureCapture(true);
                resolved = this.resolveStoresDirect();
            }
            const listStore = this.getStores()?.dmListStore;
            if (!listStore?.allDm) {
                const now = Date.now();
                if (!this._lastInjectListWarnAt || now - this._lastInjectListWarnAt > 8000) {
                    this._lastInjectListWarnAt = now;
                    dmWarn('injectList 跳过：无 dmListStore', resolved, this.diag());
                }
                return false;
            }
            const before = listStore.allDm.length;
            const existing = new Set(listStore.allDm.map((d) => String(d.dmid)));
            const rows = [];
            for (const it of items) {
                if (existing.has(String(it.dmid))) continue;
                const row = this.toListRow(it, listStore);
                if (row) {
                    rows.push(row);
                    existing.add(String(it.dmid));
                }
            }
            if (!rows.length) return before > 0;
            // 只写列表 allDm，勿用 appendDm（会同步到画面，与 addList 重复）
            listStore.allDm.push(...rows);
            this.refreshListUI(listStore);
            const after = listStore.allDm.length;
            dmLog('injectList', { ok: true, before, after, added: rows.length, method: 'allDm-direct' });
            return true;
        },
        async injectListAsync(items, onProgress) {
            if (!items.length) return false;
            if (!this.hasListStore()) {
                onProgress?.('捕获列表 Store');
                this.ensureCapture(true);
                await this.burstCaptureStore();
            }
            const CHUNK = 100;
            let ok = false;
            for (let i = 0; i < items.length; i += CHUNK) {
                const chunk = items.slice(i, i + CHUNK);
                ok = this.injectList(chunk) || ok;
                if (!ok && !this.hasListStore()) {
                    await this.burstCaptureStore();
                    ok = this.injectList(chunk) || ok;
                }
                onProgress?.(`同步列表 ${Math.min(i + CHUNK, items.length)}/${items.length}`);
                await this.yieldUI();
            }
            const st = this.getStores();
            if (ok && st?.dmListStore) {
                this.refreshListUI(st.dmListStore);
                this.openListPanel();
            }
            return ok;
        },
        countMergedInjected(db, items) {
            if (!db?.dmArray?.length) return 0;
            const prefix = DM_MERGER_PREFIX;
            let byPrefix = 0;
            for (let i = 0; i < db.dmArray.length; i++) {
                if (String(db.dmArray[i].dmid).startsWith(prefix)) byPrefix++;
            }
            if (byPrefix > 0) return byPrefix;

            if (!items?.length) return 0;
            const probe = items[0].text;
            if (!probe) return 0;
            let byText = 0;
            for (let i = 0; i < db.dmArray.length; i++) {
                if (db.dmArray[i].text === probe) byText++;
            }
            return byText;
        },
        evaluateSyncResult(db, items, listOk) {
            let screen = this.countMergedInjected(db, items);
            if (screen === 0 && items?.length) {
                const probe = items[Math.min(2, items.length - 1)];
                const hit = db?.dmArray?.some((d) => d.text === probe.text);
                if (hit) screen = items.length;
            }
            const ok = screen > 0;
            return {
                ok,
                count: items?.length || 0,
                screen,
                list: listOk,
                hasStore: this.hasListStore(),
                firstSec: items?.[0] ? items[0].stime / 1000 : null,
                reason: ok ? (listOk ? null : 'list_only_failed') : 'inject_failed',
            };
        },
        purgeMerged() {
            const db = this.getDataBase();
            const st = this.getStores();
            const prefix = DM_MERGER_PREFIX;

            if (db?.dmArray) {
                const removed = db.dmArray.filter((d) => String(d.dmid).startsWith(prefix));
                removed.forEach((d) => {
                    try { db.remove(d.dmid); } catch (e) { }
                });
                db.dmArray = db.dmArray.filter((d) => !String(d.dmid).startsWith(prefix));
            }

            if (st?.dmListStore) {
                const store = st.dmListStore;
                const delIds = store.allDm
                    .filter((d) => String(d.dmid).startsWith(prefix))
                    .map((d) => d.dmid);
                if (delIds.length) {
                    store.allDm = store.allDm.filter((d) => !String(d.dmid).startsWith(prefix));
                    try {
                        store.setState({
                            delDmid: delIds,
                            count: store.allDm.length,
                            viewCount: store.allDm.length,
                        });
                    } catch (e) { }
                }
            }
        },
        countMergedOnScreen() {
            const db = this.getDataBase();
            return this.countMergedInjected(db, null);
        },
        openListPanel() {
            try {
                this.page().player?.auxiliary?.openTabList?.();
            } catch (e) { }
        },
        installResyncHook(getSourcesFn) {
            if (this._resyncHooked || typeof getSourcesFn !== 'function') return;
            this._resyncHooked = true;
            const resync = () => {
                const sources = getSourcesFn();
                if (!sources?.size || this._fullSyncing) return;
                clearTimeout(this._resyncTimer);
                this._resyncTimer = setTimeout(async () => {
                    if (!this.getDataBase() || this._fullSyncing) return;
                    const before = this.countMergedOnScreen();
                    const result = await this.fullSyncAsync(sources);
                    if (result.count > 0 && result.screen === 0) {
                        console.warn('[弹幕合并器] 弹幕重载后屏幕同步失败', result);
                    } else if (before === 0 && result.screen > 0) {
                        console.info('[弹幕合并器] 弹幕重载后已重新注入', result.screen);
                    }
                }, 1200);
            };
            const hookPlayer = () => {
                const p = NativeDanmaku.page().player;
                if (!p?.on) return false;
                ['danmaku-loaded', 'dm-loaded', 'segment'].forEach((ev) => {
                    try { p.on(ev, resync); } catch (e) { }
                });
                return true;
            };
            if (!hookPlayer()) {
                const timer = setInterval(() => {
                    if (hookPlayer()) clearInterval(timer);
                }, 500);
                setTimeout(() => clearInterval(timer), 60000);
            }
        },
        buildNativeItems(sourcesMap) {
            const items = [];
            if (sourcesMap) {
                sourcesMap.forEach((source) => {
                    (source.list || []).forEach((dm) => {
                        const item = this.toNativeItem(dm, source.meta);
                        if (item) items.push(item);
                    });
                });
            }
            items.sort((a, b) => a.stime - b.stime);
            return items;
        },
        fullSync(sourcesMap) {
            const db = this.getDataBase();
            if (!db) return { ok: false, reason: 'no_db', count: 0, screen: 0, list: false };

            this.purgeMerged();
            const items = this.buildNativeItems(sourcesMap);
            if (!items.length) {
                return { ok: true, count: 0, screen: 0, list: this.hasListStore(), firstSec: null };
            }

            const screenItems = this.filterNewItems(items);
            try {
                if (screenItems.length) db.addList(screenItems);
            } catch (e) {
                console.warn('[弹幕合并器] addList 失败', e);
                return { ok: false, reason: 'addList_error', count: items.length, screen: 0, list: false, firstSec: items[0].stime / 1000 };
            }

            const listOk = this.injectList(items);
            return this.evaluateSyncResult(db, items, listOk);
        },
        async fullSyncAsync(sourcesMap, onProgress) {
            if (this._fullSyncing && this._fullSyncPromise) {
                return this._fullSyncPromise;
            }
            this._fullSyncing = true;
            this._fullSyncPromise = this.withPlaybackPreserved(async () => {
                const db = this.getDataBase();
                if (!db) return { ok: false, reason: 'no_db', count: 0, screen: 0, list: false };

                this.ensureCapture(true);
                if (!this.hasListStore()) {
                    onProgress?.('捕获列表 Store');
                    await this.burstCaptureStore();
                }

                onProgress?.('清理旧弹幕');
                this.purgeMerged();
                await this.yieldUI();

                onProgress?.('准备数据');
                const items = this.buildNativeItems(sourcesMap);
                if (!items.length) {
                    return { ok: true, count: 0, screen: 0, list: this.hasListStore(), firstSec: null };
                }

                const CHUNK = 120;
                try {
                    for (let i = 0; i < items.length; i += CHUNK) {
                        const chunk = this.filterNewItems(items.slice(i, i + CHUNK));
                        if (!chunk.length) continue;
                        db.addList(chunk);
                        onProgress?.(`写入画面 ${Math.min(i + CHUNK, items.length)}/${items.length}`);
                        await this.yieldUI();
                    }
                } catch (e) {
                    console.warn('[弹幕合并器] addList 失败', e);
                    return { ok: false, reason: 'addList_error', count: items.length, screen: 0, list: false, firstSec: items[0].stime / 1000 };
                }

                let listOk = await this.injectListAsync(items, onProgress);
                let result = this.evaluateSyncResult(db, items, listOk);

                // 分批写入偶发漏检时，整批重试一次
                if (!result.ok && items.length > 0) {
                    onProgress?.('重试写入');
                    try {
                        this.purgeMerged();
                        const retryItems = this.filterNewItems(items);
                        if (retryItems.length) db.addList(retryItems);
                        listOk = await this.injectListAsync(items, onProgress) || listOk;
                        result = this.evaluateSyncResult(db, items, listOk);
                    } catch (e) {
                        console.warn('[弹幕合并器] 重试 addList 失败', e);
                    }
                }

                this._lastAsyncResult = result;
                dmLog('fullSyncAsync 完成', {
                    ok: result.ok,
                    count: result.count,
                    screen: result.screen,
                    list: result.list,
                    hasStore: this.hasListStore(),
                    allDmLen: this.getStores()?.dmListStore?.allDm?.length ?? null,
                });
                return result;
            });

            try {
                return await this._fullSyncPromise;
            } finally {
                this._fullSyncing = false;
            }
        },
        formatInjectHint(result) {
            const parts = [];
            if (result.screen > 0) {
                parts.push(`画面 ${result.screen} 条`);
            } else if (result.count > 0) {
                parts.push('画面未写入');
            }
            if (result.list) {
                parts.push('列表已同步');
            } else if (result.count > 0 && this.hasListStore()) {
                parts.push('列表同步失败');
            } else if (result.count > 0) {
                parts.push('列表未同步');
            }
            if (result.firstSec != null && result.screen > 0) {
                const s = Math.floor(result.firstSec);
                const mm = String(Math.floor(s / 60)).padStart(2, '0');
                const ss = String(s % 60).padStart(2, '0');
                parts.push(`首条约 ${mm}:${ss}`);
            }
            return parts.join('；');
        },
    };

    // --- 样式定义 ---
    // 强制指定颜色以适配深色/浅色模式
    addStyle(`
        #dm-merger-btn {
            cursor: pointer;
            color: var(--text2, #61666d);
            font-size: 13px;
            margin-left: -20px;
            display: inline-flex;
            align-items: center;
            transition: color 0.3s;
        }
        #dm-merger-btn:hover {
            color: #00AEEC;
        }
        .dm-merger-modal-mask {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.6);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;

        }
        .dm-merger-modal {
            background: var(--bg1, #ffffff);
            color: var(--text1, #222222);
            border-radius: 12px;
            width: 850px;
            max-width: 90vw;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            overflow: hidden;
            border: 1px solid var(--line_light, #f1f1f1);
        }
        .dm-merger-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--line_regular, #e7e7e7);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .dm-merger-title {
            font-size: 16px;
            font-weight: 600;
        }
        .dm-merger-close {
            cursor: pointer;
            font-size: 20px;
            color: var(--text3, #999);
            padding: 0 5px;
        }
        .dm-merger-close:hover {
            color: var(--text1, #222);
        }
        .dm-merger-body {
            padding: 20px;
            overflow-y: auto;
            flex: 1;
        }
        .dm-merger-input-group {
            display: flex;
            gap: 10px;
            margin-bottom: 16px;
        }
        #dm-search-input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--line_regular, #ccd0d7);
            background: var(--bg2, #f4f5f7);
            color: var(--text1, #222222);
            border-radius: 4px;
            outline: none;
            transition: all 0.3s;
        }
        #dm-search-input:focus {
            border-color: #00AEEC;
            background: var(--bg1, #ffffff);
        }
        #dm-search-btn {
            padding: 8px 20px;
            background: #00AEEC;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
        }
        #dm-search-btn:hover {
            background: #00a1d6;
        }
        .dm-result-item {
            display: flex;
            gap: 16px;
            padding: 12px;
            border-bottom: 1px solid var(--line_light, #f0f0f0);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .dm-result-item:hover {
            background: var(--bg2, #f4f5f7);
            transform: translateX(4px);
        }
        .dm-result-cover {
            width: 160px;
            height: 100px;
            border-radius: 6px;
            object-fit: cover;
            background: #e7e7e7;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .dm-result-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .dm-result-title {
            font-size: 15px;
            font-weight: 500;
            line-height: 1.5;
            max-height: 45px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            color: var(--text1, #222);
            margin-bottom: 4px;
        }
        .dm-result-meta {
            font-size: 12px;
            color: var(--text3, #999);
        }
        .dm-page-list {
            padding-left: 10px;
            margin-top: 5px;
            border-left: 2px solid #00AEEC;
        }
        .dm-page-item {
            padding: 6px 10px;
            font-size: 13px;
            color: var(--text2, #505050);
            cursor: pointer;
            border-radius: 4px;
        }
        .dm-page-item:hover {
            background: var(--bg2, #e3e5e7);
            color: #00AEEC;
        }
        /* 自定义弹幕层 */
        .custom-dm-layer {
            pointer-events: none;
            overflow: hidden;
        }
        .dm-interactive {
            pointer-events: auto !important;
            cursor: pointer;
            text-decoration: underline;
        }
        .dm-interactive:hover {
            color: #00AEEC !important;
            z-index: 100;
        }
        /* 自定义确认弹窗 */
        .dm-confirm-modal {
            background: var(--bg1, #fff);
            border-radius: 8px;
            width: 400px;
            padding: 24px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            text-align: center;
        }
        .dm-confirm-title { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: var(--text1, #222); }
        .dm-confirm-content { font-size: 14px; color: var(--text2, #555); margin-bottom: 24px; line-height: 1.5; }
        .dm-confirm-btns { display: flex; justify-content: center; gap: 12px; }
        .dm-confirm-btn { padding: 8px 24px; border-radius: 4px; cursor: pointer; border: none; font-size: 14px; transition: opacity 0.2s;}
        .dm-confirm-btn.primary { background: #00AEEC; color: #fff; }
        .dm-confirm-btn.cancel { background: var(--bg2, #e7e7e7); color: var(--text2, #555); }
        .dm-confirm-btn:hover { opacity: 0.8; }

        /* 复选框样式 */
        .dm-page-item { display:flex; align-items:center; }
        .dm-checkbox {
            width:16px; height:16px; border:2px solid #ccc; border-radius:3px; margin-right:10px; cursor:pointer;
            display:flex; align-items:center; justify-content:center; transition:all 0.2s;
        }
        .dm-checkbox.checked { background:#00AEEC; border-color:#00AEEC; }
        .dm-checkbox.checked::after { content:''; display:block; width:4px; height:8px; border:solid #fff; border-width:0 2px 2px 0; transform:rotate(45deg) translate(0,-1px); }

        /* 深色模式适配 */
        html[data-dark-theme="true"] .dm-merger-modal,
        body.dark .dm-merger-modal,
        html[data-dark-theme="true"] .dm-confirm-modal,
        body.dark .dm-confirm-modal {
            --bg1: #222;
            --bg2: #333;
            --text1: #eee;
            --text2: #ccc;
            --text3: #999;
            --line_regular: #444;
            --line_light: #333;
            background: var(--bg1);
            color: var(--text1);
        }

        /* 输入框与下拉框深色模式 */
        html[data-dark-theme="true"] .dm-offset-input,
        body.dark .dm-offset-input,
        html[data-dark-theme="true"] select,
        body.dark select,
        html[data-dark-theme="true"] input[type=text],
        body.dark input[type=text],
        html[data-dark-theme="true"] input[type=number],
        body.dark input[type=number] {
            color: var(--text1) !important;
            background: var(--bg2) !important;
            border-color: var(--line_regular) !important;
        }
        .dm-part-mode-panel {
            margin-bottom: 10px;
            padding: 10px 12px;
            border: 1px solid var(--line_regular, #e3e5e7);
            border-radius: 6px;
            background: var(--bg2, #f9f9f9);
        }
        .dm-part-mode-toggle-row {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            user-select: none;
        }
        .dm-part-mode-fields {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px dashed var(--line_regular, #ddd);
        }
        .dm-part-duration-input {
            width: 64px;
            padding: 2px 6px;
            border: 1px solid var(--line_regular, #ccd0d7);
            border-radius: 4px;
            font-size: 12px;
            text-align: center;
            background: var(--bg1, #fff);
            color: var(--text1, #222);
        }
        .dm-part-calc-btn {
            padding: 4px 12px;
            background: #00AEEC;
            color: #fff;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
        }
        .dm-part-calc-btn:hover { opacity: 0.85; }

        html[data-dark-theme="true"] .dm-result-item:hover,
        body.dark .dm-result-item:hover {
            background: var(--bg2);
        }
    `, 'danmakuMerger');

    // --- 自定义弹幕引擎 ---
    class DanmakuEngine {
        constructor() {
            this.video = null;
            this.container = null;
            this.danmakuList = [];
            this.cursor = 0;
            this.isPlaying = false;
            this.lastTime = 0;
            this.activeAnimations = new Set();
            this.styleCache = null;
            this.checkInterval = null;
            this.rafId = null; // 用于 requestAnimationFrame
            this.nativeMode = false;
            this.lastListSync = false;
            this.lastSyncResult = null;
        }

        init() {
            // 仅使用 B 站原生弹幕（DanmakuX + 右侧列表），不自绘
            if (NativeDanmaku.getDataBase()) {
                this.nativeMode = true;
                this.video = document.querySelector('video') || null;
                return true;
            }
            return false;
        }

        /** @deprecated 保留旧自绘实现，合并流程不再调用 */
        _initCustomLayer() {
            const videoWrap = document.querySelector('.bpx-player-video-wrap') ||
                document.querySelector('.bilibili-player-video-wrap') ||
                document.querySelector('#bilibili-player');

            if (!videoWrap) return false;

            this.video = videoWrap.querySelector('video');
            if (!this.video) return false;

            // 移除已存在的容器
            if (this.container) this.container.remove();

            // 创建覆盖层容器
            this.container = document.createElement('div');
            this.container.className = 'custom-dm-layer';
            this.container.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:10;';

            // 插入到视频元素之后
            this.video.parentElement.insertBefore(this.container, this.video.nextSibling);

            // 绑定事件
            this._boundPlay = () => { this.isPlaying = true; this.resumeAll(); };
            this._boundPause = () => { this.isPlaying = false; this.pauseAll(); };
            this._boundSeek = () => { this.handleSeek(); };
            this._boundTimeUpdate = () => { this.onTimeUpdate(); };

            const v = this.video;
            ['play', 'pause', 'seeking', 'timeupdate'].forEach(ev => {
                v.removeEventListener(ev, this[`_bound${ev.charAt(0).toUpperCase() + ev.slice(1)}`]);
                v.addEventListener(ev, this[`_bound${ev.charAt(0).toUpperCase() + ev.slice(1)}`]);
            });

            if (this.checkInterval) clearInterval(this.checkInterval);
            this.checkInterval = setInterval(() => {
                this.updateStyles();
            }, 2000);

            // 启动渲染驱动
            this.startLoop();

            this.isPlaying = !this.video.paused;
            return true;
        }

        startLoop() {
            if (this.rafId) cancelAnimationFrame(this.rafId);
            const loop = () => {
                this.update();
                this.rafId = requestAnimationFrame(loop);
            };
            this.rafId = requestAnimationFrame(loop);
        }

        stopLoop() {
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        }

        // --- 资源管理 ---
        getCurrentVideoId() {
            // 优先从 URL 参数获取 BVID (适配稍后再看等列表页)
            const params = new URLSearchParams(location.search);
            const bvidParam = params.get('bvid');
            if (bvidParam) return bvidParam;

            // 其次从路径获取 (适配普通视频页)
            const pathMatch = location.pathname.match(/\/video\/(BV[a-zA-Z0-9]{10})/i);
            if (pathMatch) return pathMatch[1];

            // 兜底使用路径名 (适配番剧等)
            return location.pathname;
        }

        addSource(id, list, meta, deferNativeSync = false) {
            this.sources = this.sources || new Map();
            const key = String(id);
            if (meta.offset === undefined) meta.offset = 0;
            this.sources.set(key, { list, meta });
            this.rebuildListMeta();
            if (!deferNativeSync) this.syncNative();
            this.saveState();
        }

        updateSource(id, updates) {
            const key = String(id);
            if (this.sources && this.sources.has(key)) {
                const source = this.sources.get(key);
                // 若包含列表则替换
                if (updates.list) {
                    source.list = updates.list;
                    delete updates.list;
                }
                Object.assign(source.meta, updates);
                this.rebuildList();
                this.saveState();
            }
        }

        removeSource(id) {
            const key = String(id);
            if (this.sources && this.sources.has(key)) {
                this.sources.delete(key);
                this.rebuildList();
                this.saveState();
                // 派发更新事件
                document.dispatchEvent(new CustomEvent('dm-sources-updated'));
            }
        }

        getSources() {
            return this.sources ? Array.from(this.sources.values()).map(v => ({ id: v.meta.id, ...v.meta })) : [];
        }

        rebuildListMeta() {
            let all = [];
            if (this.sources) {
                this.sources.forEach(source => {
                    const offset = parseFloat(source.meta.offset) || 0;
                    const adjusted = source.list.map(dm => {
                        const newDm = Object.assign({}, dm);
                        newDm.time += offset;
                        return newDm;
                    });
                    all = all.concat(adjusted);
                });
            }
            this.danmakuList = all.sort((a, b) => a.time - b.time);
        }

        syncNative() {
            this.nativeMode = true;
            if (!NativeDanmaku.getDataBase()) {
                this.lastListSync = false;
                this.lastSyncResult = { ok: false, reason: 'no_db', count: 0, screen: 0, list: false };
                return;
            }
            NativeDanmaku.installResyncHook(() => this.sources);
            const sync = NativeDanmaku.fullSync(this.sources);
            this.lastListSync = !!sync.list;
            this.lastSyncResult = sync;
        }

        rebuildList() {
            this.rebuildListMeta();
            this.syncNative();
        }

        // --- 状态持久化 ---
        saveState() {
            if (!this.video) return;
            const videoId = this.getCurrentVideoId();
            const key = `dm_merger_store_${videoId}`;
            const sourcesMeta = this.getSources();
            GM_setValue(key, JSON.stringify(sourcesMeta));
            trackMergerStorageKey(key);
        }

        // 重置引擎（用于 SPA 导航切换视频）
        reset() {
            NativeDanmaku.purgeMerged();
            this.sources = new Map();
            this.danmakuList = [];
            this.cursor = 0;
            this.video = null;
            this.container = null;
            this.styleCache = null;
            this.nativeMode = false;
            this.lastListSync = false;
            this.lastSyncResult = null;

            const counter = document.getElementById('dm-merger-count');
            if (counter) counter.remove();
        }

        load(list) {
            this.danmakuList = list.sort((a, b) => a.time - b.time);
            this.handleSeek();
        }

        handleSeek() {
            if (!this.video) return;
            const now = this.video.currentTime;
            this.lastTime = now;
            this.clearScreen();
            this.cursor = this.danmakuList.findIndex(d => d.time >= now);
            if (this.cursor === -1) this.cursor = this.danmakuList.length;

            // 回溯查找当前应显示的弹幕
            const LOOKBACK = 12;
            let scanIdx = this.cursor - 1;
            while (scanIdx >= 0) {
                const dm = this.danmakuList[scanIdx];
                const diff = now - dm.time;
                if (diff > LOOKBACK) break;
                if (diff >= 0) this.shoot(dm, diff * 1000);
                scanIdx--;
            }
        }

        clearScreen() {
            if (this.container) this.container.innerHTML = '';
            this.activeAnimations.clear();
        }

        pauseAll() {
            this.activeAnimations.forEach(anim => {
                if (anim.playState !== 'paused' && anim.playState !== 'finished') anim.pause();
            });
        }

        resumeAll() {
            this.activeAnimations.forEach(anim => {
                if (anim.playState === 'paused') anim.play();
            });
        }

        updateStyles() {
            // 默认样式
            this.styleCache = this.styleCache || {
                fontFamily: 'SimHei, "Microsoft JhengHei", Arial, sans-serif',
                fontWeight: 'bold',
                textShadow: '1px 0 1px #000, -1px 0 1px #000, 0 1px 1px #000, 0 -1px 1px #000',
                opacity: '1'
            };

            try {
                // 1. 同步不透明度
                const nativeLayer = document.querySelector('.bpx-player-dm-wrap') || document.querySelector('.bilibili-danmaku');
                if (nativeLayer) {
                    const opacity = getComputedStyle(nativeLayer).opacity;
                    if (this.container && this.container.style.opacity !== opacity) {
                        this.container.style.opacity = opacity;
                    }
                    this.styleCache.opacity = opacity;
                }

                // 2. 同步字体与阴影
                const sampleDm = document.querySelector('.bpx-player-dm-itm');
                if (sampleDm) {
                    const computed = getComputedStyle(sampleDm);
                    this.styleCache.fontFamily = computed.fontFamily;
                    this.styleCache.fontWeight = computed.fontWeight;
                    if (computed.textShadow && computed.textShadow !== 'none') {
                        this.styleCache.textShadow = computed.textShadow;
                    }
                } else {
                    try {
                        const profile = JSON.parse(localStorage.getItem('bpx_player_profile'));
                        if (profile?.dmSetting) {
                            if (profile.dmSetting.fontFamily) this.styleCache.fontFamily = profile.dmSetting.fontFamily;
                            if (profile.dmSetting.bold !== undefined) this.styleCache.fontWeight = profile.dmSetting.bold ? 'bold' : 'normal';
                        }
                    } catch (e) { }
                }
            } catch (e) { }
        }

        update() {
            if (!this.danmakuList.length || !this.video) return;

            // 处理暂停状态同步
            if (this.video.paused) {
                if (this.isPlaying) {
                    this.isPlaying = false;
                    this.pauseAll();
                }
                return;
            } else if (!this.isPlaying) {
                this.isPlaying = true;
                this.resumeAll();
            }

            const now = this.video.currentTime;

            // 检查大跨度跳转（例如点击进度条）
            if (Math.abs(now - this.lastTime) > 1.5) {
                this.handleSeek();
                return;
            }
            this.lastTime = now;

            // 发射当前时间点的弹幕
            while (this.cursor < this.danmakuList.length) {
                const dm = this.danmakuList[this.cursor];
                if (dm.time > now) break;

                // 只要未超时且游标到达就发射（移除严格的 1s 限制以补齐丢帧）
                // 但要防止瞬间发射大量过时弹幕（通常在 seek 时已处理）
                if (now - dm.time < 3.0) {
                    this.shoot(dm);
                }
                this.cursor++;
            }
        }

        onTimeUpdate() {
            // 已迁移到 update() 由 rAF 驱动，此处仅做跳转保底
            const now = this.video?.currentTime;
            if (now !== undefined && Math.abs(now - this.lastTime) > 1.5) {
                this.handleSeek();
            }
        }

        shoot(dm, startOffset = 0) {
            if (!this.container) return;
            if (!this.styleCache) this.updateStyles();

            const el = document.createElement('div');
            el.innerText = dm.text;

            const fontSize = dm.size || 25;
            const color = '#' + (dm.color || 16777215).toString(16).padStart(6, '0');

            el.style.cssText = `position:absolute;white-space:pre;font-size:${fontSize}px;color:${color};text-shadow:${this.styleCache.textShadow};font-family:${this.styleCache.fontFamily};font-weight:${this.styleCache.fontWeight};left:100%;will-change:transform;pointer-events:none;top:${this.getRowTop(fontSize)}px;line-height:1.125;`;

            // 互动时间跳转
            const timeMatch = dm.text.match(/(\d{1,2})[:\uff1a](\d{2})/);
            if (timeMatch) {
                el.classList.add('dm-interactive');
                el.style.pointerEvents = 'auto';
                el.title = `点击跳转至 ${timeMatch[1]}:${timeMatch[2]}`;
                el.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.video) {
                        this.video.currentTime = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
                        this.video.play();
                    }
                };
            }

            this.container.appendChild(el);

            // 计算动画参数
            const duration = 8000 + (Math.random() * 2000);
            const distance = this.container.clientWidth + el.clientWidth + 50;

            const anim = el.animate([
                { transform: 'translateX(0)' },
                { transform: `translateX(-${distance}px)` }
            ], { duration, easing: 'linear' });

            if (startOffset > 0) anim.currentTime = startOffset;
            this.activeAnimations.add(anim);
            if (this.video.paused) anim.pause();

            anim.onfinish = () => {
                el.remove();
                this.activeAnimations.delete(anim);
            };
        }

        getRowTop(height) {
            if (!this.container) return 10;
            const h = this.container.clientHeight || 400; // 保底高度
            const rowHeight = height + 6;
            const maxRows = Math.max(1, Math.floor(h / rowHeight) - 2);
            const row = Math.floor(Math.random() * maxRows);
            return row * rowHeight + 10;
        }
    }

    const engine = new DanmakuEngine();

    // --- 核心逻辑 ---

    // Bilibili API 封装
    const API = {
        search: (keyword, page = 1) => {
            return new Promise((resolve, reject) => {
                // 使用视频专用搜索接口，page_size 可设置最大 50
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: `https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=${encodeURIComponent(keyword)}&page=${page}&page_size=30`,
                    headers: {
                        'Referer': 'https://www.bilibili.com/',
                        'User-Agent': navigator.userAgent,
                        'Accept': 'application/json'
                    },
                    onload: (res) => {
                        try {
                            const data = JSON.parse(res.responseText);
                            if (data.code === 0) {
                                // 兼容原接口格式
                                resolve([{ result_type: 'video', data: data.data.result || [] }]);
                            }
                            else reject(data.message || '搜索失败');
                        } catch (e) {
                            reject('搜索接口返回格式错误');
                        }
                    },
                    onerror: reject
                });
            });
        },
        getView: (bvid) => {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
                    headers: {
                        'Referer': 'https://www.bilibili.com/',
                        'User-Agent': navigator.userAgent
                    },
                    onload: (res) => {
                        try {
                            const data = JSON.parse(res.responseText);
                            if (data.code === 0) resolve(data.data);
                            else reject(data.message);
                        } catch (e) { reject(e); }
                    },
                    onerror: reject
                });
            });
        },
        getDanmaku: (cid) => {
            return new Promise((resolve, reject) => {
                // 使用旧版弹幕 API，不需要额外认证
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: `https://comment.bilibili.com/${cid}.xml`,
                    headers: {
                        'Referer': 'https://www.bilibili.com/',
                        'User-Agent': navigator.userAgent
                    },
                    onload: (res) => resolve(res.responseText),
                    onerror: reject
                });
            });
        },
        getPageList: (bvid) => {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: `https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`,
                    headers: {
                        'Referer': 'https://www.bilibili.com/',
                        'User-Agent': navigator.userAgent
                    },
                    onload: (res) => {
                        try {
                            const data = JSON.parse(res.responseText);
                            if (data.code === 0) resolve(data.data || []);
                            else reject(data.message);
                        } catch (e) { reject(e); }
                    },
                    onerror: reject
                });
            });
        }
    };

    // --- 分P时长解析与延迟计算 ---
    function parseDurationText(text) {
        if (text == null) return null;
        const s = String(text).trim();
        if (!s) return null;
        if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);
        const parts = s.split(':').map((v) => parseFloat(v));
        if (parts.some((n) => Number.isNaN(n))) return null;
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        return null;
    }

    function formatDurationShort(seconds) {
        const sec = Math.max(0, Math.round(seconds * 10) / 10);
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.round(sec % 60);
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    function getSortedPageItems(pageList) {
        return [...pageList.querySelectorAll('.dm-page-item')].sort(
            (a, b) => (parseInt(a.dataset.page, 10) || 0) - (parseInt(b.dataset.page, 10) || 0)
        );
    }

    function resolvePartDurations(pageList) {
        const panel = pageList.closest('.dm-direct-details')?.querySelector('.dm-part-mode-panel');
        const items = getSortedPageItems(pageList);
        const n = items.length;
        const totalSec = parseDurationText(panel?.querySelector('.dm-total-duration')?.value);
        const uniformSec = parseDurationText(panel?.querySelector('.dm-uniform-part-duration')?.value);
        const rowSecs = items.map((item) => parseDurationText(item.querySelector('.dm-part-duration-input[data-cid]')?.value));

        if (uniformSec != null && uniformSec > 0) {
            return items.map(() => uniformSec);
        }
        if (rowSecs.some((v) => v != null && v > 0)) {
            return rowSecs.map((v) => (v != null && v > 0 ? v : 0));
        }
        if (totalSec != null && totalSec > 0 && n > 0) {
            return items.map(() => totalSec / n);
        }
        return items.map(() => 0);
    }

    function getPartModeStorageKey(bvid) {
        return `dm_part_mode_${extractBvid(bvid) || bvid}`;
    }

    function loadPartModeState(bvid) {
        try {
            const raw = GM_getValue(getPartModeStorageKey(bvid));
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function savePartModeState(bvid, state) {
        if (!bvid) return;
        try {
            GM_setValue(getPartModeStorageKey(bvid), JSON.stringify(state));
            trackMergerStorageKey(getPartModeStorageKey(bvid));
        } catch (e) { }
    }

    function fillPartDurationInputs(pageList, durations, markAuto = true) {
        const items = getSortedPageItems(pageList);
        items.forEach((item, idx) => {
            const input = item.querySelector('.dm-part-duration-input[data-cid]');
            const sec = durations[idx];
            if (input && sec > 0) {
                input.value = formatDurationShort(sec);
                if (markAuto) delete input.dataset.userEdited;
            }
        });
    }

    function hasManualPartDurations(pageList) {
        return getSortedPageItems(pageList).some(
            (item) => item.querySelector('.dm-part-duration-input[data-cid]')?.dataset.userEdited === '1'
        );
    }

    function syncDurationInputsBeforeCalc(pageList) {
        const panel = pageList.closest('.dm-direct-details')?.querySelector('.dm-part-mode-panel');
        if (!panel) return;
        const items = getSortedPageItems(pageList);
        const uniformSec = parseDurationText(panel.querySelector('.dm-uniform-part-duration')?.value);
        const totalSec = parseDurationText(panel.querySelector('.dm-total-duration')?.value);

        if (uniformSec != null && uniformSec > 0) {
            fillPartDurationInputs(pageList, items.map(() => uniformSec), true);
            return;
        }
        if (totalSec != null && totalSec > 0 && items.length > 0 && !hasManualPartDurations(pageList)) {
            fillPartDurationInputs(pageList, items.map(() => totalSec / items.length), true);
        }
    }

    function isPageItemChecked(item) {
        return !!item?.querySelector('.dm-checkbox')?.classList.contains('checked');
    }

    function isPartModeEnabled(pageList) {
        const panel = pageList?.closest('.dm-direct-details')?.querySelector('.dm-part-mode-panel');
        return !!panel?.querySelector('.dm-part-mode-toggle')?.checked;
    }

    function updatePageItemOffsetVisibility(pageList) {
        const partModeOn = isPartModeEnabled(pageList);
        getSortedPageItems(pageList).forEach((item) => {
            const checked = isPageItemChecked(item);
            const showDelay = !partModeOn || checked;
            const offsetBox = item.querySelector('.dm-page-offset');
            const durationCell = item.querySelector('.dm-part-duration-cell');
            const preview = item.querySelector('.dm-part-offset-preview');

            if (offsetBox) offsetBox.style.display = showDelay ? 'flex' : 'none';
            if (durationCell) durationCell.style.display = (partModeOn && checked) ? 'flex' : 'none';
            if (preview) {
                if (partModeOn && checked) {
                    preview.style.display = preview.textContent ? 'block' : 'none';
                } else {
                    preview.textContent = '';
                    preview.style.display = 'none';
                }
            }
            if (partModeOn && !checked) {
                const typeSel = item.querySelector('.dm-offset-type');
                const valInput = item.querySelector('.dm-offset-input');
                if (typeSel) typeSel.value = '1';
                if (valInput) valInput.value = '0';
            }
        });
    }

    function updatePartOffsetPreviews(pageList, durations) {
        const items = getSortedPageItems(pageList);
        let cumulative = 0;
        let firstChecked = true;
        items.forEach((item, idx) => {
            const preview = item.querySelector('.dm-part-offset-preview');
            const checked = isPageItemChecked(item);
            const dur = durations[idx] || 0;
            if (!preview) return;
            if (!checked || !isPartModeEnabled(pageList)) {
                preview.textContent = '';
                preview.style.display = 'none';
                return;
            }
            const offset = firstChecked ? 0 : cumulative;
            if (dur > 0) cumulative += dur;
            if (dur > 0) firstChecked = false;
            if (dur > 0) {
                preview.textContent = offset === 0
                    ? `有效 ${formatDurationShort(dur)} · 顺延 0 秒`
                    : `有效 ${formatDurationShort(dur)} · 顺延 ${formatDurationShort(offset)}`;
                preview.style.display = 'block';
            } else {
                preview.textContent = '';
                preview.style.display = 'none';
            }
        });
        updatePageItemOffsetVisibility(pageList);
    }

    function applyPartModeOffsets(pageList, silent = false) {
        if (!isPartModeEnabled(pageList)) {
            updatePageItemOffsetVisibility(pageList);
            return false;
        }
        syncDurationInputsBeforeCalc(pageList);
        const items = getSortedPageItems(pageList);
        const durations = resolvePartDurations(pageList);
        let cumulative = 0;
        let valid = false;
        let firstChecked = true;
        const offsetSummary = [];

        items.forEach((item, idx) => {
            const checked = isPageItemChecked(item);
            const dur = durations[idx] || 0;
            const typeSel = item.querySelector('.dm-offset-type');
            const valInput = item.querySelector('.dm-offset-input');

            if (!checked) {
                if (typeSel) typeSel.value = '1';
                if (valInput) valInput.value = '0';
                return;
            }

            const offset = firstChecked ? 0 : cumulative;
            if (dur > 0) {
                valid = true;
                cumulative += dur;
                firstChecked = false;
            }
            const pageNo = item.dataset.page || (idx + 1);
            offsetSummary.push(`P${pageNo}→${offset === 0 ? '0秒' : formatDurationShort(offset)}`);

            if (typeSel) typeSel.value = '1';
            if (valInput) valInput.value = Math.round(offset * 10) / 10;
        });

        updatePartOffsetPreviews(pageList, durations);

        const panel = pageList.closest('.dm-direct-details')?.querySelector('.dm-part-mode-panel');
        const hint = panel?.querySelector('.dm-part-mode-hint');
        if (hint) {
            const checkedDurations = durations.filter((_, idx) => isPageItemChecked(items[idx]));
            const sum = checkedDurations.reduce((a, b) => a + (b || 0), 0);
            const totalSec = parseDurationText(panel?.querySelector('.dm-total-duration')?.value);
            let text = valid
                ? `已计算（仅已选分P）：${offsetSummary.join('，')}`
                : '请填写本集有效时长、每P有效时长，或在下方逐P填写';
            if (valid && totalSec != null && totalSec > 0 && Math.abs(sum - totalSec) > 2) {
                text += `（已选有效时长合计 ${formatDurationShort(sum)} ≠ 本集有效时长 ${formatDurationShort(totalSec)}）`;
            }
            hint.textContent = text;
        }

        if (!silent && valid) {
            showCustomToast('有效时长顺延已计算', 1800);
        }
        return valid;
    }

    function setPartModeUI(pageList, enabled) {
        const details = pageList.closest('.dm-direct-details');
        const fields = details?.querySelector('.dm-part-mode-fields');
        if (fields) fields.style.display = enabled ? 'block' : 'none';
        updatePageItemOffsetVisibility(pageList);
    }

    function selectAllPages(pageList, checked = true) {
        pageList.querySelectorAll('.dm-page-item').forEach((item) => {
            const cb = item.querySelector('.dm-checkbox');
            if (!cb) return;
            if (checked) cb.classList.add('checked');
            else cb.classList.remove('checked');
        });
        const bvid = pageList.dataset.bvid;
        const { selectedBvids, updateSearchUI } = window._dmSearchContext || { selectedBvids: new Set(), updateSearchUI: () => { } };
        const resultWrapper = document.querySelector(`.dm-result-wrapper[data-bvid="${bvid}"]`);
        const parentCheckbox = resultWrapper?.querySelector('.dm-result-item .dm-checkbox');
        if (parentCheckbox) {
            if (checked) {
                selectedBvids.add(bvid);
                parentCheckbox.classList.add('checked');
            } else {
                selectedBvids.delete(bvid);
                parentCheckbox.classList.remove('checked');
            }
        }
        updateSearchUI?.();
        document.dispatchEvent(new CustomEvent('dm-selection-change'));
        if (isPartModeEnabled(pageList)) {
            applyPartModeOffsets(pageList, true);
        } else {
            updatePageItemOffsetVisibility(pageList);
        }
    }

    function parseDanmaku(xmlStr) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlStr, "text/xml");
        const entries = xmlDoc.querySelectorAll('d');
        const danmakuList = [];

        entries.forEach(entry => {
            const p = entry.getAttribute('p').split(',');
            danmakuList.push({
                time: parseFloat(p[0]),
                type: parseInt(p[1]),
                color: parseInt(p[3]),
                text: entry.textContent,
                size: parseInt(p[2]),
                date: parseInt(p[4]),
                uid: p[6],
                dmid: p[7]
            });
        });
        return danmakuList;
    }

    // --- 界面辅助组件 ---
    function showCustomConfirm(title, content, onConfirm) {
        if (document.querySelector('.dm-confirm-mask')) return;
        const mask = document.createElement('div');
        mask.className = 'dm-merger-modal-mask dm-confirm-mask';
        mask.style.zIndex = '100010';
        mask.innerHTML = `
            <div class="dm-confirm-modal">
                <div class="dm-confirm-title">${title}</div>
                <div class="dm-confirm-content">${content}</div>
                <div class="dm-confirm-btns">
                    <button class="dm-confirm-btn primary">确认</button>
                    <button class="dm-confirm-btn cancel">取消</button>
                </div>
            </div>
        `;
        document.body.appendChild(mask);

        const close = () => { mask.style.opacity = '0'; setTimeout(() => mask.remove(), 200); };

        mask.querySelector('.primary').onclick = () => { close(); onConfirm(); };
        mask.querySelector('.cancel').onclick = close;
        mask.onclick = (e) => { if (e.target === mask) close(); };
    }

    function showCustomToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: #fff;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 100001;
            font-size: 14px;
            backdrop-filter: blur(4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: opacity 0.5s;
            pointer-events: none;
        `;
        toast.innerText = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, duration);
    }

    // 界面更新辅助函数
    function updateDanmakuCountUI() {
        // 根据引擎状态刷新计数显示
        const sources = engine.getSources();
        const totalCount = sources.reduce((acc, s) => acc + s.count, 0);

        const metaContainer = document.querySelector('.video-info-container .video-info-meta') ||
            document.querySelector('.video-data') ||
            document.querySelector('.bangumi-info .info-right');

        if (!metaContainer) return;

        let counter = document.getElementById('dm-merger-count');
        if (counter) counter.remove();

        if (totalCount === 0) return; // 如果为 0 则隐藏

        counter = document.createElement('span');
        counter.id = 'dm-merger-count';
        counter.style.cssText = 'color: #61666d; margin-left: 12px; font-size: 13px; display: inline-flex; align-items: center; cursor:pointer; user-select:none;transition: color 0.3s;';

        // 鼠标移入变蓝色
        counter.addEventListener('mouseenter', () => {
            counter.style.color = '#00AEEC';
        });

        // 鼠标移出恢复原色
        counter.addEventListener('mouseleave', () => {
            counter.style.color = '#61666d';
        });

        const spans = metaContainer.querySelectorAll('span');
        let refNode = null;
        if (spans.length >= 2) refNode = spans[1].nextSibling;

        counter.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:3px;">
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
            已合并 ${totalCount} 条
        `;
        counter.title = `点击管理已合并的 ${sources.length} 个其弹幕源`;

        counter.onclick = createManagementModal;

        if (refNode) {
            metaContainer.insertBefore(counter, refNode);
        } else {
            metaContainer.appendChild(counter);
        }
    }

    function createManagementModal() {
        let mask = document.querySelector('.dm-manage-modal-mask');
        if (!mask) {
            mask = document.createElement('div');
            mask.className = 'dm-merger-modal-mask dm-manage-modal-mask';
            document.body.appendChild(mask);
            mask.onclick = (e) => { if (e.target === mask) mask.remove(); };
        }
        renderManagerContent(mask);
    }

    // 提取 BV 号并保留原始大小写（B 站 BV 区分大小写）
    function extractBvid(raw) {
        const s = String(raw || '').trim();
        if (!s) return '';
        if (/^BV[a-zA-Z0-9]{10}$/.test(s)) return s;
        const fromId = s.match(/^(BV[a-zA-Z0-9]{10})_/);
        if (fromId) return fromId[1];
        const embedded = s.match(/BV[a-zA-Z0-9]{10}/);
        return embedded ? embedded[0] : '';
    }

    function resolveSourceBvid(source) {
        return extractBvid(source?.bvid || source?.id || '');
    }

    function renderManagerContent(mask) {
        // 重新渲染前记录状态
        const expandedKeys = new Set();
        let lastScrollTop = 0;

        const existingBody = mask.querySelector('.dm-merger-body');
        if (existingBody) {
            lastScrollTop = existingBody.scrollTop;
        }

        mask.querySelectorAll('.dm-group-block').forEach(block => {
            const list = block.querySelector('.dm-group-list');
            if (list && list.style.display !== 'none') {
                expandedKeys.add(block.dataset.groupKey);
            }
        });

        const sources = engine.getSources();

        // 按 BVID 分组
        const groups = {};
        sources.forEach(s => {
            const resolvedBvid = resolveSourceBvid(s);
            const key = resolvedBvid || s.id || 'other';
            if (!groups[key]) {
                groups[key] = {
                    title: s.groupTitle || s.title || '未知视频',
                    cover: s.pic || '',
                    bvid: resolvedBvid,
                    author: s.author || '',
                    items: []
                };
            }
            if (!groups[key].bvid && resolvedBvid) groups[key].bvid = resolvedBvid;
            groups[key].items.push({ ...s, bvid: resolvedBvid || s.bvid || '' });
        });

        // 用于多选管理
        const selectedIds = new Set();

        let contentHtml = '';
        if (Object.keys(groups).length === 0) {
            contentHtml = '<div style="padding:40px; text-align:center; color:#999;">暂无合并源</div>';
        } else {
            Object.values(groups).forEach(g => {
                const groupKey = g.bvid || 'other';
                const isExpanded = expandedKeys.has(groupKey); // 检查先前是否展开
                contentHtml += `
                    <div class="dm-group-block" data-group-key="${groupKey}" style="border-bottom:1px solid var(--line_light, #eee); padding-bottom:10px; margin-bottom:10px;">
                        <div class="dm-group-header" style="display:flex; align-items:center; gap:10px; padding:10px; background:var(--bg2, #f9f9f9); border-radius:4px; margin-bottom:8px; user-select:none;">
                            <div class="dm-group-checkbox dm-checkbox" data-group="${groupKey}" style="flex-shrink:0; cursor:pointer;" onclick="event.stopPropagation();"></div>
                            <div class="dm-group-arrow" style="width:16px; height:16px; display:flex; align-items:center; justify-content:center; transition:transform 0.2s; cursor:pointer; transform: ${isExpanded ? 'rotate(-180deg)' : 'rotate(0deg)'};">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text3, #999)"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
                            </div>
                            ${g.cover ? `<div style="width:48px; height:30px; border-radius:3px; overflow:hidden; background:#e7e7e7; flex-shrink:0; cursor:pointer;"><img src="${g.cover.startsWith('//') ? 'https:' + g.cover : g.cover}" style="width:100%; height:100%; object-fit:cover;" referrerpolicy="no-referrer"></div>` : ''}
                            <div style="flex:1; min-width:0; cursor:pointer;">
                                <div style="font-weight:bold; color:var(--text1, #222); font-size:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${g.title}</div>
                                <div style="font-size:12px; color:var(--text3, #999); margin-top:2px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                                    ${g.bvid ? `<a href="https://www.bilibili.com/video/${g.bvid}" target="_blank" rel="noopener" style="color:#00AEEC; text-decoration:none; font-family:Consolas,monospace; font-weight:600;" onclick="event.stopPropagation();">${g.bvid}</a>` : ''}
                                    <span>UP: ${g.author || '未知'} · ${g.items.length}个分P</span>
                                </div>
                            </div>
                        </div>
                        <div class="dm-group-list" style="display:${isExpanded ? 'block' : 'none'};">
                            ${g.items.map(s => `
                                <div class="dm-source-item" data-source-id="${s.id}" data-group="${groupKey}" style="display:flex; gap:12px; padding:8px 12px; align-items:center; padding-left:42px;">
                                    <div class="dm-checkbox dm-item-checkbox" data-id="${s.id}" style="flex-shrink:0;"></div>
                                    <div style="flex:1; overflow:hidden; min-width:0;">
                                        <div style="font-size:13px; color:var(--text2, #555); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${s.bvid ? `${s.bvid} · ${s.title}` : s.title}">
                                            ${s.bvid ? `<span style="color:#00AEEC; font-family:Consolas,monospace; margin-right:6px;">${s.bvid}</span>` : ''}${s.title}
                                        </div>
                                        <div style="font-size:12px; color:var(--text3, #999); display:flex; align-items:center; gap:8px;">
                                            <span class="dm-preview-trigger" data-id="${s.id}" style="cursor:pointer; color:#00AEEC; border-bottom:1px dashed #00AEEC;" title="点击预览前50条弹幕">${s.count} 条弹幕</span>
                                        </div>
                                    </div>

                                    <!-- 操作控件 -->
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <div style="display:flex; align-items:center; background:var(--bg2, #f4f5f7); border-radius:4px; padding:2px 6px;" onclick="event.stopPropagation();">
                                            <input type="hidden" class="dm-offset-val" value="${s.offset || 0}" data-id="${s.id}">
                                            <select class="dm-offset-type" style="background:transparent; border:none; color:var(--text2, #555); font-size:12px; outline:none; cursor:pointer; margin-right:4px;">
                                                <option value="1" ${(s.offset || 0) >= 0 ? 'selected' : ''}>推迟</option>
                                                <option value="-1" ${(s.offset || 0) < 0 ? 'selected' : ''}>提前</option>
                                            </select>
                                            <input type="number" step="0.5" min="0" value="${Math.abs(s.offset || 0)}" class="dm-offset-input" data-id="${s.id}"
                                                style="width:40px; background:transparent; border:none; border-bottom:1px solid #ddd; text-align:center; font-size:12px; color:var(--text1, #222); outline:none;">
                                            <span style="font-size:12px; color:var(--text3, #999); margin-left:2px;">秒</span>
                                        </div>
                                        <button class="dm-delete-btn" data-id="${s.id}" style="padding:4px 10px; background:#ff4d4f; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:12px; transition:opacity 0.2s;">移除</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });
        }

        mask.innerHTML = `
            <div class="dm-merger-modal" style="width:850px;">
                <div class="dm-merger-header">
                    <span class="dm-merger-title">管理已合并弹幕</span>
                    <span class="dm-merger-close">×</span>
                </div>
                <div class="dm-merger-body" style="max-height:60vh;">
                    ${contentHtml}
                    <div style="margin-top:20px; text-align:center; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
                        <button id="dm-select-all-btn" style="padding:8px 24px; background:var(--bg2, #e7e7e7); color:var(--text2, #555); border:1px solid var(--line_regular, #ccc); border-radius:4px; cursor:pointer; font-weight:500;">全选</button>
                        <button id="dm-batch-delete-btn" style="padding:8px 24px; background:#ff4d4f; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:500; opacity:0.5; pointer-events:none;">删除选中 (<span id="dm-selected-count">0</span>)</button>
                        <button id="dm-add-more-btn" style="padding:8px 24px; background:#00AEEC; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:500;">+ 添加更多弹幕</button>
                        <button id="dm-clear-all-btn" style="padding:8px 24px; background:#ff6b6b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:500;">清除全部</button>
                    </div>
                </div>
            </div>
        `;

        mask.querySelector('.dm-merger-close').onclick = () => mask.remove();

        // 恢复滚动位置
        const newBody = mask.querySelector('.dm-merger-body');
        if (newBody) {
            newBody.scrollTop = lastScrollTop;
        }

        // 更新选中计数UI
        const updateSelectionUI = () => {
            const selectedCount = selectedIds.size;
            const countSpan = mask.querySelector('#dm-selected-count');
            const batchDeleteBtn = mask.querySelector('#dm-batch-delete-btn');
            const selectAllBtn = mask.querySelector('#dm-select-all-btn');

            if (countSpan) countSpan.innerText = selectedCount;

            if (batchDeleteBtn) {
                if (selectedCount > 0) {
                    batchDeleteBtn.style.opacity = '1';
                    batchDeleteBtn.style.pointerEvents = 'auto';
                } else {
                    batchDeleteBtn.style.opacity = '0.5';
                    batchDeleteBtn.style.pointerEvents = 'none';
                }
            }

            // 更新全选按钮文本
            if (selectAllBtn) {
                const totalItems = mask.querySelectorAll('.dm-item-checkbox').length;
                selectAllBtn.innerText = selectedCount === totalItems && totalItems > 0 ? '取消全选' : '全选';
            }

            // 更新分组复选框状态
            mask.querySelectorAll('.dm-group-block').forEach(groupBlock => {
                const groupKey = groupBlock.dataset.groupKey;
                const groupCheckbox = groupBlock.querySelector('.dm-group-checkbox');
                const items = groupBlock.querySelectorAll('.dm-item-checkbox');
                const checkedItems = Array.from(items).filter(cb => selectedIds.has(cb.dataset.id));

                if (checkedItems.length === items.length && items.length > 0) {
                    groupCheckbox.classList.add('checked');
                } else {
                    groupCheckbox.classList.remove('checked');
                }
            });
        };

        // 条目复选框点击事件
        mask.querySelectorAll('.dm-item-checkbox').forEach(checkbox => {
            checkbox.onclick = () => {
                const id = checkbox.dataset.id;
                if (selectedIds.has(id)) {
                    selectedIds.delete(id);
                    checkbox.classList.remove('checked');
                } else {
                    selectedIds.add(id);
                    checkbox.classList.add('checked');
                }
                updateSelectionUI();
            };
        });

        // 分组复选框点击事件（全选/取消该组）
        mask.querySelectorAll('.dm-group-checkbox').forEach(groupCheckbox => {
            groupCheckbox.onclick = (e) => {
                e.stopPropagation();
                const groupKey = groupCheckbox.dataset.group;
                const groupBlock = mask.querySelector(`.dm-group-block[data-group-key="${groupKey}"]`);
                const items = groupBlock.querySelectorAll('.dm-item-checkbox');
                const isChecked = groupCheckbox.classList.contains('checked');

                items.forEach(item => {
                    const id = item.dataset.id;
                    if (isChecked) {
                        selectedIds.delete(id);
                        item.classList.remove('checked');
                    } else {
                        selectedIds.add(id);
                        item.classList.add('checked');
                    }
                });

                updateSelectionUI();
            };
        });

        // 全选/取消全选按钮
        mask.querySelector('#dm-select-all-btn').onclick = () => {
            const allItems = mask.querySelectorAll('.dm-item-checkbox');
            const isAllSelected = selectedIds.size === allItems.length && allItems.length > 0;

            if (isAllSelected) {
                // 取消全选
                selectedIds.clear();
                allItems.forEach(item => item.classList.remove('checked'));
            } else {
                // 全选
                allItems.forEach(item => {
                    selectedIds.add(item.dataset.id);
                    item.classList.add('checked');
                });
            }

            updateSelectionUI();
        };

        // 批量删除按钮
        mask.querySelector('#dm-batch-delete-btn').onclick = () => {
            if (selectedIds.size === 0) return;

            showCustomConfirm('批量删除', `确定要移除选中的 ${selectedIds.size} 个弹幕源吗？此操作不可撤销。`, () => {
                selectedIds.forEach(id => {
                    engine.removeSource(id);
                });

                updateDanmakuCountUI();
                showCustomToast(`已删除 ${selectedIds.size} 个弹幕源`);
                // 刷新界面而不是关闭
                renderManagerContent(mask);
            });
        };

        mask.querySelector('#dm-add-more-btn').onclick = () => {
            mask.remove();
            createMergerModal();
        };

        // 清除全部弹幕源
        mask.querySelector('#dm-clear-all-btn').onclick = () => {
            showCustomConfirm('清除全部', '确定要移除当前视频所有已合并的弹幕吗？此操作不可撤销。', () => {
                // 获取所有源并逐一删除
                const allSources = engine.getSources();
                allSources.forEach(s => {
                    engine.removeSource(s.id);
                });

                updateDanmakuCountUI();
                showCustomToast('已清除所有合并的弹幕');
                // 刷新界面而不是关闭
                renderManagerContent(mask);
            });
        };

        // 切换分组可见性（点击箭头或标题区域触发）
        mask.querySelectorAll('.dm-group-header').forEach(header => {
            // 为箭头和标题区域添加点击事件
            const arrow = header.querySelector('.dm-group-arrow');
            const titleArea = header.querySelector('[style*="flex:1"]');
            const cover = header.querySelector('[style*="width:48px"]');

            const toggleGroup = () => {
                const list = header.nextElementSibling;
                if (list.style.display === 'none') {
                    list.style.display = 'block';
                    arrow.style.transform = 'rotate(-180deg)';
                } else {
                    list.style.display = 'none';
                    arrow.style.transform = 'rotate(0deg)';
                }
            };

            if (arrow) arrow.onclick = toggleGroup;
            if (titleArea) titleArea.onclick = toggleGroup;
            if (cover) cover.onclick = toggleGroup;
        });

        // 偏移量修改处理逻辑
        const updateOffset = (row) => {
            const id = row.querySelector('.dm-offset-val').dataset.id;
            const type = parseInt(row.querySelector('.dm-offset-type').value);
            const seconds = parseFloat(row.querySelector('.dm-offset-input').value) || 0;
            const finalOffset = type * seconds;

            engine.updateSource(id, { offset: finalOffset });

            // 视觉反馈
            const input = row.querySelector('.dm-offset-input');
            input.style.color = '#00AEEC';
            setTimeout(() => input.style.color = '', 500);
        };

        mask.querySelectorAll('.dm-source-item').forEach(row => {
            const typeSelect = row.querySelector('.dm-offset-type');
            const secondsInput = row.querySelector('.dm-offset-input');

            typeSelect.onchange = () => updateOffset(row);
            secondsInput.onchange = () => updateOffset(row);
        });

        mask.querySelectorAll('.dm-delete-btn').forEach(btn => {
            btn.onclick = () => {
                showCustomConfirm('移除弹幕源', '确认移除此弹幕源？不再合并其弹幕。', () => {
                    engine.removeSource(btn.dataset.id);
                    updateDanmakuCountUI();
                    // 刷新界面而不是关闭
                    renderManagerContent(mask);
                });
            };
        });

        // 弹幕预览点击事件
        mask.querySelectorAll('.dm-preview-trigger').forEach(trigger => {
            trigger.onclick = (e) => {
                e.stopPropagation();
                showDanmakuPreview(trigger.dataset.id);
            };
        });
    }

    function showDanmakuPreview(sourceId) {
        const source = (engine.sources && engine.sources.get(String(sourceId)));
        if (!source) return;

        let list = [...source.list]; // 复制一份列表用于排序
        let displayedCount = 0;
        let sortOrder = 1; // 1: 正序, -1: 倒序
        const PAGE_SIZE = 50;

        const mask = document.createElement('div');
        mask.className = 'dm-merger-modal-mask dm-preview-mask';
        mask.style.zIndex = '100020';
        mask.innerHTML = `
            <div class="dm-merger-modal" style="width:450px; max-height:70vh;">
                <div class="dm-merger-header">
                    <span class="dm-merger-title">弹幕预览 (共 ${list.length} 条)</span>
                    <span class="dm-merger-close">×</span>
                </div>
                <div class="dm-preview-content" style="padding:10px; overflow-y:auto; flex:1;">
                    <table style="width:100%; border-collapse:collapse; font-size:13px;">
                        <thead style="position:sticky; top:0; background:var(--bg1, #fff); box-shadow:0 1px 0 #eee; z-index:1;">
                            <tr>
                                <th id="dm-preview-sort-time" style="text-align:left; padding:8px; color:#00AEEC; width:80px; cursor:pointer; user-select:none;">时间 <span class="sort-icon">▲</span></th>
                                <th style="text-align:left; padding:8px; color:var(--text3, #999);">内容</th>
                            </tr>
                        </thead>
                        <tbody id="dm-preview-body"></tbody>
                    </table>
                    <div id="dm-preview-loader" style="text-align:center; padding:15px; color:var(--text3, #999); display:none;">滚动加载更多...</div>
                </div>
            </div>
        `;
        document.body.appendChild(mask);

        const tbody = mask.querySelector('#dm-preview-body');
        const container = mask.querySelector('.dm-preview-content');
        const loader = mask.querySelector('#dm-preview-loader');

        const formatTime = (seconds) => {
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        const renderMore = () => {
            const nextBatch = list.slice(displayedCount, displayedCount + PAGE_SIZE);
            if (nextBatch.length === 0) {
                loader.style.display = 'none';
                return;
            }

            nextBatch.forEach(dm => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid var(--line_light, #f4f4f4)';
                tr.innerHTML = `
                    <td style="padding:8px; color:#00AEEC; font-family:monospace;">${formatTime(dm.time)}</td>
                    <td style="padding:8px; color:var(--text1, #222); word-break:break-all;">${dm.text}</td>
                `;
                tbody.appendChild(tr);
            });

            displayedCount += nextBatch.length;
            if (displayedCount < list.length) {
                loader.style.display = 'block';
            } else {
                loader.style.display = 'none';
            }
        };

        // 初始加载
        renderMore();

        // 排序逻辑
        mask.querySelector('#dm-preview-sort-time').onclick = () => {
            sortOrder *= -1;
            list.sort((a, b) => (a.time - b.time) * sortOrder);
            displayedCount = 0;
            tbody.innerHTML = '';
            mask.querySelector('.sort-icon').innerText = sortOrder === 1 ? '▲' : '▼';
            renderMore();
            container.scrollTop = 0;
        };

        // 滚动加载更多
        container.onscroll = () => {
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 20) {
                if (displayedCount < list.length) {
                    renderMore();
                }
            }
        };

        const close = () => { mask.remove(); };
        mask.querySelector('.dm-merger-close').onclick = close;
        mask.onclick = (e) => { if (e.target === mask) close(); };
    }

    async function injectDanmaku(danmakuList, meta, silent = false, onProgress = null) {
        const emptyResult = { ok: false, count: 0, screen: 0, list: false, reason: 'empty_input' };
        if (!danmakuList?.length) {
            if (!silent) showCustomToast('该视频没有可合并的弹幕');
            return emptyResult;
        }

        return NativeDanmaku.withPlaybackPreserved(async () => {
            onProgress?.('等待播放器');
            const playerReady = await NativeDanmaku.waitForPlayer(45000, onProgress);
            if (!playerReady || !engine.init()) {
                const ready = NativeDanmaku.getPlayerReadiness();
                if (!silent) {
                    const hint = !ready.hasBpx && !ready.hasVideo
                        ? '请在视频播放页合并弹幕'
                        : (!ready.hasPlayer
                            ? '播放器未挂载，请刷新页面后重试'
                            : '请点击播放 2～5 秒后再合并');
                    showCustomToast(`弹幕引擎未就绪：${hint}`, 5000);
                }
                return { ok: false, count: danmakuList.length, screen: 0, list: false, reason: 'player_not_ready' };
            }

            const storeResolved = NativeDanmaku.resolveStoresDirect();
            dmLog('合并前 Store', storeResolved);
            if (!storeResolved?.ok) {
                onProgress?.('捕获列表 Store');
                NativeDanmaku.ensureCapture(true);
                await NativeDanmaku.burstCaptureStore();
            }

            engine.addSource(meta.id, danmakuList, {
                id: meta.id,
                title: meta.title,
                count: danmakuList.length,
                cid: meta.cid,
                author: meta.author,
                pic: meta.pic,
                offset: meta.offset || 0,
                bvid: meta.bvid,
                groupTitle: meta.groupTitle || meta.title
            }, true);

            NativeDanmaku.installResyncHook(() => engine.sources);
            let sync = await NativeDanmaku.fullSyncAsync(engine.sources, onProgress);
            engine.lastListSync = !!sync.list;
            engine.lastSyncResult = sync;

            if (!sync.list && !NativeDanmaku.hasListStore()) {
                onProgress?.('等待列表 Store');
                const gotList = await NativeDanmaku.waitForListStore(8000, onProgress)
                    || await NativeDanmaku.burstCaptureStore();
                if (gotList || NativeDanmaku.hasListStore()) {
                    sync = await NativeDanmaku.fullSyncAsync(engine.sources, onProgress);
                    engine.lastListSync = !!sync.list;
                    engine.lastSyncResult = sync;
                } else {
                    NativeDanmaku.waitForListStore(20000, onProgress).then(async (late) => {
                        if (!late || !engine.sources?.size) return;
                        const retry = await NativeDanmaku.fullSyncAsync(engine.sources);
                        engine.lastListSync = !!retry.list;
                        engine.lastSyncResult = retry;
                        document.dispatchEvent(new CustomEvent('dm-sources-updated'));
                    });
                }
            } else if (!sync.list && NativeDanmaku.hasListStore()) {
                sync = await NativeDanmaku.fullSyncAsync(engine.sources, onProgress);
                engine.lastListSync = !!sync.list;
                engine.lastSyncResult = sync;
            }

            const ok = !!sync.ok;
            const result = {
                ok,
                count: danmakuList.length,
                screen: sync.screen || 0,
                list: !!engine.lastListSync,
                firstSec: sync.firstSec ?? null,
                reason: ok ? null : (sync.reason || 'inject_failed'),
                native: true,
            };

            if (result.screen > 0 || result.list) {
                NativeDanmaku.openListPanel();
            }

            document.dispatchEvent(new CustomEvent('dm-sources-updated'));

            dmLog('injectDanmaku 结果', {
                ok: result.ok,
                count: result.count,
                screen: result.screen,
                list: result.list,
                hasStore: NativeDanmaku.hasListStore(),
                diag: NativeDanmaku.diag(),
            });

            if (!silent) {
                if (!ok) {
                    let msg = `原生注入失败（${danmakuList.length} 条未写入播放器）`;
                    if (result.reason === 'player_not_ready') msg = 'DanmakuX 未就绪，请稍后重试';
                    else if (!NativeDanmaku.hasListStore()) {
                        msg += '。请先播放视频几秒后再合并';
                    }
                    showCustomToast(msg, 4500);
                } else {
                    const hint = NativeDanmaku.formatInjectHint({
                        count: result.count,
                        screen: result.screen,
                        list: result.list,
                        firstSec: result.firstSec,
                    });
                    if (result.screen > 0 && !result.list) {
                        showCustomToast(`画面已注入 ${result.count} 条；列表未同步。油猴菜单→重新同步右侧列表`, 5500);
                    } else {
                        showCustomToast(`已注入原生弹幕 ${result.count} 条${hint ? `（${hint}）` : ''}`);
                    }
                }
            }

            return result;
        });
    }

    // --- 界面组件 ---
    function createMergerModal() {
        if (document.querySelector('.dm-merger-modal-mask')) return;

        const mask = document.createElement('div');
        mask.className = 'dm-merger-modal-mask';

        mask.innerHTML = `
            <div class="dm-merger-modal">
                <div class="dm-merger-header" style="flex-shrink:0;">
                    <span class="dm-merger-title">合并弹幕</span>
                    <span class="dm-merger-close">×</span>
                </div>
                <div class="dm-merger-body" style="display:flex; flex-direction:column; overflow:hidden; padding:0; height:600px;">
                    <div class="dm-merger-input-group" style="padding:15px; flex-shrink:0; border-bottom:1px solid var(--line_light, #eee); display:flex; align-items:center; gap:10px;">
                        <input type="text" id="dm-search-input" placeholder="输入链接 (BV...) 或关键词搜索..." value="" style="flex:1; height:36px; padding:0 12px;">
                        <button id="dm-search-btn" style="height:36px; flex-shrink:0;">搜索</button>
                        
                        <div id="dm-local-sort" style="display:flex; align-items:center; gap:10px; flex-shrink:0; margin-left:10px;">
                            <span style="font-size:12px; color:var(--text3, #999); font-weight:500;">排序：</span>
                            <div style="display:flex; gap:6px;">
                                <span data-sort="default" style="cursor:pointer; font-size:12px; color:#00AEEC; font-weight:bold; background:rgba(0,174,236,0.1); padding:2px 8px; border-radius:12px;">默认</span>
                                <span data-sort="play" style="cursor:pointer; font-size:12px; color:var(--text2, #555); padding:2px 8px; border-radius:12px; transition:all 0.2s;">播放量</span>
                                <span data-sort="danmaku" style="cursor:pointer; font-size:12px; color:var(--text2, #555); padding:2px 8px; border-radius:12px; transition:all 0.2s;">弹幕量</span>
                            </div>
                        </div>
                    </div>
                    <div id="dm-search-results" style="flex:1; overflow-y:auto; padding:10px 15px;"></div>
                    <div id="dm-search-actions" style="display:none; padding:12px 20px; border-top:1px solid var(--line_regular, #eee); background:var(--bg2, #f4f5f7); flex-shrink:0; justify-content:space-between; align-items:center;">
                        <div style="font-size:13px; color:var(--text2, #555); font-weight:500;">已选 <span id="dm-search-count" style="color:#00AEEC; font-weight:bold;">0</span> 项</div>
                        <div style="display:flex; gap:12px;">
                            <button id="dm-search-select-all" style="padding:6px 16px; cursor:pointer; background:var(--bg1, #fff); border:1px solid var(--line_regular, #ccd0d7); border-radius:6px; font-size:13px; color:var(--text1, #222); transition:all 0.2s;">全选</button>
                            <button id="dm-search-batch-btn" style="padding:8px 24px; cursor:pointer; background:#00AEEC; border:none; border-radius:6px; color:#fff; font-weight:bold; font-size:13px; transition:all 0.2s; box-shadow:0 4px 12px rgba(0,174,236,0.2);">合并选中</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(mask);

        // 事件绑定
        mask.querySelector('.dm-merger-close').onclick = () => mask.remove();
        mask.onclick = (e) => { if (e.target === mask) mask.remove(); };

        const searchBtn = mask.querySelector('#dm-search-btn');
        const input = mask.querySelector('#dm-search-input');
        const resultsDiv = mask.querySelector('#dm-search-results');

        let lastSearchResults = null;
        let currentSearchKeyword = '';
        let currentSearchPage = 1;
        let isLoadingMore = false;
        let hasMoreResults = true;
        let currentLocalSort = 'default';
        let originalSearchResults = null; // 用于重置排序

        // 本地排序逻辑
        mask.querySelectorAll('#dm-local-sort span[data-sort]').forEach(span => {
            span.onclick = () => {
                if (!lastSearchResults || lastSearchResults.length === 0) return;

                const sortType = span.dataset.sort;
                currentLocalSort = sortType;

                // UI 状态切换
                mask.querySelectorAll('#dm-local-sort span[data-sort]').forEach(s => {
                    s.style.color = '';
                    s.style.fontWeight = '';
                });
                span.style.color = '#00AEEC';
                span.style.fontWeight = 'bold';

                // 执行排序
                if (sortType === 'default') {
                    if (originalSearchResults) lastSearchResults = [...originalSearchResults];
                } else if (sortType === 'play') {
                    lastSearchResults.sort((a, b) => (b.play || 0) - (a.play || 0));
                } else if (sortType === 'danmaku') {
                    lastSearchResults.sort((a, b) => (b.video_review || 0) - (a.video_review || 0));
                }

                // 重新渲染
                resultsDiv.innerHTML = '';
                renderList(lastSearchResults, resultsDiv, false);
            };
        });

        // --- 批量搜索逻辑 ---
        const selectedBvids = new Set();
        const actionPanel = mask.querySelector('#dm-search-actions');
        const countSpan = mask.querySelector('#dm-search-count');
        const batchBtn = mask.querySelector('#dm-search-batch-btn');

        const updateSearchUI = () => {
            // 计算已选项：只要有搜索列表项或直接显示了分P列表，就显示操作面板
            const hasResultItems = document.querySelectorAll('.dm-result-item, .dm-page-list').length > 0;

            // 获取所有已展开视频的 BVID
            const expandedBvids = new Set();
            document.querySelectorAll('.dm-inline-details').forEach(details => {
                if (details.style.display === 'block') {
                    const wrapper = details.closest('.dm-result-wrapper');
                    if (wrapper) expandedBvids.add(wrapper.dataset.bvid);
                }
            });

            // 计算未展开但被选中的视频数量
            let unexpandedCount = 0;
            selectedBvids.forEach(bvid => {
                if (!expandedBvids.has(bvid)) unexpandedCount++;
            });

            // 计算已展开的分P选中数量
            const expandedPageItems = document.querySelectorAll('.dm-page-item .dm-checkbox.checked');
            const expandedCount = expandedPageItems.length;

            let totalCount = unexpandedCount + expandedCount;


            countSpan.innerText = totalCount;

            actionPanel.style.display = hasResultItems ? 'flex' : 'none';
            // 触发全局更新事件
            document.dispatchEvent(new CustomEvent('dm-selection-change'));
        };

        // 将选择上下文传递给渲染函数
        window._dmSearchContext = { selectedBvids, updateSearchUI };

        // 初始标题逻辑
        const currentTitle = document.querySelector('.video-title')?.title || document.querySelector('title').innerText.replace('_哔哩哔哩_bilibili', '');
        input.value = currentTitle;

        const doSearch = async (append = false) => {
            let keyword = input.value.trim();
            if (!keyword) return;

            // 从 URL 提取 BVID
            const bvMatch = keyword.match(/(BV[a-zA-Z0-9]{10})/i);
            if (bvMatch) {
                keyword = bvMatch[1];
            } else if (keyword.match(/av\d+/i)) {
                const avMatch = keyword.match(/(av\d+)/i);
                if (avMatch) keyword = avMatch[1];
            }

            // 如果是新搜索则重置分页
            if (!append) {
                currentSearchKeyword = keyword;
                currentSearchPage = 1;
                hasMoreResults = true;
                resultsDiv.innerHTML = '<div style="text-align:center;color:var(--text3, #999); margin-top:20px;">搜索/获取中...</div>';
            }

            try {
                if (/^(BV|av)/i.test(keyword)) {
                    const data = await API.getView(keyword);
                    renderVideoDetails(data, resultsDiv);
                    updateSearchUI(); // 确保显示操作面板
                    hasMoreResults = false; // 直接获取视频时没有更多结果
                } else {
                    const result = await API.search(keyword, currentSearchPage);
                    const videos = result.find(r => r.result_type === 'video');
                    if (videos && videos.data && videos.data.length > 0) {
                        if (append) {
                            lastSearchResults = [...lastSearchResults, ...videos.data];
                            if (originalSearchResults) originalSearchResults = [...originalSearchResults, ...videos.data];
                        } else {
                            lastSearchResults = videos.data;
                            originalSearchResults = [...videos.data];
                        }

                        // 如果有当前排序，则应用
                        if (currentLocalSort === 'play') {
                            lastSearchResults.sort((a, b) => (b.play || 0) - (a.play || 0));
                        } else if (currentLocalSort === 'danmaku') {
                            lastSearchResults.sort((a, b) => (b.video_review || 0) - (a.video_review || 0));
                        }

                        renderList(lastSearchResults, resultsDiv, append);
                        // 如果结果少于每页数量，则表示没有更多结果了
                        hasMoreResults = videos.data.length >= 30;
                    } else {
                        if (!append) {
                            resultsDiv.innerHTML = '<div style="text-align:center;color:var(--text3, #999); margin-top:20px;">未找到相关视频</div>';
                            lastSearchResults = null;
                        }
                        hasMoreResults = false;
                    }
                }
            } catch (e) {
                if (!append) {
                    resultsDiv.innerHTML = `<div style="text-align:center;color:#f25d8e; margin-top:20px;">搜索出错: ${e}</div>`;
                }
            }
            isLoadingMore = false;
        };

        // 无限滚动加载逻辑
        resultsDiv.addEventListener('scroll', () => {
            if (isLoadingMore || !hasMoreResults) return;
            const { scrollTop, scrollHeight, clientHeight } = resultsDiv;
            // 距离底部 100px 时触发加载
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                isLoadingMore = true;
                currentSearchPage++;
                // 显示加载提示
                const loader = document.createElement('div');
                loader.className = 'dm-load-more';
                loader.style.cssText = 'text-align:center; padding:15px; color:var(--text3, #999);';
                loader.innerText = '加载更多...';
                resultsDiv.appendChild(loader);
                doSearch(true).then(() => {
                    // 移除加载提示
                    const loaders = resultsDiv.querySelectorAll('.dm-load-more');
                    loaders.forEach(l => l.remove());
                });
            }
        });


        searchBtn.onclick = () => {
            selectedBvids.clear();
            updateSearchUI();
            doSearch();
        };

        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                selectedBvids.clear();
                updateSearchUI();
                doSearch();
            }
        };

        input.focus();

        // 批量合并按钮逻辑
        batchBtn.onclick = () => {
            const tasks = [];
            document.querySelectorAll('.dm-page-item .dm-checkbox.checked').forEach(cb => {
                const item = cb.closest('.dm-page-item');
                const listContainer = item.closest('.dm-page-list');
                const { cid, part, page } = item.dataset;
                let offset = 0;
                const typeSel = item.querySelector('.dm-offset-type');
                const valInput = item.querySelector('.dm-offset-input');
                if (typeSel && valInput) offset = parseInt(typeSel.value) * (parseFloat(valInput.value) || 0);

                tasks.push({
                    cid,
                    title: `P${page} ${part}`,
                    bvid: listContainer.dataset.bvid,
                    pic: listContainer.dataset.pic,
                    author: listContainer.dataset.author,
                    offset,
                    groupTitle: listContainer.dataset.title
                });
            });

            selectedBvids.forEach(bvid => {
                const wrapper = document.querySelector(`.dm-result-wrapper[data-bvid="${bvid}"]`);
                if (!wrapper) return;
                const details = wrapper.querySelector('.dm-inline-details');
                if (details?.style.display !== 'none' && details?.querySelector('.dm-page-list')) return;

                const title = wrapper.querySelector('.dm-result-title').innerText;
                const metaDiv = wrapper.querySelector('.dm-result-meta').innerText;
                const author = metaDiv.split('·')[0].replace('UP:', '').trim();
                const pic = wrapper.querySelector('.dm-result-cover').src;

                tasks.push({ bvid, fetchRequired: true, title, pic, author, groupTitle: title });
            });

            if (tasks.length === 0) return showCustomToast('未选择任何内容');

            showCustomConfirm('批量合并', `即将合并 ${tasks.length} 项，是否继续？`, async () => {
                mask.remove();
                const toast = document.createElement('div');
                toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:10px 20px;border-radius:4px;z-index:999999;';
                toast.innerText = '正在准备合并...';
                document.body.appendChild(toast);

                let success = 0;
                let fail = 0;
                let totalDm = 0;
                let screenDm = 0;
                let lastFailReason = '';
                const reasonText = {
                    player_not_ready: '播放器未就绪',
                    no_db: 'DanmakuX 不可用',
                    addList_error: 'addList 异常',
                    screen_empty: '画面未写入',
                    inject_failed: '注入未生效',
                };
                for (let task of tasks) {
                    try {
                        let { cid, title } = task;
                        if (task.fetchRequired) {
                            const data = await API.getView(task.bvid);
                            if (data?.pages?.length > 0) {
                                cid = data.pages[0].cid;
                                title = `P1 ${data.pages[0].part}`;
                                Object.assign(task, { cid, title, pic: data.pic, author: data.owner.name, groupTitle: data.title });
                            } else throw new Error('没有分P数据');
                        }
                        const xml = await API.getDanmaku(cid);
                        const list = parseDanmaku(xml);
                        const sourceId = task.bvid ? `${task.bvid}_${cid}` : String(cid);
                        const result = await injectDanmaku(list, { ...task, id: sourceId }, true, (phase) => {
                            toast.innerText = `正在注入: ${title}（${list.length} 条）· ${phase}`;
                        });
                        if (result.ok) {
                            success++;
                            totalDm += result.count;
                            screenDm += result.screen || 0;
                        } else {
                            fail++;
                            lastFailReason = result.reason || 'inject_failed';
                        }
                        toast.innerText = `进度 ${success + fail}/${tasks.length}：${title}`;
                    } catch (e) {
                        fail++;
                    }
                }
                let finalMsg = `合并完成：${success}/${tasks.length} 个源`;
                if (totalDm > 0) finalMsg += `，共 ${totalDm} 条`;
                if (screenDm > 0) finalMsg += `，画面已写入 ${screenDm} 条`;
                else if (success > 0) finalMsg += '，原生画面未写入（请确认 DanmakuX 已加载）';
                if (fail > 0) {
                    finalMsg += `，${fail} 个失败`;
                    if (lastFailReason) finalMsg += `（${reasonText[lastFailReason] || lastFailReason}）`;
                }
                if (success > 0 && !NativeDanmaku.hasListStore()) {
                    finalMsg += '；右侧列表未同步（请先播放几秒再合并）';
                }
                if (fail > 0 && lastFailReason === 'player_not_ready') {
                    finalMsg += '；请先播放几秒再合并';
                }
                toast.innerText = finalMsg;
                setTimeout(() => toast.remove(), 5000);
            });
        };

        // 监听选择变化
        document.addEventListener('dm-selection-change', () => {
            const innerCount = document.querySelectorAll('.dm-page-item .dm-checkbox.checked').length;
            const hasSelection = innerCount > 0 || selectedBvids.size > 0;
            batchBtn.style.opacity = hasSelection ? '1' : '0.5';
            batchBtn.style.pointerEvents = hasSelection ? 'auto' : 'none';
        });

        // 全选逻辑
        mask.querySelector('#dm-search-select-all').onclick = () => {
            const resultWrappers = mask.querySelectorAll('.dm-result-wrapper');
            if (resultWrappers.length > 0) {
                const allSelected = resultWrappers.length === selectedBvids.size;
                resultWrappers.forEach(wrapper => {
                    const { bvid } = wrapper.dataset;
                    const checkbox = wrapper.querySelector('.dm-checkbox');
                    if (allSelected) {
                        selectedBvids.delete(bvid);
                        checkbox?.classList.remove('checked');
                    } else {
                        selectedBvids.add(bvid);
                        checkbox?.classList.add('checked');
                    }
                });
                updateSearchUI();
            }
        };
    }

    function renderList(videos, container, append = false) {
        const { selectedBvids, updateSearchUI } = window._dmSearchContext || { selectedBvids: new Set(), updateSearchUI: () => { } };

        // 生成单个视频项的 HTML
        const createItemHTML = (v) => {
            const isSelected = selectedBvids.has(v.bvid);

            // 格式化时长（支持秒数或字符串格式 "HH:MM:SS"）
            const formatDuration = (duration) => {
                if (!duration) return '';

                // 如果是字符串格式，直接返回
                if (typeof duration === 'string') {
                    return duration;
                }

                // 如果是秒数，转换为时间格式
                const h = Math.floor(duration / 3600);
                const m = Math.floor((duration % 3600) / 60);
                const s = duration % 60;
                if (h > 0) {
                    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                }
                return `${m}:${s.toString().padStart(2, '0')}`;
            };

            const durationText = formatDuration(v.duration);
            const plainTitle = v.title.replace(/<[^>]+>/g, '');

            return `
            <div class="dm-result-wrapper" data-bvid="${v.bvid}" style="border-bottom:1px solid var(--line_light, #f0f0f0);">
                <div class="dm-result-item" style="display:flex; gap:12px; padding:10px; cursor:pointer; align-items:center;">
                    <div class="dm-checkbox ${isSelected ? 'checked' : ''}" style="flex-shrink:0;"></div>

                    <div style="width:110px; height:70px; border-radius:4px; overflow:hidden; background:#e7e7e7; flex-shrink:0; position:relative;">
                        <img class="dm-result-cover" src="${v.pic.startsWith('//') ? 'https:' + v.pic : v.pic}" style="width:100%; height:100%; object-fit:cover;" referrerpolicy="no-referrer">
                        ${durationText ? `<div style="position:absolute; bottom:4px; right:4px; background:rgba(0,0,0,0.7); color:#fff; font-size:11px; padding:1px 4px; border-radius:2px; font-weight:500;">${durationText}</div>` : ''}
                    </div>

                    <div class="dm-result-info" style="flex:1; min-width:0; overflow:hidden;">
                        <div class="dm-result-title" title="${plainTitle}" style="font-size:14px; font-weight:500; color:var(--text1, #222); margin-bottom:6px; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${plainTitle}</div>
                        <div class="dm-result-meta" style="font-size:12px; color:var(--text3, #999);">UP: ${v.author} · ${v.play}播放</div>
                    </div>

                    <div class="dm-expand-btn" style="flex-shrink:0; display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:50%; transition:background 0.2s;">
                         <svg class="dm-arrow-icon" viewBox="0 0 24 24" width="20" height="20" fill="var(--text3, #999)" style="transition:transform 0.2s;"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
                    </div>
                </div>
                <div class="dm-inline-details" id="dm-details-${v.bvid}" style="display:none; background:var(--bg2, #f9f9f9); padding:10px; border-top:1px solid var(--line_light, #eee);">
                    <div style="text-align:center; color:var(--text3, #999); padding:20px;">加载分P中...</div>
                </div>
            </div>
        `;
        };

        // 绑定事件处理器到指定的 wrapper
        const bindWrapperEvents = (wrapper) => {
            const bvid = wrapper.dataset.bvid;
            const item = wrapper.querySelector('.dm-result-item');
            const checkbox = wrapper.querySelector('.dm-checkbox');
            const details = wrapper.querySelector('.dm-inline-details');
            const arrow = wrapper.querySelector('.dm-arrow-icon');
            let isLoaded = false;

            // 复选框逻辑（优化：不触发展开）
            if (checkbox) {
                checkbox.onclick = (e) => {
                    e.stopPropagation();
                    const isChecking = !selectedBvids.has(bvid);

                    if (isChecking) {
                        selectedBvids.add(bvid);
                        checkbox.classList.add('checked');

                        // 如果该视频已展开，同时全选其所有分P
                        const pageList = details.querySelector('.dm-page-list');
                        if (pageList && details.style.display !== 'none') {
                            pageList.querySelectorAll('.dm-checkbox').forEach(cb => cb.classList.add('checked'));
                        }
                    } else {
                        selectedBvids.delete(bvid);
                        checkbox.classList.remove('checked');

                        // 如果该视频已展开，同时取消选中其所有分P
                        const pageList = details.querySelector('.dm-page-list');
                        if (pageList && details.style.display !== 'none') {
                            pageList.querySelectorAll('.dm-checkbox').forEach(cb => cb.classList.remove('checked'));
                        }
                    }
                    updateSearchUI();
                };
            }

            // 点击封面跳转
            const cover = wrapper.querySelector('.dm-result-cover');
            if (cover) {
                cover.onclick = (e) => {
                    e.stopPropagation();
                    window.open(`https://www.bilibili.com/video/${bvid}`, '_blank');
                };
                cover.style.cursor = 'pointer';
            }

            // 展开逻辑
            item.onclick = async (e) => {
                // 忽略点击复选框或封面的情况（已由上方逻辑处理）
                if (e.target === checkbox || e.target.classList.contains('dm-checkbox')) return;
                if (e.target === cover || e.target.classList.contains('dm-result-cover')) return;

                // 切换显隐
                const isExpanded = details.style.display !== 'none';

                if (isExpanded) {
                    details.style.display = 'none';
                    arrow.style.transform = 'rotate(0deg)';
                } else {
                    details.style.display = 'block';
                    arrow.style.transform = 'rotate(-180deg)';

                    if (!isLoaded) {
                        try {
                            const data = await API.getView(bvid);
                            renderVideoDetails(data, details);
                            isLoaded = true;
                        } catch (err) {
                            details.innerHTML = `<div style="text-align:center;color:#f25d8e;">加载失败: ${err}</div>`;
                        }
                    }
                }
            };
        };

        // 追加模式：查找现有bvid，只添加新项
        if (append) {
            const existingBvids = new Set();
            container.querySelectorAll('.dm-result-wrapper').forEach(w => existingBvids.add(w.dataset.bvid));

            videos.forEach(v => {
                if (!existingBvids.has(v.bvid)) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = createItemHTML(v);
                    const wrapper = tempDiv.firstElementChild;
                    container.appendChild(wrapper);
                    bindWrapperEvents(wrapper);
                }
            });
        } else {
            // 重新渲染所有
            container.innerHTML = videos.map(v => createItemHTML(v)).join('');
            container.querySelectorAll('.dm-result-wrapper').forEach(wrapper => {
                bindWrapperEvents(wrapper);
            });
        }

        updateSearchUI();
    }

    function renderVideoDetails(videoData, container) {
        const pages = videoData.pages || [];
        const multiPart = pages.length > 1;

        container.innerHTML = `
        <div class="dm-direct-details" style="padding: 10px 0;">
            ${multiPart ? `
            <div class="dm-part-mode-panel">
                <label class="dm-part-mode-toggle-row">
                    <input type="checkbox" class="dm-part-mode-toggle">
                    <span style="font-size:13px; font-weight:600; color:var(--text1, #222);">分P有效顺延</span>
                    <span style="font-size:11px; color:var(--text3, #999);">一集拆多P、尾部多为拼接素材时，按正片有效时长对齐弹幕</span>
                </label>
                <div class="dm-part-mode-fields" style="display:none;">
                    <div style="display:flex; flex-wrap:wrap; gap:10px 16px; align-items:center;">
                        <label style="font-size:12px; color:var(--text2, #555); display:flex; align-items:center; gap:6px;">
                            本集有效时长
                            <input type="text" class="dm-total-duration dm-part-duration-input" placeholder="24:00" title="本集正片有效内容总时长（非 B 站分P总时长），支持 mm:ss 或 hh:mm:ss">
                        </label>
                        <label style="font-size:12px; color:var(--text2, #555); display:flex; align-items:center; gap:6px;">
                            每P有效时长
                            <input type="text" class="dm-uniform-part-duration dm-part-duration-input" placeholder="7:00" title="各P有效内容等长时填写（如前三P各约7分钟）；最后一P通常更短，请在下方单独填">
                        </label>
                        <button type="button" class="dm-part-calc-btn">计算顺延</button>
                        <button type="button" class="dm-part-select-all-btn" style="padding:4px 12px; background:var(--bg1,#fff); color:var(--text2,#555); border:1px solid var(--line_regular,#ccd0d7); border-radius:4px; font-size:12px; cursor:pointer;">全选分P</button>
                    </div>
                    <div class="dm-part-mode-hint" style="font-size:11px; color:var(--text3, #999); margin-top:8px; line-height:1.6;">
                        例：24 分钟一集拆 4P，前三 P 各约 7 分钟有效内容，P4 不足 7 分钟请在下方单独填写。P1 顺延 0 秒，P2 顺延 P1 有效时长，依此类推。旁注「B站片长」仅供对照，不计入顺延。
                    </div>
                </div>
            </div>
            ` : ''}
            <div style="font-size:12px;color:var(--text3, #999);margin-bottom:8px;">共 ${pages.length} 个分P：</div>
            <div class="dm-page-list"
                data-bvid="${videoData.bvid}"
                data-title="${videoData.title}"
                data-pic="${videoData.pic}"
                data-author="${videoData.owner ? videoData.owner.name : ''}"
                style="max-height:300px; overflow-y:auto; border:1px solid var(--line_regular, #eee); border-radius:4px; background:var(--bg1, #fff);">
                ${pages.map(p => `
                    <div class="dm-page-item" data-cid="${p.cid}" data-part="${p.part}" data-page="${p.page}" style="padding:10px; border-bottom:1px solid var(--line_light, #eee); cursor:pointer; display:flex; align-items:center; gap:10px;">
                        <div class="dm-checkbox" style="flex-shrink:0;"></div>
    
                        <!-- 缩略图 -->
                        <div style="width:120px; height:75px; border-radius:6px; overflow:hidden; background:#e7e7e7; flex-shrink:0; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
                            <img src="${videoData.pic.startsWith('//') ? 'https:' + videoData.pic : videoData.pic}" style="width:100%; height:100%; object-fit:cover;" referrerpolicy="no-referrer">
                        </div>
    
                        <!-- 信息 -->
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:13px; font-weight:bold; color:var(--text1, #222); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="P${p.page} ${p.part}">P${p.page} - ${p.part}</div>
                            <div style="font-size:12px; color:var(--text2, #555); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;" title="${videoData.title}">${videoData.title}</div>
                            <div style="font-size:12px; color:var(--text3, #999); margin-top:2px;">
                                UP: ${videoData.owner ? videoData.owner.name : '未知'}
                                <span class="dm-page-duration-badge" data-cid="${p.cid}" style="margin-left:8px;"></span>
                                <span class="dm-count-badge" data-cid="${p.cid}" style="margin-left:8px; color:#00AEEC; font-weight:500;">· 弹幕加载中...</span>
                            </div>
                            <div class="dm-part-offset-preview" style="display:none; font-size:11px; color:#00AEEC; margin-top:3px;"></div>
                        </div>

                        <div class="dm-part-duration-cell" style="display:none; flex-shrink:0; align-items:center; gap:4px;" onclick="event.stopPropagation()">
                            <span style="font-size:11px; color:var(--text3, #999);">有效时长</span>
                            <input type="text" class="dm-part-duration-input" data-page="${p.page}" data-cid="${p.cid}" placeholder="7:00" title="该分P正片有效内容时长（不含尾部拼接素材），用于计入顺延">
                        </div>

                        <div class="dm-page-offset" style="margin-left:auto; display:flex; align-items:center; background:var(--bg2, #f4f5f7); border-radius:4px; padding:2px 6px;" onclick="event.stopPropagation()">
                           <select class="dm-offset-type" style="background:transparent; border:none; color:var(--text2, #555); font-size:12px; outline:none; cursor:pointer; margin-right:4px;">
                               <option value="1">推迟</option>
                               <option value="-1">提前</option>
                           </select>
                           <input type="number" step="0.5" min="0" value="0" class="dm-offset-input" data-cid="${p.cid}"
                               style="width:40px; background:transparent; border:none; border-bottom:1px solid #ddd; text-align:center; font-size:12px; color:var(--text1, #222); outline:none;">
                           <span style="font-size:12px; color:var(--text3, #999); margin-left:2px;">秒</span>
                       </div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;

        const updateBatchBtn = () => {
            // 派发事件以通知父级全局按钮更新
            document.dispatchEvent(new CustomEvent('dm-selection-change'));
        };

        const toggleItem = (item) => {
            // 从全局上下文获取
            const { selectedBvids, updateSearchUI } = window._dmSearchContext || { selectedBvids: new Set(), updateSearchUI: () => { } };

            const checkbox = item.querySelector('.dm-checkbox');
            if (checkbox.classList.contains('checked')) {
                checkbox.classList.remove('checked');
            } else {
                checkbox.classList.add('checked');
            }

            // 反向同步：检查所有分P的选中状态，更新上级复选框
            const pageList = container.querySelector('.dm-page-list');
            if (pageList) {
                const bvid = pageList.dataset.bvid;
                const allPageItems = pageList.querySelectorAll('.dm-page-item');
                const checkedPageItems = pageList.querySelectorAll('.dm-page-item .dm-checkbox.checked');

                // 找到对应的搜索结果 wrapper
                const resultWrapper = document.querySelector(`.dm-result-wrapper[data-bvid="${bvid}"]`);
                if (resultWrapper) {
                    const parentCheckbox = resultWrapper.querySelector('.dm-result-item .dm-checkbox');
                    if (parentCheckbox) {
                        // 如果所有分P都被选中，勾选上级复选框；否则取消勾选
                        if (checkedPageItems.length === allPageItems.length && allPageItems.length > 0) {
                            selectedBvids.add(bvid);
                            parentCheckbox.classList.add('checked');
                        } else {
                            selectedBvids.delete(bvid);
                            parentCheckbox.classList.remove('checked');
                        }
                    }
                }
            }

            // 调用 updateSearchUI 更新计数
            if (updateSearchUI) updateSearchUI();
            updateBatchBtn();

            if (pageList && isPartModeEnabled(pageList)) {
                applyPartModeOffsets(pageList, true);
            } else if (pageList) {
                updatePageItemOffsetVisibility(pageList);
            }
        };

        // 列表项点击事件
        container.querySelectorAll('.dm-page-item').forEach(item => {
            item.onclick = () => toggleItem(item);
        });

        // 分P模式：开关、时长输入、自动计算推迟
        if (multiPart) {
            const pageList = container.querySelector('.dm-page-list');
            const panel = container.querySelector('.dm-part-mode-panel');
            const toggle = panel?.querySelector('.dm-part-mode-toggle');
            const calcBtn = panel?.querySelector('.dm-part-calc-btn');
            const selectAllBtn = panel?.querySelector('.dm-part-select-all-btn');
            const totalInput = panel?.querySelector('.dm-total-duration');
            const uniformInput = panel?.querySelector('.dm-uniform-part-duration');
            const bvid = videoData.bvid;
            let calcTimer = null;

            const persistPartModeState = () => {
                savePartModeState(bvid, {
                    total: totalInput?.value || '',
                    uniform: uniformInput?.value || '',
                });
            };

            const scheduleCalc = () => {
                if (!toggle?.checked) return;
                clearTimeout(calcTimer);
                calcTimer = setTimeout(() => {
                    applyPartModeOffsets(pageList, true);
                    persistPartModeState();
                }, 350);
            };

            const runCalc = () => {
                if (!toggle?.checked) {
                    showCustomToast('请先开启分P有效顺延', 2000);
                    return;
                }
                applyPartModeOffsets(pageList, false);
                persistPartModeState();
            };

            // 恢复上次填写的有效时长（开关默认不勾选）
            if (toggle) toggle.checked = false;
            setPartModeUI(pageList, false);
            const saved = loadPartModeState(bvid);
            if (saved) {
                if (totalInput && saved.total) totalInput.value = saved.total;
                if (uniformInput && saved.uniform) uniformInput.value = saved.uniform;
            }

            if (toggle) {
                toggle.onchange = () => {
                    setPartModeUI(pageList, toggle.checked);
                    if (toggle.checked) {
                        applyPartModeOffsets(pageList, true);
                    } else {
                        updatePageItemOffsetVisibility(pageList);
                    }
                    persistPartModeState();
                };
            }
            if (calcBtn) calcBtn.onclick = (e) => { e.stopPropagation(); runCalc(); };
            if (selectAllBtn) {
                selectAllBtn.onclick = (e) => {
                    e.stopPropagation();
                    selectAllPages(pageList, true);
                };
            }
            [totalInput, uniformInput].forEach((inp) => {
                if (!inp) return;
                inp.onclick = (e) => e.stopPropagation();
                inp.oninput = scheduleCalc;
            });
            pageList.querySelectorAll('.dm-part-duration-input[data-cid]').forEach((inp) => {
                inp.onclick = (e) => e.stopPropagation();
                inp.oninput = () => {
                    inp.dataset.userEdited = '1';
                    scheduleCalc();
                };
            });

            // 从 pagelist API 拉取 B 站分P总片长（仅作对照，不填入有效时长）
            API.getPageList(bvid).then((pageMeta) => {
                if (!Array.isArray(pageMeta) || !pageMeta.length) return;
                const durMap = new Map(pageMeta.map((p) => [String(p.cid), p.duration]));

                pages.forEach((p) => {
                    const sec = durMap.get(String(p.cid)) || 0;
                    const badge = container.querySelector(`.dm-page-duration-badge[data-cid="${p.cid}"]`);
                    if (badge && sec > 0) {
                        badge.textContent = `· B站片长 ${formatDurationShort(sec)}`;
                        badge.style.color = 'var(--text3, #999)';
                    }
                });

            }).catch(() => { });
        }

        // 异步获取并显示弹幕数
        pages.forEach(async (p) => {
            try {
                const xml = await API.getDanmaku(p.cid);
                const list = parseDanmaku(xml);
                const badge = container.querySelector(`.dm-count-badge[data-cid="${p.cid}"]`);
                if (badge) badge.textContent = `· ${list.length} 条弹幕`;
            } catch (e) {
                const badge = container.querySelector(`.dm-count-badge[data-cid="${p.cid}"]`);
                if (badge) {
                    badge.textContent = '· 获取失败';
                    badge.style.color = '#ff6b6b';
                }
            }
        });
    }

    // --- 恢复会话 ---
    async function tryRestoreSession() {
        const videoId = engine.getCurrentVideoId();
        const key = `dm_merger_store_${videoId}`;
        const raw = GM_getValue(key);
        if (!raw) return;

        try {
            const sources = JSON.parse(raw);
            if (!Array.isArray(sources) || sources.length === 0) return;

            const toast = document.createElement('div');
            toast.innerText = `正在恢复 ${sources.length} 个任务...`;
            toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:8px 16px;border-radius:4px;z-index:999999;font-size:14px;';
            document.body.appendChild(toast);

            let restored = 0;
            for (const meta of sources) {
                try {
                    const xml = await API.getDanmaku(meta.cid);
                    const list = parseDanmaku(xml);
                    const result = await injectDanmaku(list, meta, true);
                    if (result.ok) restored++;
                } catch (e) { }
            }

            toast.innerText = restored > 0
                ? `已恢复 ${restored}/${sources.length} 个弹幕源`
                : `恢复失败，请手动重新合并`;
            setTimeout(() => toast.remove(), 4000);
        } catch (e) { }
    }


    function init() {
        if (!window.__dmMergerStoreReadyListener) {
            window.__dmMergerStoreReadyListener = true;
            document.addEventListener('dm-merger-store-ready', () => {
                clearTimeout(NativeDanmaku._storeReadyRetryTimer);
                NativeDanmaku._storeReadyRetryTimer = setTimeout(async () => {
                    if (!engine.sources?.size || NativeDanmaku._fullSyncing) return;
                    if (!NativeDanmaku.getDataBase() || !NativeDanmaku.hasListStore()) return;
                    const screen = NativeDanmaku.countMergedOnScreen();
                    const listLen = NativeDanmaku.getStores()?.dmListStore?.allDm?.length ?? 0;
                    if (screen > 0 && listLen > 0) return;
                    dmLog('Store 就绪，自动补同步', { screen, listLen, sources: engine.sources.size });
                    const result = await NativeDanmaku.fullSyncAsync(engine.sources);
                    engine.lastListSync = !!result.list;
                    engine.lastSyncResult = result;
                    document.dispatchEvent(new CustomEvent('dm-sources-updated'));
                    if (result.screen > 0 || result.list) {
                        dmLog('自动补同步完成', result);
                    }
                }, 1200);
            });
        }

        const checkExist = setInterval(() => {
            const toolbar = document.querySelector('.video-toolbar-left') ||
                document.querySelector('#arc_toolbar_report') ||
                document.querySelector('.video-info-meta');

            if (toolbar) {
                if (document.getElementById('dm-merger-btn')) return;

                const btn = document.createElement('span');
                btn.id = 'dm-merger-btn';
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;">
                        <circle cx="6" cy="6" r="3" />
                        <circle cx="18" cy="6" r="3" />
                        <circle cx="12" cy="18" r="3" />
                        <path d="M6 9 C 6 13.5, 12 11, 12 15" />
                        <path d="M18 9 C 18 13.5, 12 11, 12 15" />
                    </svg>
                    <span style="font-weight:400; font-size:14px;">合并弹幕</span>
                `;
                btn.title = '点击合并其他视频的弹幕';
                btn.onclick = createMergerModal;

                toolbar.appendChild(btn);

                tryRestoreSession();
                initRcmdQuickMerge();
                clearInterval(checkExist);
            }
        }, 3000);

        // --- SPA 导航监听：URL 变化时重置引擎 ---
        let lastUrl = location.href;
        let lastVideoId = engine.getCurrentVideoId();

        const urlObserver = new MutationObserver(() => {
            const currentUrl = location.href;
            const currentVideoId = engine.getCurrentVideoId();

            if (currentUrl !== lastUrl || currentVideoId !== lastVideoId) {
                lastUrl = currentUrl;
                lastVideoId = currentVideoId;

                engine.reset();
                const oldBtn = document.getElementById('dm-merger-btn');
                if (oldBtn) oldBtn.remove();
                setTimeout(() => init(), 1000);
            }
        });
        urlObserver.observe(document.body, { childList: true, subtree: true });
    }

    function initRcmdQuickMerge() {
        // 增强样式：完全模拟“稍后再看”并加入自定义动效
        const style = document.createElement('style');
        style.innerHTML = `
            .dm-quick-merge-btn {
            position: absolute !important;
            right: 6px !important;
            bottom: 6px !important; 
            width: 28px !important;
            height: 28px !important;
            background-color: rgba(0,0,0,.6) !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            display: none !important; 
            align-items: center !important;
            justify-content: center !important;
            z-index: 100 !important;
            color: #fff !important;
            transition: all .3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
            /* 确保父容器拥有定位上下文，覆盖首页新版卡片和旧版列表 */
            .pic-box, 
            .video-card .pic, 
            .video-card-common .pic,
            .bili-video-card__cover,
            .bili-video-card .cover,
            .video-page-card-small .pic-box {
                position: relative !important;
            }
            /* 各种卡片容器的 Hover 触发 */
            .pic-box:hover .dm-quick-merge-btn,
            .video-card .pic:hover .dm-quick-merge-btn,
            .video-card-common .pic:hover .dm-quick-merge-btn,
            .bili-video-card__cover:hover .dm-quick-merge-btn,
            .bili-video-card .cover:hover .dm-quick-merge-btn,
            .video-page-card-small .pic-box:hover .dm-quick-merge-btn {
                display: flex !important;
            }
            .dm-quick-merge-btn:hover {
                background-color: rgba(0,0,0,.8) !important;
                transform: scale(1.05) !important;
            }
            .dm-quick-merge-btn.active {
                color: #fff !important;
                background-color: rgba(0,0,0,0.8) !important;
            }
            /* 状态提示小气泡 */
        .dm-quick-tip {
            position: absolute !important;
            right: 34px !important;
            top: 50% !important;
            transform: translateY(-50%) translateX(10px) scale(0.8) !important;
            white-space: nowrap !important;
            background: rgba(21,21,21,.9) !important;
            color: #fff !important;
            padding: 5px 10px !important;
            border-radius: 4px !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            pointer-events: none !important;
            opacity: 0 !important;
            transition: all .2s cubic-bezier(0.18, 0.89, 0.32, 1.28) !important;
            z-index: 200 !important;
        }
        .dm-quick-merge-btn:hover .dm-quick-tip {
            opacity: 1 !important;
            transform: translateY(-50%) translateX(0) scale(1) !important;
        }
        /* 强制对齐并修正原生“稍后再看”提示（.wl-tips） */
        .wl-tips {
            left: auto !important;
            right: 34px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            margin-left: 0 !important;
            padding: 5px 10px !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            background: rgba(21,21,21,.9) !important;
            height: auto !important;
            border-radius: 4px !important;
        }
        `;
        document.head.appendChild(style);

        // 样式已在脚本开头注入

        // 监听全局弹幕源更新事件，刷新所有推荐位按钮状态
        document.addEventListener('dm-sources-updated', () => {
            updateDanmakuCountUI(); // 同步刷新顶部计数
            // 更新所有已生成的快速合并按钮
            document.querySelectorAll('.dm-quick-merge-btn').forEach(btn => {
                const card = btn.closest('.video-page-card-small, .video-card, .video-card-common');
                const link = card?.querySelector('a')?.href;
                const match = link?.match(/(BV[a-zA-Z0-9]{10})/i);
                if (match) {
                    const bvid = match[1];
                    const sources = engine.getSources();
                    const isMerged = sources.some(s => s.bvid === bvid);

                    // 内部 updateBtnUI 逻辑
                    if (isMerged) {
                        btn.classList.add('active');
                        btn.innerHTML = `
                             <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                             <span class="dm-quick-tip">已并入弹幕 (点击移除)</span>
                         `;
                    } else {
                        btn.classList.remove('active');
                        btn.innerHTML = `
                             <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                             <span class="dm-quick-tip">一键并入弹幕</span>
                         `;
                    }
                }
            });
        });

        const observer = new MutationObserver(() => {
            const pics = document.querySelectorAll('.pic-box, .video-card .pic, .video-card-common .pic, .bili-video-card__cover, .bili-video-card .cover');
            pics.forEach(pic => {
                if (pic.querySelector('.dm-quick-merge-btn')) return;

                const btn = document.createElement('div');
                btn.className = 'dm-quick-merge-btn';

                // 获取当前卡片的 BVID
                const card = pic.closest('.video-page-card-small, .video-card, .video-card-common, .bili-video-card');
                const link = card?.querySelector('a')?.href;
                const match = link?.match(/(BV[a-zA-Z0-9]{10})/i);
                const bvid = match ? match[1] : null;

                // 初始状态检查
                const sources = engine.getSources();
                const isInitiallyMerged = bvid && sources.some(s => s.bvid === bvid);

                if (isInitiallyMerged) {
                    btn.classList.add('active');
                    btn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                        <span class="dm-quick-tip">已并入弹幕 (点击移除)</span>
                    `;
                } else {
                    btn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        <span class="dm-quick-tip">一键并入弹幕</span>
                    `;
                }

                btn.onclick = async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!bvid) return;

                    if (btn.classList.contains('active')) {
                        // 1. 立即给用户视觉反馈，防止重复点击
                        btn.style.pointerEvents = 'none';
                        try {
                            const data = await API.getView(bvid);
                            if (data.pages?.length > 0) {
                                // 2. 执行删除
                                engine.removeSource(`${bvid}_${data.pages[0].cid}`);
                                // removeSource 会触发 dm-sources-updated 事件，
                                // 该事件监听器会自动将所有匹配该 bvid 的按钮恢复为 "+"
                                showCustomToast('已移除并入弹幕');
                            }
                        } catch (err) {
                            showCustomToast('移除失败');
                        } finally {
                            btn.style.pointerEvents = 'auto';
                        }
                        return;
                    }

                    btn.style.pointerEvents = 'none';

                    try {
                        const data = await API.getView(bvid);
                        if (data.pages?.length > 0) {
                            const p1 = data.pages[0];
                            const xml = await API.getDanmaku(p1.cid);
                            const list = parseDanmaku(xml);

                            const result = await injectDanmaku(list, {
                                id: `${bvid}_${p1.cid}`,
                                cid: p1.cid,
                                bvid: bvid,
                                title: data.title + (data.pages.length > 1 ? ' P1' : ''),
                                pic: data.pic,
                                author: data.owner?.name || '',
                                groupTitle: data.title
                            }, true);

                            if (result.ok) {
                                const hint = NativeDanmaku.formatInjectHint(result);
                                showCustomToast(`已并入：${data.title}${hint ? `（${hint}）` : ''}`);
                            } else {
                                showCustomToast(`并入失败：${data.title}`, 4500);
                            }
                        }
                    } catch (err) {
                        console.error('快速合并失败:', err);
                        showCustomToast('合并失败', 4500);
                    } finally {
                        btn.style.pointerEvents = 'auto';
                    }
                };

                pic.appendChild(btn);
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }


    // --- 脚本菜单 ---
    registerMergerMenu('🔍 弹幕列表诊断', async () => {
        const diag = await NativeDanmaku.diagAsync(8000);
        dmLog('菜单诊断', diag);
        alert(diag ? JSON.stringify(diag, null, 2) : '诊断失败');
    });

    registerMergerMenu('🔄 重新同步右侧列表', async () => {
        if (!await NativeDanmaku.waitForPlayer(20000)) {
            const r = NativeDanmaku.getPlayerReadiness();
            const hint = !r.hasBpx && !r.hasVideo
                ? '请在视频播放页操作'
                : (!r.hasPlayer ? '请刷新页面' : '请先点击播放 2～5 秒');
            alert(`播放器未就绪：${hint}`);
            return;
        }
        NativeDanmaku.ensureCapture(true);
        if (!NativeDanmaku.hasListStore()) {
            await NativeDanmaku.burstCaptureStore();
        }
        if (!engine.sources?.size) {
            alert('当前页无已合并源，请先合并弹幕');
            return;
        }
        const result = await NativeDanmaku.fullSyncAsync(engine.sources);
        dmLog('手动列表重同步', result);
        alert(`同步完成：画面 ${result.screen} 条，列表 ${result.list ? '已写入' : '未写入'}\nallDm: ${NativeDanmaku.getStores()?.dmListStore?.allDm?.length ?? '无'}`);
    });

    registerMergerMenu('🗑️ 清除所有弹幕合并记忆', () => {
        const dmKeys = listMergerStorageKeys().filter(k => k.startsWith('dm_merger_store_'));

        if (dmKeys.length === 0) {
            alert('没有已保存的数据。');
            return;
        }

        if (confirm(`确定要清除所有 ${dmKeys.length} 个视频的记录吗？`)) {
            dmKeys.forEach(key => GM_deleteValue(key));
            location.reload();
        }
    });


  injectPageBridge()
  document.addEventListener('DOMContentLoaded', () => {
    if (!pageWin().__dmMergerBridge) {
      dmWarn('DOM 就绪后补注页面桥接')
      injectPageBridge()
    }
  })
  init()
  return () => {
    removeStyle(DM_MERGER_STYLE_NAME)
    if (typeof GM_unregisterMenuCommand === 'function') {
      menuCommandIds.forEach(id => GM_unregisterMenuCommand(id))
    }
    engine.reset()
    const btn = document.getElementById('dm-merger-btn')
    if (btn) btn.remove()
    document.querySelectorAll('.dm-quick-merge-btn').forEach(el => el.remove())
    const mask = document.getElementById('dm-merger-mask')
    if (mask) mask.remove()
    const mgr = document.getElementById('dm-manager-mask')
    if (mgr) mgr.remove()
    const toast = document.getElementById('dm-merger-toast')
    if (toast) toast.remove()
  }
}
