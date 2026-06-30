import { bilibiliApi, getJsonWithCredentials, getText } from '@/core/ajax'
import type { PageItem, SearchResult, ViewResult } from './types'

const SEARCH_URL = 'https://api.bilibili.com/x/web-interface/search/type'
const VIEW_URL = 'https://api.bilibili.com/x/web-interface/view'
const PAGE_LIST_URL = 'https://api.bilibili.com/x/player/pagelist'
const DANMAKU_XML_URL = 'https://comment.bilibili.com'

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
  const responseText = await getText(`${DANMAKU_XML_URL}/${cid}.xml`)

  if (responseText == null) {
    throw new Error('弹幕接口返回为空')
  }

  return responseText
}
