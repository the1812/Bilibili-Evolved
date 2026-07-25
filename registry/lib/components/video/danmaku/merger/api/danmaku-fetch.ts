import { monkey } from '@/core/ajax'
import {
  decodeDanmakuSegment,
  decodeDanmakuView,
} from '../../converter/danmaku-segment'
import type { ParsedDanmakuItem } from '../danmaku/parse'
import { parseDanmakuXml } from '../danmaku/parse'
import { dmLog, dmWarn } from '../danmaku/log'

const DANMAKU_XML_URL = 'https://comment.bilibili.com'
const DM_VIEW_URL = 'https://api.bilibili.com/x/v2/dm/web/view'
const DM_SEG_URL = 'https://api.bilibili.com/x/v2/dm/web/seg.so'

/** 单段 seg.so 拉取上限（约 6 分钟/段，50 段约 5 小时） */
const MAX_SEGMENTS = 50

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
  pool?: number
}

/** 将 protobuf 弹幕元素转为合并器统一结构 */
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

/** GM 拉取二进制弹幕，避开 pakku 对页面 fetch/XHR 的劫持 */
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

/** 读取分段总数；失败时返回 null，由调用方按空段探测 */
const resolveSegmentTotal = async (
  cid: number | string,
  aid?: number | string,
): Promise<number | null> => {
  try {
    const pid = aid != null && String(aid) !== '' ? `&pid=${aid}` : ''
    const blob = await monkeyBlob(`${DM_VIEW_URL}?type=1&oid=${cid}${pid}`)
    const view = (await decodeDanmakuView(blob)) as {
      dmSge?: { total?: number | string }
    }
    const total = Number(view?.dmSge?.total)
    if (Number.isFinite(total) && total > 0) {
      return Math.min(Math.floor(total), MAX_SEGMENTS)
    }
  } catch (err) {
    dmLog('弹幕 view 分段数读取失败，改用空段探测', { cid, err })
  }
  return null
}

/** 通过 protobuf seg.so 拉取全部分段弹幕 */
const fetchDanmakuByProtobuf = async (
  cid: number | string,
  aid?: number | string,
): Promise<ParsedDanmakuItem[]> => {
  const pid = aid != null && String(aid) !== '' ? `&pid=${aid}` : ''
  const total = await resolveSegmentTotal(cid, aid)
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

  // 无 total：连续拉段，直到连续空段或达上限
  let emptyStreak = 0
  for (let index = 0; index < MAX_SEGMENTS; index += 1) {
    const blob = await monkeyBlob(
      `${DM_SEG_URL}?type=1&oid=${cid}${pid}&segment_index=${index + 1}`,
    )
    const seg = (await decodeDanmakuSegment(blob)) as { elems?: SegElem[] }
    const mapped = mapSegElems(seg.elems || [])
    if (!mapped.length) {
      emptyStreak += 1
      // 首段就空：可能该源确实无弹幕；后续连续两空则停止
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

/** 兼容旧 XML 接口（部分稿件仍可能有数据） */
const fetchDanmakuByXml = async (cid: number | string): Promise<ParsedDanmakuItem[]> => {
  const responseText = await monkey<string>({
    url: `${DANMAKU_XML_URL}/${cid}.xml`,
    method: 'GET',
    responseType: 'text',
    anonymous: false,
  })
  if (responseText == null || responseText === '') {
    return []
  }
  return parseDanmakuXml(responseText)
}

/**
 * 拉取指定 cid 的弹幕列表。
 * 优先 protobuf seg.so（comment XML 对许多稿件已返回空壳）；
 * protobuf 全空时再回落 XML。
 */
export const fetchDanmakuItems = async (
  cid: number | string,
  aid?: number | string,
): Promise<ParsedDanmakuItem[]> => {
  try {
    const list = await fetchDanmakuByProtobuf(cid, aid)
    if (list.length > 0) {
      return list
    }
    dmLog('protobuf 弹幕为空，尝试 XML', { cid, aid })
  } catch (err) {
    dmWarn('protobuf 弹幕拉取失败，回落 XML', { cid, aid, err })
  }

  const xmlList = await fetchDanmakuByXml(cid)
  if (!xmlList.length) {
    throw new Error(`弹幕为空（cid=${cid}）`)
  }
  return xmlList
}

/**
 * 兼容旧签名：返回 XML 字符串。
 * 新代码应优先使用 fetchDanmakuItems。
 */
export const getDanmakuXml = async (cid: number | string): Promise<string> => {
  const items = await fetchDanmakuItems(cid)
  // 仅作兼容：拼成最小 XML，供仍走 parseDanmakuXml 的路径使用
  const body = items
    .map(dm => {
      const p = [
        dm.time,
        dm.type,
        dm.size,
        dm.color,
        dm.date,
        0,
        dm.uid || '0',
        dm.dmid || '0',
      ].join(',')
      const text = String(dm.text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `<d p="${p}">${text}</d>`
    })
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?><i>${body}</i>`
}
