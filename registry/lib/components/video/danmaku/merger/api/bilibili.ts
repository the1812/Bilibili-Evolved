import { getJson, getText } from '@/core/ajax'
import type {
  BilibiliApiResponse,
  PageItem,
  SearchResult,
  ViewResult,
} from './types'

const SEARCH_URL =
  'https://api.bilibili.com/x/web-interface/search/type'
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
 * 视频关键词搜索（URL 与 merger-runtime API.search 一致）
 * 返回格式兼容原 `[{ result_type: 'video', data: [...] }]`
 */
export const searchVideos = async (
  keyword: string,
  page = 1,
): Promise<SearchResult> => {
  const url =
    `${SEARCH_URL}?search_type=video` +
    `&keyword=${encodeURIComponent(keyword)}` +
    `&page=${page}&page_size=30`

  const data = await getJson<BilibiliApiResponse<{ result?: SearchResult[0]['data'] }>>(url)

  if (data.code === 0) {
    return [{ result_type: 'video', data: data.data?.result ?? [] }]
  }
  throw new Error(data.message || '搜索失败')
}

/** 获取视频详情（view 接口） */
export const getView = async (bvid: string): Promise<ViewResult> => {
  const data = await getJson<BilibiliApiResponse<ViewResult>>(buildViewUrl(bvid))

  if (data.code === 0) {
    return data.data
  }
  throw new Error(data.message || '获取视频信息失败')
}

/** 获取分 P 列表（pagelist 接口） */
export const getPageList = async (bvid: string): Promise<PageItem[]> => {
  const url = `${PAGE_LIST_URL}?bvid=${encodeURIComponent(bvid)}`
  const data = await getJson<BilibiliApiResponse<PageItem[]>>(url)

  if (data.code === 0) {
    return data.data ?? []
  }
  throw new Error(data.message || '获取分P列表失败')
}

/** 获取弹幕 XML（comment.bilibili.com，与 runtime getDanmaku 一致） */
export const getDanmakuXml = async (cid: number | string): Promise<string> => {
  return getText(`${DANMAKU_XML_URL}/${cid}.xml`)
}