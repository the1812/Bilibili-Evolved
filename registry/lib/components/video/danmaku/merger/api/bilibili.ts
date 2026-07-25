import { bilibiliApi, getJsonWithCredentials, monkey } from '@/core/ajax'
import {
  decodeDanmakuSegment,
  decodeDanmakuView,
} from '../../converter/danmaku-segment'
import type { ParsedDanmakuItem } from '../danmaku/parse'
import { parseDanmakuXml } from '../danmaku/parse'
import { dmLog, dmWarn } from '../danmaku/log'
import type { PageItem, SearchResult, ViewResult } from './types'

const SEARCH_URL = 'https://api.bilibili.com/x/web-interface/search/type'
const VIEW_URL = 'https://api.bilibili.com/x/web-interface/view'
const PAGE_LIST_URL = 'https://api.bilibili.com/x/player/pagelist'
const DANMAKU_XML_URL = 'https://comment.bilibili.com'
const DM_VIEW_URL = 'https://api.bilibili.com/x/v2/dm/web/view'
const DM_SEG_URL = 'https://api.bilibili.com/x/v2/dm/web/seg.so'
const MAX_SEGMENTS = 50

/** 是否检测到 pakku.js 注入（会劫持页面 XHR/fetch 的弹幕请求） */
export const isPakkuActive = (): boolean => {
  try {
    if (document.querySelector('.__pakku_injected')) {
      return true
    }
    if ((XMLHttpRequest.prototype as { pakku_open?: unknown }).pakku_open) {
      return true
    }
  } catch {
    // ignore
  }
  return false
}

const buildViewUrl = (id: string): string => {
  const trimmed = id.trim()
  const avMatch = /^av(\d+)$/i.exec(trimmed)
  if (avMatch) {
    return `${VIEW_URL}?aid=${avMatch[1]}`
  }
  return `${VIEW_URL}?bvid=${encodeURIComponent(trimmed)}`
}

export const searchVideos = async (keyword: string, page = 1): Promise<SearchResult> => {
  const url =
    `${SEARCH_URL}?search_type=video` +
    `&keyword=${encodeURIComponent(keyword)}` +
    `&page=${page}&page_size=30`

  const data = await bilibiliApi<{ result?: SearchResult[0]['data'] }>(
    getJsonWithCredentials(url),
    '搜索失败',
  )

  return [{ result_type: 'video', data: data.result ?? [] }]
}

export const getView = async (bvid: string): Promise<ViewResult> => {
  return bilibiliApi<ViewResult>(getJsonWithCredentials(buildViewUrl(bvid)), '获取视频信息失败')
}

export const getPageList = async (bvid: string): Promise<PageItem[]> => {
  const url = `${PAGE_LIST_URL}?bvid=${encodeURIComponent(bvid)}`
  return bilibiliApi<PageItem[]>(getJsonWithCredentials(url), '获取分P列表失败')
}

/** 视频是否仍可访问（未删除 / 未失效） */
export type VideoAvailability =
  | { ok: true; view: ViewResult }
  | { ok: false; reason: 'not_found' | 'error'; message: string }

export const checkVideoAvailable = async (id: string): Promise<VideoAvailability> => {
  try {
    const view = await getView(id)
    if (!view?.bvid && !view?.pages?.length) {
      return { ok: false, reason: 'not_found', message: '视频不存在或已删除' }
    }
    return { ok: true, view }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // B 站常见：稿件不存在 code=-404 / 62002 等
    if (/code\s*=\s*-?404\b|62002|不存在|已删除|不可见|稿件/i.test(message)) {
      return { ok: false, reason: 'not_found', message: '视频不存在或已删除' }
    }
    return { ok: false, reason: 'error', message: message || '视频状态检测失败' }
  }
}

/** XML 拉取（视频仍在时的主路径） */
export const getDanmakuXml = async (cid: number | string): Promise<string> => {
  const responseText = await monkey<string>({
    url: `${DANMAKU_XML_URL}/${cid}.xml`,
    method: 'GET',
    responseType: 'text',
    anonymous: false,
  })
  if (responseText == null || responseText === '') {
    throw new Error('弹幕接口返回为空')
  }
  return responseText
}

type SegElem = {
  id?: number | string
  idStr?: string
  progress?: number
  mode?: number
  fontsize?: number
  color?: number
  midHash?: string
  content?: string
  ctime?: number
}

const mapSegElems = (elems: SegElem[]): ParsedDanmakuItem[] =>
  elems
    .map(el => {
      const text = String(el.content ?? '').trim()
      if (!text) {
        return null
      }
      return {
        time: (Number(el.progress) || 0) / 1000,
        type: Number(el.mode) || 1,
        color: Number(el.color) || 16777215,
        text,
        size: Number(el.fontsize) || 25,
        date: Number(el.ctime) || 0,
        uid: String(el.midHash || ''),
        dmid: String(el.idStr || el.id || ''),
      } satisfies ParsedDanmakuItem
    })
    .filter((item): item is ParsedDanmakuItem => item != null)

const monkeyBlob = async (url: string): Promise<Blob> => {
  const response = await monkey<Blob | ArrayBuffer | string>({
    url,
    method: 'GET',
    responseType: 'blob',
    anonymous: false,
  })
  if (response instanceof Blob) {
    return response
  }
  if (response instanceof ArrayBuffer) {
    return new Blob([response])
  }
  if (typeof response === 'string') {
    return new Blob([response])
  }
  throw new Error('弹幕接口返回为空')
}

/** protobuf 兜底：视频删除/失效或 XML 空壳时使用 */
const fetchDanmakuByProtobuf = async (
  cid: number | string,
  aid?: number | string,
): Promise<ParsedDanmakuItem[]> => {
  const pid = aid != null && String(aid) !== '' ? `&pid=${aid}` : ''
  let total: number | null = null
  try {
    const blob = await monkeyBlob(`${DM_VIEW_URL}?type=1&oid=${cid}${pid}`)
    const view = (await decodeDanmakuView(blob)) as { dmSge?: { total?: number | string } }
    const n = Number(view?.dmSge?.total)
    if (Number.isFinite(n) && n > 0) {
      total = Math.min(Math.floor(n), MAX_SEGMENTS)
    }
  } catch (err) {
    dmLog('弹幕 view 分段数读取失败，改用空段探测', { cid, err })
  }

  const items: ParsedDanmakuItem[] = []
  if (total != null) {
    for (let index = 0; index < total; index += 1) {
      const blob = await monkeyBlob(
        `${DM_SEG_URL}?type=1&oid=${cid}${pid}&segment_index=${index + 1}`,
      )
      const seg = (await decodeDanmakuSegment(blob)) as { elems?: SegElem[] }
      items.push(...mapSegElems(seg.elems || []))
    }
    return items
  }

  let emptyStreak = 0
  for (let index = 0; index < MAX_SEGMENTS; index += 1) {
    const blob = await monkeyBlob(
      `${DM_SEG_URL}?type=1&oid=${cid}${pid}&segment_index=${index + 1}`,
    )
    const seg = (await decodeDanmakuSegment(blob)) as { elems?: SegElem[] }
    const mapped = mapSegElems(seg.elems || [])
    if (!mapped.length) {
      emptyStreak += 1
      if (index === 0 || emptyStreak >= 2) {
        break
      }
      continue
    }
    emptyStreak = 0
    items.push(...mapped)
  }
  return items
}

export type DanmakuFetchMode = 'xml' | 'protobuf-fallback'

export interface DanmakuFetchResult {
  list: ParsedDanmakuItem[]
  mode: DanmakuFetchMode
  /** 人类可读原因，供 toast / 管理面板 */
  notice?: string
}

export interface FetchDanmakuOptions {
  /** 源稿件 BV/av，用于检测视频是否仍在 */
  videoId?: string
  /** 源 avid，protobuf 分段请求可选 */
  aid?: number | string
  /**
   * 已知视频不可用时跳过 view 检测，直接 protobuf。
   * 恢复会话里 view 已失败时可传 true。
   */
  forceFallback?: boolean
  /** 自定义不可用原因文案 */
  unavailableReason?: string
}

/**
 * 合并前拉取弹幕：
 * - 视频仍在：走 XML（快）
 * - 视频已删/失效，或 XML 空壳：protobuf 兜底
 */
export const fetchDanmakuForMerge = async (
  cid: number | string,
  options: FetchDanmakuOptions = {},
): Promise<DanmakuFetchResult> => {
  const { videoId, aid, forceFallback, unavailableReason } = options

  let videoGone = !!forceFallback
  let goneMessage = unavailableReason || '视频不存在或已删除'

  if (!videoGone && videoId) {
    const availability = await checkVideoAvailable(videoId)
    if (!availability.ok) {
      videoGone = true
      goneMessage = availability.message
    } else if (aid == null && (availability.view as { aid?: number }).aid != null) {
      // 可从 view 补 aid，提升 protobuf 成功率
      options.aid = (availability.view as { aid?: number }).aid
    }
  }

  if (!videoGone) {
    try {
      const xml = await getDanmakuXml(cid)
      const list = parseDanmakuXml(xml).filter(dm => String(dm.text || '').trim())
      if (list.length > 0) {
        return { list, mode: 'xml' }
      }
      dmLog('XML 弹幕为空，尝试 protobuf 兜底', { cid, videoId })
    } catch (err) {
      dmWarn('XML 弹幕拉取失败，尝试 protobuf 兜底', { cid, videoId, err })
    }
  }

  const list = await fetchDanmakuByProtobuf(cid, options.aid ?? aid)
  if (!list.length) {
    throw new Error(videoGone ? `${goneMessage}，且无法拉取历史弹幕` : '弹幕为空')
  }

  return {
    list,
    mode: 'protobuf-fallback',
    notice: videoGone
      ? `${goneMessage}，已用历史弹幕接口兜底（${list.length} 条）`
      : `XML 无数据，已用历史弹幕接口兜底（${list.length} 条）`,
  }
}
