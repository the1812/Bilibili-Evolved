import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { formatDuration } from '@/core/utils/formatters'
import {
  dashboardApiUrls,
  getAudioUrl,
  getBangumiSeasonUrl,
  getCollectionUrl,
  getFavoriteFolderUrl,
  getVideoUrl,
} from '../../shared/urls'
import type { LibraryEntry } from './library'

export const favoriteKinds = {
  folders: '收藏夹',
  collections: '订阅合集与收藏夹',
  bangumi: '追番',
  cinema: '追剧',
} as const

export const followStatuses = { 0: '全部', 1: '想看', 2: '在看', 3: '看过' } as const

export interface FavoriteFolder {
  id: number
  title: string
  media_count: number
}

interface FavoriteOwner {
  mid?: number
  name?: string
  face?: string
}

interface FavoriteMedia {
  id: number
  bvid?: string
  type: number
  attr?: number
  title: string
  cover?: string
  duration?: number
  upper?: FavoriteOwner
}

interface CollectedFolder {
  id: number
  type: number
  mid: number
  title: string
  cover?: string
  media_count?: number
  upper?: FavoriteOwner
}

interface FollowedShow {
  season_id: number
  title: string
  cover?: string
  square_cover?: string
  progress?: string
  new_ep?: { index_show?: string }
  follow_status?: keyof typeof followStatuses
}

const pageSize = 20
const getFavoriteData = <T>(url: string, params: URLSearchParams, message: string) =>
  bilibiliApi<T>(getJsonWithCredentials(`${url}?${params}`), message, false)

export const getFavoriteFolders = async (uid: string) => {
  const { list } = await getFavoriteData<{ list?: FavoriteFolder[] }>(
    dashboardApiUrls.favoriteFolders,
    new URLSearchParams({ up_mid: uid, type: '2', rid: '0' }),
    '获取收藏夹列表失败',
  )
  return list ?? []
}

export const getFavoriteMedia = async (folder: number, page: number) => {
  const { medias, has_more } = await getFavoriteData<{
    medias?: FavoriteMedia[]
    has_more?: boolean
  }>(
    dashboardApiUrls.favoriteMedia,
    new URLSearchParams({
      media_id: String(folder),
      pn: String(page),
      ps: String(pageSize),
      order: 'mtime',
      type: '0',
      tid: '0',
      platform: 'web',
    }),
    '获取收藏夹内容失败',
  )
  return {
    entries: (medias ?? []).map((item): LibraryEntry => {
      const unavailable = item.attr === 1 || item.attr === 9
      const duration = item.duration > 0 ? formatDuration(item.duration) : undefined
      let url: string | undefined
      if (!unavailable) {
        if (item.type === 12) {
          url = getAudioUrl(item.id)
        } else if (item.bvid || item.type === 2) {
          url = getVideoUrl(item.bvid || `av${item.id}`)
        }
      }
      return {
        id: `${item.type}:${item.id}`,
        aid: !unavailable && item.type === 2 ? item.id : undefined,
        kind: item.type === 2 || item.bvid ? 'video' : 'other',
        title: item.title,
        url,
        coverUrl: item.cover,
        badge: unavailable ? '已失效' : undefined,
        durationText: unavailable ? undefined : duration,
        upName: item.upper?.name,
        upID: item.upper?.mid,
        upFaceUrl: item.upper?.face,
      }
    }),
    next: has_more && medias?.length ? page + 1 : undefined,
  }
}

export const getCollectedFolders = async (uid: string, page: number) => {
  const { list, has_more } = await getFavoriteData<{
    list?: CollectedFolder[]
    has_more?: boolean
  }>(
    dashboardApiUrls.collectedFolders,
    new URLSearchParams({ up_mid: uid, pn: String(page), ps: String(pageSize), platform: 'web' }),
    '获取订阅合集失败',
  )
  return {
    entries: (list ?? []).flatMap((item): LibraryEntry[] => {
      if (item.type !== 11 && item.type !== 21) {
        return []
      }
      const isCollection = item.type === 21
      return [
        {
          id: `${item.type}:${item.id}`,
          kind: 'other',
          title: item.title,
          coverUrl: item.cover,
          url: isCollection ? getCollectionUrl(item.mid, item.id) : getFavoriteFolderUrl(item.id),
          badge: isCollection ? '合集' : '收藏夹',
          upName: item.upper?.name,
          upID: item.upper?.mid || item.mid,
          upFaceUrl: item.upper?.face,
          detail: item.media_count ? `${item.media_count} 个内容` : undefined,
        },
      ]
    }),
    next: has_more && list?.length ? page + 1 : undefined,
  }
}

export const getFollowedShows = async (
  uid: string,
  kind: 'bangumi' | 'cinema',
  status: number,
  page: number,
) => {
  const { list, total } = await getFavoriteData<{ list?: FollowedShow[]; total?: number }>(
    dashboardApiUrls.followedShows,
    new URLSearchParams({
      vmid: uid,
      type: kind === 'bangumi' ? '1' : '2',
      follow_status: String(status),
      pn: String(page),
      ps: String(pageSize),
    }),
    kind === 'bangumi' ? '获取追番失败' : '获取追剧失败',
  )
  return {
    entries: (list ?? []).map(
      (item): LibraryEntry => ({
        id: item.season_id,
        kind: 'bangumi',
        title: item.title,
        coverUrl: item.square_cover || item.cover,
        url: getBangumiSeasonUrl(item.season_id),
        badge: item.follow_status ? followStatuses[item.follow_status] : undefined,
        detail: [item.progress, item.new_ep?.index_show].filter(Boolean).join(' · '),
      }),
    ),
    next: list?.length && page * pageSize < total ? page + 1 : undefined,
  }
}
