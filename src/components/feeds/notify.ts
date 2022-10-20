import { getCookieValue, getUID } from '@/core/utils'
import { getJsonWithCredentials } from '@/core/ajax'
import { navbarFeedsTypeList } from './api'

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
export const getNotifyCount = async (typeList?: string): Promise<number> => {
  const api = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_num?rsp_type=1&uid=${getUID()}&update_num_dy_id=${getLatestID()}&type_list=${
    typeList || navbarFeedsTypeList
  }`
  const json = await getJsonWithCredentials(api)
  if (json.code !== 0) {
    return 0
  }
  return lodash.get(json, 'data.update_num', 0)
}
