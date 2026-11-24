import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { getDateFromUnixSeconds } from '../../shared/format-date'
import { dashboardApiUrls } from '../../shared/urls'

interface RawFollowing {
  mid: number
  uname: string
  face?: string
  sign?: string
  mtime?: number
}

export type Following = Omit<RawFollowing, 'mtime'> & { followedOn?: Date }

interface FollowingPage {
  list?: RawFollowing[]
  total: number
}

const pageSize = 50

export const getFollowingsPage = async (uid: string, page: number) => {
  const params = new URLSearchParams({ vmid: uid, pn: String(page), ps: String(pageSize) })
  const { list, total } = await bilibiliApi<FollowingPage>(
    getJsonWithCredentials(`${dashboardApiUrls.followings}?${params}`),
    '获取关注列表失败',
    false,
  )
  const entries: Following[] = (list ?? []).map(({ mtime, sign, ...following }) => ({
    ...following,
    sign: sign?.trim(),
    followedOn: getDateFromUnixSeconds(mtime),
  }))
  return { entries, next: entries.length > 0 && page * pageSize < total ? page + 1 : undefined }
}
