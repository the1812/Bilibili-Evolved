import { watchlaterList, type RawWatchlaterItem } from '@/components/video/watchlater'
import { bilibiliApi, getJsonWithCredentials, postTextWithCredentials } from '@/core/ajax'
import { getCsrf } from '@/core/utils'

const watchlaterApi = 'https://api.bilibili.com/x/v2/history/toview'

export const getWatchlaterQueue = async () => {
  const data = await bilibiliApi<{ list?: RawWatchlaterItem[] }>(
    getJsonWithCredentials(`${watchlaterApi}/web`),
    '获取稍后再看列表失败',
    false,
  )
  const queue = data?.list ?? []
  watchlaterList.splice(0, watchlaterList.length, ...queue.map(({ aid }) => aid))
  return queue
}

export const clearWatchlater = async (watchedOnly: boolean) => {
  const csrf = getCsrf()
  if (!csrf) {
    throw new Error('登录已失效')
  }
  const body = new URLSearchParams({ csrf })
  if (watchedOnly) {
    body.set('viewed', 'true')
  }
  const action = watchedOnly ? 'del' : 'clear'
  await bilibiliApi(
    postTextWithCredentials(`${watchlaterApi}/${action}`, body.toString()).then(JSON.parse),
    '更新稍后再看失败',
    false,
  )
}
