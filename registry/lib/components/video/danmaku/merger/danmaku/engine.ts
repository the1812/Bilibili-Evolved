/* eslint-disable @typescript-eslint/ban-ts-comment, no-underscore-dangle */
// @ts-nocheck
/**
 * 弹幕合并引擎
 *
 * 管理多源弹幕列表、与 B 站原生 DanmakuX 同步，并保留旧版自绘层实现（已弃用）。
 */

import { getStorage } from '../storage'
import { filterSourcesMapByViewCid, getCurrentPageCid } from '../runtime/helpers'
import type { NativeDanmakuApi } from './inject'
import { dmLog, dmWarn } from './log'

/** 弹幕合并引擎：多源聚合 + 原生列表同步 */
export class DanmakuEngine {
  nativeDanmaku: NativeDanmakuApi
  video: HTMLVideoElement | null
  container: HTMLDivElement | null
  danmakuList: unknown[]
  cursor: number
  isPlaying: boolean
  lastTime: number
  activeAnimations: Set<Animation>
  styleCache: Record<string, string> | null
  checkInterval: ReturnType<typeof setInterval> | null
  rafId: number | null
  nativeMode: boolean
  lastListSync: boolean
  lastSyncResult: unknown
  sources?: Map<string, { list: unknown[]; meta: Record<string, unknown> }>
  activeViewCid: string | null

  constructor(nativeDanmaku: NativeDanmakuApi) {
    this.nativeDanmaku = nativeDanmaku
    this.video = null
    this.container = null
    this.danmakuList = []
    this.cursor = 0
    this.isPlaying = false
    this.lastTime = 0
    this.activeAnimations = new Set()
    this.styleCache = null
    this.checkInterval = null
    this.rafId = null // 用于 requestAnimationFrame
    this.nativeMode = false
    this.lastListSync = false
    this.lastSyncResult = null
    this.activeViewCid = null
  }

  setActiveViewCid(cid: string | null) {
    this.activeViewCid = cid != null ? String(cid) : null
  }

  getActiveSources() {
    return filterSourcesMapByViewCid(this.sources, this.activeViewCid)
  }

  init() {
    // 仅使用 B 站原生弹幕（DanmakuX + 右侧列表），不自绘
    if (this.nativeDanmaku.getDataBase()) {
      this.nativeMode = true
      this.video = document.querySelector('video') || null
      return true
    }
    return false
  }

  /** @deprecated 保留旧自绘实现，合并流程不再调用 */
  _initCustomLayer() {
    const videoWrap =
      document.querySelector('.bpx-player-video-wrap') ||
      document.querySelector('.bilibili-player-video-wrap') ||
      document.querySelector('#bilibili-player')

    if (!videoWrap) {
      return false
    }

    this.video = videoWrap.querySelector('video')
    if (!this.video) {
      return false
    }

    // 移除已存在的容器
    if (this.container) {
      this.container.remove()
    }

    // 创建覆盖层容器
    this.container = document.createElement('div')
    this.container.className = 'custom-dm-layer'
    this.container.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:10;'

    // 插入到视频元素之后
    this.video.parentElement.insertBefore(this.container, this.video.nextSibling)

    // 绑定事件
    this._boundPlay = () => {
      this.isPlaying = true
      this.resumeAll()
    }
    this._boundPause = () => {
      this.isPlaying = false
      this.pauseAll()
    }
    this._boundSeek = () => {
      this.handleSeek()
    }
    this._boundTimeUpdate = () => {
      this.onTimeUpdate()
    }

    const v = this.video
    ;['play', 'pause', 'seeking', 'timeupdate'].forEach(ev => {
      v.removeEventListener(ev, this[`_bound${ev.charAt(0).toUpperCase() + ev.slice(1)}`])
      v.addEventListener(ev, this[`_bound${ev.charAt(0).toUpperCase() + ev.slice(1)}`])
    })

    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    this.checkInterval = setInterval(() => {
      this.updateStyles()
    }, 2000)

    // 启动渲染驱动
    this.startLoop()

    this.isPlaying = !this.video.paused
    return true
  }

  startLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
    const loop = () => {
      this.update()
      this.rafId = requestAnimationFrame(loop)
    }
    this.rafId = requestAnimationFrame(loop)
  }

  stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  // --- 资源管理 ---

  getCurrentVideoId() {
    // 优先从 URL 参数获取 BVID（适配稍后再看等列表页）
    const params = new URLSearchParams(location.search)
    const bvidParam = params.get('bvid')
    if (bvidParam && /^BV[a-zA-Z0-9]{10}$/i.test(bvidParam)) {
      return bvidParam.toUpperCase()
    }

    // 其次从路径获取（适配普通视频页）
    const pathMatch = location.pathname.match(/\/video\/(BV[a-zA-Z0-9]{10})/i)
    if (pathMatch) {
      return pathMatch[1].toUpperCase()
    }

    // 兜底使用路径名（适配番剧等）
    return location.pathname
  }

  addSource(id, list, meta, deferNativeSync = false) {
    this.sources = this.sources || new Map()
    const key = String(id)
    if (meta.offset === undefined) {
      meta.offset = 0
    }
    if (meta.viewCid == null || meta.viewCid === '') {
      const pageCid = getCurrentPageCid()
      if (pageCid) {
        meta.viewCid = pageCid
      }
    }
    this.sources.set(key, { list, meta })
    this.rebuildListMeta()
    if (!deferNativeSync) {
      this.syncNative()
    }
    this.saveState()
  }

  updateSource(id, updates) {
    const key = String(id)
    if (this.sources && this.sources.has(key)) {
      const source = this.sources.get(key)
      // 若包含列表则替换
      if (updates.list) {
        source.list = updates.list
        delete updates.list
      }
      Object.assign(source.meta, updates)
      this.rebuildList()
      this.saveState()
    }
  }

  removeSource(id) {
    const key = String(id)
    if (this.sources && this.sources.has(key)) {
      this.sources.delete(key)
      this.rebuildList()
      this.saveState()
      // 派发更新事件
      document.dispatchEvent(new CustomEvent('dm-sources-updated'))
    }
  }

  getSources() {
    return this.sources
      ? Array.from(this.sources.values()).map(v => ({ id: v.meta.id, ...v.meta }))
      : []
  }

  rebuildListMeta() {
    let all = []
    if (this.sources) {
      this.sources.forEach(source => {
        const offset = parseFloat(source.meta.offset) || 0
        const adjusted = source.list.map(dm => {
          const newDm = { ...dm }
          newDm.time += offset
          return newDm
        })
        all = all.concat(adjusted)
      })
    }
    this.danmakuList = all.sort((a, b) => a.time - b.time)
  }

  syncNative() {
    this.nativeMode = true
    if (!this.nativeDanmaku.getDataBase()) {
      this.lastListSync = false
      this.lastSyncResult = { ok: false, reason: 'no_db', count: 0, screen: 0, list: false }
      return
    }
    this.nativeDanmaku.installResyncHook(() => this.getActiveSources())
    const sync = this.nativeDanmaku.fullSync(this.getActiveSources())
    this.lastListSync = !!sync.list
    this.lastSyncResult = sync
  }

  rebuildList() {
    this.rebuildListMeta()
    this.syncNative()
  }

  // --- 状态持久化 ---

  saveState() {
    try {
      const videoId = this.getCurrentVideoId()
      if (!videoId) {
        return
      }
      const key = `dm_merger_store_${videoId}`
      if (!this.sources?.size) {
        getStorage().delete(key)
        return
      }
      const sourcesMeta = this.getSources()
      getStorage().set(key, JSON.stringify(sourcesMeta))
      getStorage().trackKey(key)
      dmLog('saveState', { key, count: sourcesMeta.length })
    } catch (err) {
      dmWarn('saveState 失败', err)
    }
  }

  // 重置引擎（用于 SPA 导航切换视频）
  reset() {
    this.nativeDanmaku.purgeMerged()
    this.sources = new Map()
    this.danmakuList = []
    this.cursor = 0
    this.video = null
    this.container = null
    this.styleCache = null
    this.nativeMode = false
    this.lastListSync = false
    this.lastSyncResult = null
    this.activeViewCid = null
    // 角标 DOM 由 ui/vue-host 管理，此处不操作 #dm-merger-count
  }

  load(list) {
    this.danmakuList = list.sort((a, b) => a.time - b.time)
    this.handleSeek()
  }

  handleSeek() {
    if (!this.video) {
      return
    }
    const now = this.video.currentTime
    this.lastTime = now
    this.clearScreen()
    this.cursor = this.danmakuList.findIndex(d => d.time >= now)
    if (this.cursor === -1) {
      this.cursor = this.danmakuList.length
    }

    // 回溯查找当前应显示的弹幕
    const LOOKBACK = 12
    let scanIdx = this.cursor - 1
    while (scanIdx >= 0) {
      const dm = this.danmakuList[scanIdx]
      const diff = now - dm.time
      if (diff > LOOKBACK) {
        break
      }
      if (diff >= 0) {
        this.shoot(dm, diff * 1000)
      }
      scanIdx--
    }
  }

  clearScreen() {
    if (this.container) {
      this.container.innerHTML = ''
    }
    this.activeAnimations.clear()
  }

  pauseAll() {
    this.activeAnimations.forEach(anim => {
      if (anim.playState !== 'paused' && anim.playState !== 'finished') {
        anim.pause()
      }
    })
  }

  resumeAll() {
    this.activeAnimations.forEach(anim => {
      if (anim.playState === 'paused') {
        anim.play()
      }
    })
  }

  updateStyles() {
    // 默认样式
    this.styleCache = this.styleCache || {
      fontFamily: 'SimHei, "Microsoft JhengHei", Arial, sans-serif',
      fontWeight: 'bold',
      textShadow: '1px 0 1px #000, -1px 0 1px #000, 0 1px 1px #000, 0 -1px 1px #000',
      opacity: '1',
    }

    try {
      // 1. 同步不透明度
      const nativeLayer =
        document.querySelector('.bpx-player-dm-wrap') || document.querySelector('.bilibili-danmaku')
      if (nativeLayer) {
        const { opacity } = getComputedStyle(nativeLayer)
        if (this.container && this.container.style.opacity !== opacity) {
          this.container.style.opacity = opacity
        }
        this.styleCache.opacity = opacity
      }

      // 2. 同步字体与阴影
      const sampleDm = document.querySelector('.bpx-player-dm-itm')
      if (sampleDm) {
        const computed = getComputedStyle(sampleDm)
        this.styleCache.fontFamily = computed.fontFamily
        this.styleCache.fontWeight = computed.fontWeight
        if (computed.textShadow && computed.textShadow !== 'none') {
          this.styleCache.textShadow = computed.textShadow
        }
      } else {
        try {
          const profile = JSON.parse(localStorage.getItem('bpx_player_profile'))
          if (profile?.dmSetting) {
            if (profile.dmSetting.fontFamily) {
              this.styleCache.fontFamily = profile.dmSetting.fontFamily
            }
            if (profile.dmSetting.bold !== undefined) {
              this.styleCache.fontWeight = profile.dmSetting.bold ? 'bold' : 'normal'
            }
          }
        } catch (e) {
          /* 忽略本地配置解析失败 */
        }
      }
    } catch (e) {
      /* 忽略样式同步异常 */
    }
  }

  update() {
    if (!this.danmakuList.length || !this.video) {
      return
    }

    // 处理暂停状态同步
    if (this.video.paused) {
      if (this.isPlaying) {
        this.isPlaying = false
        this.pauseAll()
      }
      return
    }
    if (!this.isPlaying) {
      this.isPlaying = true
      this.resumeAll()
    }

    const now = this.video.currentTime

    // 检查大跨度跳转（例如点击进度条）
    if (Math.abs(now - this.lastTime) > 1.5) {
      this.handleSeek()
      return
    }
    this.lastTime = now

    // 发射当前时间点的弹幕
    while (this.cursor < this.danmakuList.length) {
      const dm = this.danmakuList[this.cursor]
      if (dm.time > now) {
        break
      }

      // 只要未超时且游标到达就发射（移除严格的 1s 限制以补齐丢帧）
      // 但要防止瞬间发射大量过时弹幕（通常在 seek 时已处理）
      if (now - dm.time < 3.0) {
        this.shoot(dm)
      }
      this.cursor++
    }
  }

  onTimeUpdate() {
    // 已迁移到 update() 由 rAF 驱动，此处仅做跳转保底
    const now = this.video?.currentTime
    if (now !== undefined && Math.abs(now - this.lastTime) > 1.5) {
      this.handleSeek()
    }
  }

  shoot(dm, startOffset = 0) {
    if (!this.container) {
      return
    }
    if (!this.styleCache) {
      this.updateStyles()
    }

    const el = document.createElement('div')
    el.innerText = dm.text

    const fontSize = dm.size || 25
    const color = `#${(dm.color || 16777215).toString(16).padStart(6, '0')}`

    el.style.cssText = `position:absolute;white-space:pre;font-size:${fontSize}px;color:${color};text-shadow:${
      this.styleCache.textShadow
    };font-family:${this.styleCache.fontFamily};font-weight:${
      this.styleCache.fontWeight
    };left:100%;will-change:transform;pointer-events:none;top:${this.getRowTop(
      fontSize,
    )}px;line-height:1.125;`

    // 互动时间跳转
    const timeMatch = dm.text.match(/(\d{1,2})[:\uff1a](\d{2})/)
    if (timeMatch) {
      el.classList.add('dm-interactive')
      el.style.pointerEvents = 'auto'
      el.title = `点击跳转至 ${timeMatch[1]}:${timeMatch[2]}`
      el.onclick = e => {
        e.preventDefault()
        e.stopPropagation()
        if (this.video) {
          this.video.currentTime = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2])
          this.video.play()
        }
      }
    }

    this.container.appendChild(el)

    // 计算动画参数
    const duration = 8000 + Math.random() * 2000
    const distance = this.container.clientWidth + el.clientWidth + 50

    const anim = el.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(-${distance}px)` }],
      { duration, easing: 'linear' },
    )

    if (startOffset > 0) {
      anim.currentTime = startOffset
    }
    this.activeAnimations.add(anim)
    if (this.video.paused) {
      anim.pause()
    }

    anim.onfinish = () => {
      el.remove()
      this.activeAnimations.delete(anim)
    }
  }

  getRowTop(height) {
    if (!this.container) {
      return 10
    }
    const h = this.container.clientHeight || 400 // 保底高度
    const rowHeight = height + 6
    const maxRows = Math.max(1, Math.floor(h / rowHeight) - 2)
    const row = Math.floor(Math.random() * maxRows)
    return row * rowHeight + 10
  }
}
