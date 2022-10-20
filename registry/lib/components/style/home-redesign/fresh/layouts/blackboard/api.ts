import { getJson } from '@/core/ajax'

export interface Blackboard {
  url: string
  title: string
  isAd: boolean
  imageUrl: string
}
export const getBlackboards = async (): Promise<Blackboard[]> => {
  const locId = 4694
  const api = `https://api.bilibili.com/x/web-show/res/locs?pf=0&ids=${locId}`
  const { code, message, data } = await getJson(api)
  if (code !== 0) {
    throw new Error(`获取活动卡片失败: ${message}`)
  }
  const list: any[] = data[locId]
  return list.map(
    it =>
      ({
        url: it.url,
        title: it.name,
        // isAd: it.is_ad_loc,
        isAd: it.res_id !== locId,
        imageUrl: it.pic,
      } as Blackboard),
  )
}
