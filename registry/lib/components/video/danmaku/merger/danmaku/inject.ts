/* eslint-disable */
// @ts-nocheck
import { dmLog, dmWarn } from './log'

/** 合并弹幕 dmid 前缀，用于识别脚本注入的弹幕 */
export const DM_MERGER_PREFIX = 'dmmerger_'

/** 从 BV 号或复合 id 中提取标准 bvid */
function extractBvid(raw) {
  const s = String(raw || '').trim()
  if (!s) return ''
  if (/^BV[a-zA-Z0-9]{10}$/.test(s)) return s
  const fromId = s.match(/^(BV[a-zA-Z0-9]{10})_/)
  if (fromId) return fromId[1]
  const embedded = s.match(/BV[a-zA-Z0-9]{10}/)
  return embedded ? embedded[0] : ''
}

/**
 * 创建原生弹幕桥接对象（屏幕 + 右侧列表双写）
 * @param pageWin 返回页面 window（通常为 unsafeWindow）
 */
export function createNativeDanmaku(pageWin: () => Window) {
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
  return NativeDanmaku;
}

export type NativeDanmakuApi = ReturnType<typeof createNativeDanmaku>