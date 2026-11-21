import { watchlaterList, type RawWatchlaterItem } from '@/components/video/watchlater'
import { bilibiliApi, getJsonWithCredentials, postTextWithCredentials } from '@/core/ajax'
import { getCsrf } from '@/core/utils'
import { dashboardApiUrls } from '../../shared/urls'

export const getWatchlaterQueue = async () => {
  const data = await bilibiliApi<{ list?: RawWatchlaterItem[] }>(
    getJsonWithCredentials(dashboardApiUrls.watchlaterQueue),
    '获取稍后再看列表失败',
    false,
  )
  const queue = data?.list ?? []
  watchlaterList.splice(0, watchlaterList.length, ...queue.map(({ aid }) => aid))
  return queue
}

const updateWatchlater = async (url: string, params?: Record<string, string>) => {
  const csrf = getCsrf()
  if (!csrf) {
    throw new Error('登录已失效')
  }
  const body = new URLSearchParams({ csrf, ...params })
  await bilibiliApi(
    postTextWithCredentials(url, body.toString()).then(JSON.parse),
    '更新稍后再看失败',
    false,
  )
}

export const removeWatchlater = async (aid: number) => {
  await updateWatchlater(dashboardApiUrls.removeWatchlater, { aid: String(aid) })
  const index = watchlaterList.indexOf(aid)
  if (index >= 0) {
    watchlaterList.splice(index, 1)
  }
}

export const clearWatchlater = (watchedOnly: boolean) =>
  watchedOnly
    ? updateWatchlater(dashboardApiUrls.removeWatchlater, { viewed: 'true' })
    : updateWatchlater(dashboardApiUrls.clearWatchlater)
