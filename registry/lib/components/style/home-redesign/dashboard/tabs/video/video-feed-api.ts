import { applyContentFilter, getFeeds, groupVideoFeeds } from '@/components/feeds/api'
import type { VideoCard } from '@/components/feeds/video-card'
import { watchlaterList } from '@/components/video/watchlater'
import { bilibiliApi } from '@/core/ajax'
import { formatCount, formatDuration, parseCount, parseDuration } from '@/core/utils/formatters'

interface RawVideoFeedItem {
  id_str?: string
  modules?: {
    module_author?: { name?: string; face?: string; mid?: number; pub_ts?: number }
    module_dynamic?: {
      desc?: {
        text?: string
        rich_text_nodes?: { type: string; text?: string; jump_url?: string }[]
      }
      major?: {
        archive?: {
          aid: string | number
          bvid: string
          title: string
          cover: string
          desc?: string
          duration_text?: string
          stat?: { play?: string | number; danmaku?: string | number }
        }
      }
    }
    module_stat?: { like?: { count?: number } }
  }
}

interface VideoFeedPage {
  items?: RawVideoFeedItem[]
  has_more?: boolean
  offset?: string
}

const formatArchiveCount = (count?: string | number) =>
  count == null ? '' : formatCount(parseCount(count))

const toVideoCard = ({ id_str: id, modules }: RawVideoFeedItem): VideoCard | undefined => {
  const dynamic = modules?.module_dynamic
  const archive = dynamic?.major?.archive
  const aid = Number(archive?.aid)
  if (!id || !archive || !Number.isSafeInteger(aid) || aid <= 0) {
    return undefined
  }

  const author = modules?.module_author
  const timestamp = author?.pub_ts === undefined ? undefined : author.pub_ts * 1000
  const duration = archive.duration_text ? parseDuration(archive.duration_text) : undefined
  const likes = modules?.module_stat?.like?.count
  const topics = (dynamic?.desc?.rich_text_nodes ?? []).flatMap((node, index) =>
    node.type === 'RICH_TEXT_NODE_TYPE_TOPIC' && node.text
      ? [{ id: index, name: node.text, url: node.jump_url }]
      : [],
  )
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
    topics,
    dynamic: dynamic?.desc?.text ?? '',
    like: likes == null ? undefined : formatCount(likes),
    duration,
    durationText: duration === undefined ? '' : formatDuration(duration),
    playCount: formatArchiveCount(archive.stat?.play),
    danmakuCount: formatArchiveCount(archive.stat?.danmaku),
    watchlater: watchlaterList.includes(aid),
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
  return { entries: applyContentFilter(groupVideoFeeds(cards)), next: nextOffset }
}
