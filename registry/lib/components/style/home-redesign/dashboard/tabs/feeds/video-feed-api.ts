import { applyContentFilter, getFeeds, groupVideoFeeds } from '@/components/feeds/api'
import type { VideoCard } from '@/components/feeds/video-card'
import { bilibiliApi } from '@/core/ajax'
import { formatCount, formatDuration, parseDuration } from '@/core/utils/formatters'
import {
  getDynamicMediaCounts,
  getDynamicStats,
  getDynamicTopics,
  type DynamicPost,
  type RawDynamicStats,
  type RawDynamicTopics,
  type RawMediaWithStats,
} from './dynamic-post'

interface RawVideoFeedItem {
  id_str?: string
  modules?: {
    module_author?: { name?: string; face?: string; mid?: number; pub_ts?: number }
    module_dynamic?: RawDynamicTopics & {
      major?: {
        archive?: RawMediaWithStats & {
          aid: string | number
          bvid: string
          title: string
          cover: string
          desc?: string
          duration_text?: string
        }
      }
    }
    module_stat?: RawDynamicStats
  }
}

interface VideoFeedPage {
  items?: RawVideoFeedItem[]
  has_more?: boolean
  offset?: string
}

export type VideoFeedCard = VideoCard & { postStats?: DynamicPost['stats'] }

const toVideoCard = ({ id_str: id, modules }: RawVideoFeedItem): VideoFeedCard | undefined => {
  const dynamic = modules?.module_dynamic
  const archive = dynamic?.major?.archive
  const aid = Number(archive?.aid)
  if (!id || !archive || !Number.isSafeInteger(aid) || aid <= 0) {
    return undefined
  }

  const author = modules?.module_author
  const timestamp = author?.pub_ts === undefined ? undefined : author.pub_ts * 1000
  const duration = archive.duration_text ? parseDuration(archive.duration_text) : undefined
  const postStats = getDynamicStats(modules?.module_stat)
  const likes = postStats?.like?.count
  const { playCount, danmakuCount } = getDynamicMediaCounts(archive)
  return {
    id,
    aid,
    bvid: archive.bvid,
    title: archive.title,
    upName: author?.name ?? '',
    upFaceUrl: author?.face,
    upID: author?.mid,
    coverUrl: archive.cover,
    description: archive.desc ?? '',
    timestamp,
    time: timestamp === undefined ? undefined : new Date(timestamp),
    topics: getDynamicTopics(dynamic),
    dynamic: dynamic?.desc?.text ?? '',
    like: likes == null ? undefined : formatCount(likes),
    postStats,
    duration,
    durationText: duration === undefined ? '' : formatDuration(duration),
    playCount: playCount ?? '',
    danmakuCount: danmakuCount ?? '',
  }
}

export const getVideoFeedPage = async (offset?: string) => {
  const page = await bilibiliApi<VideoFeedPage>(
    getFeeds('video', offset),
    '获取关注视频失败',
    false,
  )
  const items = page.items ?? []
  const cards = items.map(toVideoCard).filter(Boolean)
  const nextOffset = page.has_more ? page.offset || items.at(-1)?.id_str : undefined
  return {
    entries: applyContentFilter(groupVideoFeeds(cards) as VideoFeedCard[]),
    next: nextOffset,
  }
}
