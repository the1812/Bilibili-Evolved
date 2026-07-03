import { getStorage } from '../storage'

export interface PartModeState {
  total?: string
  uniform?: string
}

/** 从 BV 号或复合 id 中提取标准 bvid */
export function extractBvid(raw: string): string {
  const s = String(raw || '').trim()
  if (!s) {
    return ''
  }
  if (/^BV[a-zA-Z0-9]{10}$/.test(s)) {
    return s
  }
  const fromId = s.match(/^(BV[a-zA-Z0-9]{10})_/)
  if (fromId) {
    return fromId[1]
  }
  const embedded = s.match(/BV[a-zA-Z0-9]{10}/)
  return embedded ? embedded[0] : ''
}

export function resolveSourceBvid(source: { bvid?: string; id?: string }): string {
  return extractBvid(source?.bvid || source?.id || '')
}

/** 读取当前播放分 P 的 cid */
export function getCurrentPageCid(): string | null {
  try {
    const { cid } = unsafeWindow as { cid?: unknown }
    if (cid == null || Array.isArray(cid)) {
      return null
    }
    const text = String(cid).trim()
    return text || null
  } catch {
    return null
  }
}

/** 判断合并源是否属于指定分 P 的观看上下文 */
export function sourceMatchesViewCid(
  meta: { viewCid?: number | string; cid?: number | string },
  viewCid: string,
): boolean {
  if (meta.viewCid != null && String(meta.viewCid) !== '') {
    return String(meta.viewCid) === String(viewCid)
  }
  // 旧数据无 viewCid：仅当源 cid 与当前分 P 一致时展示
  if (meta.cid != null && String(meta.cid) !== '') {
    return String(meta.cid) === String(viewCid)
  }
  return false
}

/** 按观看分 P 过滤内存中的合并源 */
export function filterSourcesMapByViewCid<
  T extends { meta: { viewCid?: number | string; cid?: number | string } },
>(sources: Map<string, T> | undefined, viewCid: string | null): Map<string, T> | undefined {
  if (!sources?.size || !viewCid) {
    return sources
  }
  const filtered = new Map<string, T>()
  sources.forEach((source, key) => {
    if (sourceMatchesViewCid(source.meta, viewCid)) {
      filtered.set(key, source)
    }
  })
  return filtered
}

export function parseDurationText(text: string | null | undefined): number | null {
  if (text == null) {
    return null
  }
  const s = String(text).trim()
  if (!s) {
    return null
  }
  if (/^\d+(\.\d+)?$/.test(s)) {
    return parseFloat(s)
  }
  const parts = s.split(':').map(v => parseFloat(v))
  if (parts.some(n => Number.isNaN(n))) {
    return null
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return null
}

export function formatDurationShort(seconds: number): string {
  const sec = Math.max(0, Math.round(seconds * 10) / 10)
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.round(sec % 60)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

function getPartModeStorageKey(bvid: string): string {
  return `dm_part_mode_${extractBvid(bvid) || bvid}`
}

export function loadPartModeState(bvid: string): PartModeState | null {
  try {
    const raw = getStorage().get<string>(getPartModeStorageKey(bvid))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export interface PlayerReadiness {
  hasBpx: boolean
  hasVideo: boolean
  hasPlayer: boolean
}

/** 播放器未就绪时的用户提示文案 */
export function formatPlayerNotReadyHint(
  ready: PlayerReadiness,
  context: 'merge' | 'resync' = 'merge',
): string {
  if (!ready.hasBpx && !ready.hasVideo) {
    return context === 'merge' ? '请在视频播放页合并弹幕' : '请在视频播放页操作'
  }
  if (!ready.hasPlayer) {
    return context === 'merge' ? '播放器未挂载，请刷新页面后重试' : '请刷新页面'
  }
  return context === 'merge' ? '请点击播放 2～5 秒后再合并' : '请先点击播放 2～5 秒'
}

export function savePartModeState(bvid: string, state: PartModeState): void {
  if (!bvid) {
    return
  }
  try {
    const key = getPartModeStorageKey(bvid)
    getStorage().set(key, JSON.stringify(state))
    getStorage().trackKey(key)
  } catch {
    // 存储失败时静默跳过
  }
}
