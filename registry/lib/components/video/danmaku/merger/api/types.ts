/** B 站通用 JSON 响应壳 */
export interface BilibiliApiResponse<T = unknown> {
  code: number
  message?: string
  data: T
}

/** 视频搜索单条结果（与 runtime renderList 字段对齐） */
export interface SearchVideoItem {
  bvid: string
  title: string
  pic: string
  duration?: number | string
  author: string
  play?: number
  video_review?: number
}

/** 搜索接口分组（兼容原 API.search 返回格式） */
export interface SearchResultGroup {
  result_type: string
  data: SearchVideoItem[]
}

export type SearchResult = SearchResultGroup[]

/** view 接口分 P 条目 */
export interface ViewPageItem {
  cid: number
  part: string
  page: number
  duration?: number
}

/** view 接口视频详情 */
export interface ViewResult {
  bvid: string
  title: string
  pic: string
  owner?: { name: string }
  pages?: ViewPageItem[]
}

/** pagelist 接口分 P 元数据 */
export interface PageItem {
  cid: number
  duration?: number
  page?: number
  part?: string
}
