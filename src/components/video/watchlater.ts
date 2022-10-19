// 移除已观看: https://api.bilibili.com/x/v2/history/toview/del  viewed=true&csrf=csrf
// 清空: https://api.bilibili.com/x/v2/history/toview/clear  csrf=csrf

import { deleteValue, deleteValues } from '@/core/utils'
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
/** 稍后再看列表 */
export const watchlaterList: number[] = []
/**
 * 获取稍后再看列表
 * @param raw 是否获取未转换过的数据列表
 */
export async function getWatchlaterList(): Promise<number[]>
export async function getWatchlaterList(raw: true): Promise<RawWatchlaterItem[]>
export async function getWatchlaterList(raw: false): Promise<number[]>
export async function getWatchlaterList(raw = false): Promise<number[] | RawWatchlaterItem[]> {
  const { getUID } = await import('@/core/utils')
  if (!getUID()) {
    console.warn('[稍后再看列表] 账号未登录')
    return []
  }
  const api = 'https://api.bilibili.com/x/v2/history/toview/web'
  const { getJsonWithCredentials } = await import('@/core/ajax')
  const response = await getJsonWithCredentials(api)
  if (response.code !== 0) {
    logError(new Error(`获取稍后再看列表失败: ${response.message}`))
    return []
  }
  if (!response.data.list) {
    // clear list
    deleteValues(watchlaterList, () => true)
    return []
  }
  const rawList: RawWatchlaterItem[] = response.data.list
  // update list
  deleteValues(watchlaterList, it => !rawList.find(w => w.aid === it))
  const newItems = rawList.filter(it => !watchlaterList.find(w => w === it.aid))
  watchlaterList.push(...newItems.map(it => it.aid))
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
    return
  }
  if (add === undefined) {
    add = !watchlaterList.includes(id)
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
    logError(new Error(`稍后再看操作失败: ${response.message}`))
    return
  }
  if (add) {
    watchlaterList.push(id)
  } else {
    deleteValue(watchlaterList, it => it === id)
  }
}

requestIdleCallback(async () => {
  const { getUID } = await import('@/core/utils')
  if (getUID()) {
    getWatchlaterList()
  }
})
