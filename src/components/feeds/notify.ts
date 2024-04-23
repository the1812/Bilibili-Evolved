import { getCookieValue, getUID } from '@/core/utils'
import { getJsonWithCredentials } from '@/core/ajax'

export const updateInterval = 5 * 60 * 1000 // 每5分钟更新1次动态提醒数字
export const getLatestID = () => getCookieValue(`bp_t_offset_${getUID()}`)
export const compareID = (a: string, b: string) => {
  if (a === b) {
    return 0
  }
  if (a.length > b.length) {
    return 1
  }
  if (b.length > a.length) {
    return -1
  }
  return a > b === true ? 1 : -1
}
export const setLatestID = (id: string) => {
  if (id === null || id === undefined) {
    return
  }
  const currentID = getLatestID()
  if (compareID(id, currentID) < 0) {
    return
  }
  document.cookie = `bp_t_offset_${getUID()}=${id};path=/;domain=.bilibili.com;max-age=${
    60 * 60 * 24 * 30
  }`
}
export const isNewID = (id: string) => compareID(id, getLatestID()) > 0
export const updateLatestID = (cards: { id: string }[]) => {
  const [id] = [...cards.map(c => c.id)].sort(compareID).reverse()
  setLatestID(id)
}
/** 按类型获取动态提醒数 */
export const getNotifyCountByType = async (type: string): Promise<number> => {
  const api = `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all/update?type=${type}&update_baseline=${getLatestID()}`
  const json = await getJsonWithCredentials(api)
  if (json.code !== 0) {
    return 0
  }
  return lodash.get(json, 'data.update_num', 0)
}
/** 获取所有类型的动态提醒数 (视频, 番剧, 专栏; 普通动态不算)
 * @see https://github.com/the1812/Bilibili-Evolved/issues/4427
 */
export const getNotifyCount = async (): Promise<number> => {
  const api = 'https://api.bilibili.com/x/web-interface/dynamic/entrance'
  const json = await getJsonWithCredentials(api)
  if (json.code !== 0) {
    return 0
  }
  return lodash.get(json, 'data.update_info.item.count', 0)
}
