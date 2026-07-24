import { bilibiliApi, getJsonWithCredentials, monkey } from '@/core/ajax'
import type { PageItem, SearchResult, ViewResult } from './types'

const SEARCH_URL = 'https://api.bilibili.com/x/web-interface/search/type'
const VIEW_URL = 'https://api.bilibili.com/x/web-interface/view'
const PAGE_LIST_URL = 'https://api.bilibili.com/x/player/pagelist'
const DANMAKU_XML_URL = 'https://comment.bilibili.com'

/** 是否检测到 pakku.js 注入（会劫持页面 XHR/fetch 的弹幕请求） */
export const isPakkuActive = (): boolean => {
  try {
    if (document.querySelector('.__pakku_injected')) {
      return true
    }
    // pakku 在 content script 里给 XHR 打上 pakku_open
    if ((XMLHttpRequest.prototype as { pakku_open?: unknown }).pakku_open) {
      return true
    }
  } catch {
    // 环境受限时忽略
  }
  return false
}

/** 解析 view 查询参数：支持 BV 与 av 号（与 runtime 直输 BV/av 一致） */
const buildViewUrl = (id: string): string => {
  const trimmed = id.trim()
  const avMatch = /^av(\d+)$/i.exec(trimmed)
  if (avMatch) {
    return `${VIEW_URL}?aid=${avMatch[1]}`
  }
  return `${VIEW_URL}?bvid=${encodeURIComponent(trimmed)}`
}

/**
 * 视频关键词搜索
 * 返回格式：`[{ result_type: 'video', data: [...] }]`
 */
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

/** 获取视频详情（view 接口） */
export const getView = async (bvid: string): Promise<ViewResult> => {
  return bilibiliApi<ViewResult>(getJsonWithCredentials(buildViewUrl(bvid)), '获取视频信息失败')
}

/** 获取分 P 列表（pagelist 接口） */
export const getPageList = async (bvid: string): Promise<PageItem[]> => {
  const url = `${PAGE_LIST_URL}?bvid=${encodeURIComponent(bvid)}`
  return bilibiliApi<PageItem[]>(getJsonWithCredentials(url), '获取分P列表失败')
}

/** 获取弹幕 XML（comment.bilibili.com，与 runtime getDanmaku 一致） */
export const getDanmakuXml = async (cid: number | string): Promise<string> => {
  // 必须走 GM_xmlhttpRequest：pakku.js 会劫持页面 XHR/fetch 的 .xml 弹幕请求，
  // 对「非当前播放 cid」的 comment.bilibili.com/{cid}.xml 可能一直不返回，导致合并/恢复卡死。
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
