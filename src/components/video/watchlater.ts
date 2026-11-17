// 移除已观看: https://api.bilibili.com/x/v2/history/toview/del  viewed=true&csrf=csrf
// 清空: https://api.bilibili.com/x/v2/history/toview/clear  csrf=csrf

import Vue, { set } from 'vue'
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { deleteValue, getUID } from '@/core/utils'
import { logError } from '@/core/utils/log'

export interface Rights {
  bp: number
  elec: number
  download: number
  movie: number
  pay: number
  hd5: number
  no_reprint: number
  autoplay: number
  ugc_pay: number
  is_cooperation: number
  ugc_pay_preview: number
}

export interface Owner {
  mid: number
  name: string
  face: string
}

export interface Stat {
  aid: number
  view: number
  danmaku: number
  reply: number
  favorite: number
  coin: number
  share: number
  now_rank: number
  his_rank: number
  like: number
  dislike: number
}

export interface Dimension {
  width: number
  height: number
  rotate: number
}
export interface Page {
  cid: number
  page: number
  from: string
  part: string
  duration: number
  vid: string
  weblink: string
  dimension: Dimension
}

export interface RawWatchlaterItem {
  aid: number
  videos: number
  tid: number
  tname: string
  copyright: number
  pic: string
  title: string
  pubdate: number
  ctime: number
  desc: string
  state: number
  attribute: number
  duration: number
  rights: Rights
  owner: Owner
  stat: Stat
  dynamic: string
  dimension: Dimension
  pages: Page[]
  cid: number
  progress: number
  add_at: number
  bvid: string
}
/** 已知已加入稍后再看的 aid；未经查询的 aid 不代表未加入。 */
export const watchlaterList: number[] = []
/** 未查询或查询失败时为 undefined。 */
export const watchlaterStatuses = Vue.observable<Record<number, boolean | undefined>>({})

const setWatchlaterStatus = (aid: number, added: boolean) => {
  set(watchlaterStatuses, aid, added)
  if (added) {
    if (!watchlaterList.includes(aid)) {
      watchlaterList.push(aid)
    }
  } else {
    deleteValue(watchlaterList, it => it === aid)
  }
}

export const watchlaterPageSize = 20

/** 分页查询不会将未出现在这一页的视频标记为未加入。 */
export const getWatchlaterPage = async ({ page = 1, keyword = '' } = {}) => {
  const params = new URLSearchParams({
    pn: String(page),
    ps: String(watchlaterPageSize),
    asc: '0',
    need_split: '0',
    key: keyword,
  })
  const data = await bilibiliApi<{ count: number; list: RawWatchlaterItem[] | null }>(
    getJsonWithCredentials(`https://api.bilibili.com/x/v2/history/toview/web?${params}`),
    '获取稍后再看列表失败',
  )
  return { count: data.count, list: (data.list ?? []).filter(item => item.aid > 0) }
}

/** 按标题缩小查询范围，再用 aid 匹配；不遍历完整稍后再看列表。 */
export const getWatchlaterItem = async (aid: string | number, title?: string) => {
  const id = String(aid)
  let videoAid = Number(id)
  if (!title || id.startsWith('BV')) {
    const { VideoInfo } = await import('./video-info')
    const info = await new VideoInfo(id, id.startsWith('BV')).fetchInfo()
    videoAid = Number(info.aid)
    title = info.title
  }
  const keyword = title.trim()
  if (!keyword) {
    throw new Error('无法获取视频标题，未查询稍后再看状态')
  }
  for (let page = 1; ; page++) {
    const { count, list } = await getWatchlaterPage({ page, keyword })
    const item = list.find(it => it.aid === videoAid)
    if (item) {
      return item
    }
    if (list.length === 0 || page * watchlaterPageSize >= count) {
      return undefined
    }
  }
}

const statusRequests = new Map<number, Promise<boolean>>()

/** 查询结果在当前页面共享，失败不缓存。 */
export const getWatchlaterStatus = (aid: string | number, title?: string): Promise<boolean> => {
  const id = Number(aid)
  if (!getUID() || !Number.isSafeInteger(id) || id <= 0) {
    return Promise.reject(new Error('无法查询稍后再看状态：未登录或视频 aid 无效'))
  }
  const knownStatus = watchlaterStatuses[id]
  if (knownStatus !== undefined) {
    return Promise.resolve(knownStatus)
  }
  if (!statusRequests.has(id)) {
    const request = getWatchlaterItem(id, title)
      .then(item => {
        // 查询期间的添加/删除操作结果优先于旧查询结果。
        if (watchlaterStatuses[id] === undefined) {
          setWatchlaterStatus(id, item !== undefined)
        }
        return watchlaterStatuses[id]
      })
      .finally(() => statusRequests.delete(id))
    statusRequests.set(id, request)
  }
  return statusRequests.get(id)
}
/**
 * 显式获取完整稍后再看列表。展示列表请用 getWatchlaterPage，判断状态请用 getWatchlaterStatus。
 * @param raw 是否获取未转换过的数据列表
 */
export async function getWatchlaterList(): Promise<number[]>
export async function getWatchlaterList(raw: true): Promise<RawWatchlaterItem[]>
export async function getWatchlaterList(raw: false): Promise<number[]>
export async function getWatchlaterList(raw = false): Promise<number[] | RawWatchlaterItem[]> {
  if (!getUID()) {
    console.warn('[稍后再看列表] 账号未登录')
    return []
  }
  const api = 'https://api.bilibili.com/x/v2/history/toview/web'
  const response = await getJsonWithCredentials(api)
  if (response.code !== 0) {
    logError(new Error(`获取稍后再看列表失败: ${response.message}`))
    return []
  }
  const rawList: RawWatchlaterItem[] = response.data.list ?? []
  const ids = new Set(rawList.map(item => item.aid))
  Object.keys(watchlaterStatuses).forEach(id => set(watchlaterStatuses, id, ids.has(Number(id))))
  rawList.forEach(item => set(watchlaterStatuses, item.aid, true))
  watchlaterList.splice(0, watchlaterList.length, ...ids)
  if (raw) {
    return rawList
  }
  return rawList.map(item => item.aid)
}

/**
 * 切换稍后再看
 * @param aid av号
 * @param add 添加/删除
 */
export const toggleWatchlater = async (aid: string | number, add?: boolean | undefined) => {
  const id = parseInt(aid.toString())
  if (Number.isNaN(id)) {
    return false
  }
  try {
    if (add === undefined) {
      add = !(await getWatchlaterStatus(id))
    }
    const api = add
      ? 'https://api.bilibili.com/x/v2/history/toview/add'
      : 'https://api.bilibili.com/x/v2/history/toview/del'
    const { getCsrf } = await import('@/core/utils')
    const csrf = getCsrf()
    const { postTextWithCredentials } = await import('@/core/ajax')
    const responseText = await postTextWithCredentials(api, `aid=${aid}&csrf=${csrf}`)
    const response = JSON.parse(responseText) as {
      code: number
      message: string
    }
    if (response.code !== 0) {
      throw new Error(`稍后再看操作失败: ${response.message}`)
    }
    setWatchlaterStatus(id, add)
    return true
  } catch (error) {
    logError(error)
    return false
  }
}
