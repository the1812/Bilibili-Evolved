import { feedsCardTypes, getFeeds } from '@/components/feeds/api'
import { bilibiliApi, getJsonWithCredentials, postJsonWithCredentials } from '@/core/ajax'
import { getCsrf } from '@/core/utils'
import { dashboardApiUrls, getLiveRoomUrl, getSpaceUrls } from '../../shared/urls'
import { toDynamicPost, type DynamicEntry, type RawDynamicPost } from './dynamic-post'

interface FeedPage {
  items?: RawDynamicPost[]
  offset?: string
  has_more: boolean
}

export type DynamicFeedType = 'all' | 'pgc' | 'column'

export interface DynamicLiveRoom {
  id: string
  title: string
  name?: string
  avatar?: string
  url: string
  profileUrl?: string
}

interface DynamicPortal {
  live_users?: {
    items?: {
      room_id?: number | string
      mid?: number | string
      title?: string
      uname?: string
      face?: string
    }[]
  }
}

export const getDynamicLiveRooms = async (): Promise<DynamicLiveRoom[]> => {
  const portal = await bilibiliApi<DynamicPortal>(
    getJsonWithCredentials(dashboardApiUrls.liveRooms),
    '获取正在直播的房间失败',
    false,
  )
  const rooms = (portal.live_users?.items ?? []).flatMap(room => {
    const id = String(room.room_id ?? '')
    const name = room.uname?.trim()
    const title = room.title?.trim() || name
    if (!/^[1-9]\d*$/.test(id) || !title) {
      return []
    }
    const mid = String(room.mid ?? '')
    return [
      {
        id,
        title,
        name,
        avatar: room.face,
        url: getLiveRoomUrl(id),
        profileUrl: /^[1-9]\d*$/.test(mid) ? getSpaceUrls(mid).home : undefined,
      },
    ]
  })
  return lodash.uniqBy(rooms, room => room.id)
}

export const getDynamicFeedPage = async (type: DynamicFeedType, offset?: string) => {
  const feedType = type === 'column' ? feedsCardTypes.column : type
  const page = await bilibiliApi<FeedPage>(getFeeds(feedType, offset), '获取动态失败', false)
  const posts = page.items ?? []
  const entries: DynamicEntry[] = posts
    .filter(post => post.id_str)
    .map(post => ({
      ...toDynamicPost(post),
      original: post.orig?.id_str ? toDynamicPost(post.orig) : undefined,
    }))
  const nextOffset = page.has_more ? page.offset || posts.at(-1)?.id_str : undefined

  return { entries, next: nextOffset }
}

export const setDynamicLike = async (id: string, liked: boolean) => {
  const csrf = getCsrf()
  if (!csrf) {
    throw new Error('请先登录')
  }
  const params = new URLSearchParams({ csrf })
  const response = postJsonWithCredentials(`${dashboardApiUrls.dynamicLike}?${params}`, {
    dyn_id_str: id,
    up: liked ? 1 : 2,
  }).then(JSON.parse)
  await bilibiliApi(response, liked ? '点赞失败' : '取消点赞失败', false)
}
