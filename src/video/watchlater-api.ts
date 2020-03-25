// 移除已观看: https://api.bilibili.com/x/v2/history/toview/del  viewed=true&csrf=csrf
// 清空: https://api.bilibili.com/x/v2/history/toview/clear  csrf=csrf
export const toggleWatchlater = async (aid: string | number, add: boolean) => {
  const api = add ? 'https://api.bilibili.com/x/v2/history/toview/add' : 'https://api.bilibili.com/x/v2/history/toview/del'
  const csrf = getCsrf()
  const responseText = await Ajax.postTextWithCredentials(api, `aid=${aid}&csrf=${csrf}`)
  const response = JSON.parse(responseText) as {
    code: number
    message: string
  }
  if (response.code !== 0) {
    throw new Error(`稍后再看操作失败: ${response.message}`)
  }
}
export interface Rights {
  bp: number;
  elec: number;
  download: number;
  movie: number;
  pay: number;
  hd5: number;
  no_reprint: number;
  autoplay: number;
  ugc_pay: number;
  is_cooperation: number;
  ugc_pay_preview: number;
}

export interface Owner {
  mid: number;
  name: string;
  face: string;
}

export interface Stat {
  aid: number;
  view: number;
  danmaku: number;
  reply: number;
  favorite: number;
  coin: number;
  share: number;
  now_rank: number;
  his_rank: number;
  like: number;
  dislike: number;
}

export interface Dimension {
  width: number;
  height: number;
  rotate: number;
}
export interface Page {
  cid: number;
  page: number;
  from: string;
  part: string;
  duration: number;
  vid: string;
  weblink: string;
  dimension: Dimension;
}

export interface RawWatchlaterItem {
  aid: number;
  videos: number;
  tid: number;
  tname: string;
  copyright: number;
  pic: string;
  title: string;
  pubdate: number;
  ctime: number;
  desc: string;
  state: number;
  attribute: number;
  duration: number;
  rights: Rights;
  owner: Owner;
  stat: Stat;
  dynamic: string;
  dimension: Dimension;
  pages: Page[];
  cid: number;
  progress: number;
  add_at: number;
  bvid: string
}
export async function getWatchlaterList(): Promise<number[]>
export async function getWatchlaterList(raw: true): Promise<RawWatchlaterItem[]>
export async function getWatchlaterList(raw: false): Promise<number[]>
export async function getWatchlaterList(raw = false): Promise<number[] | RawWatchlaterItem[]> {
  const api = `https://api.bilibili.com/x/v2/history/toview/web`
  const response = await Ajax.getJsonWithCredentials(api)
  if (response.code !== 0) {
    throw new Error(`获取稍后再看列表失败: ${response.message}`)
  }
  if (!response.data.list) {
    return []
  }
  if (raw) {
    return response.data.list
  }
  return response.data.list.map((item: any) => item.aid)
}
export default {
  export: {
    toggleWatchlater,
    getWatchlaterList,
  },
}
