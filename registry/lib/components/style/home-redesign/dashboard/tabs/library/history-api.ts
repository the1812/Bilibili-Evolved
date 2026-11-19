import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { formatDate, formatDuration, formatTime } from '@/core/utils/formatters'
import { HistoryType, navbarFilterTypes } from '../../../../custom-navbar/history/types'
import { omitCurrentYear } from '../../shared/format-date'
import { getPlaybackProgress, type LibraryEntry } from './library'

interface RawHistoryItem {
  title: string
  show_title?: string
  cover?: string
  covers?: string[]
  uri?: string
  author_name?: string
  author_mid?: number
  author_face?: string
  view_at: number
  duration?: number
  progress?: number
  history: {
    business: HistoryType
    oid?: number
    bvid?: string
    epid?: number
    cid?: number
    page?: number
  }
}

const site = 'https://www.bilibili.com'
const getHistoryContent = (item: RawHistoryItem) => {
  const { business, oid, bvid, epid, cid, page } = item.history
  const resume = `t=${item.progress > 0 ? item.progress : 0}`
  if (business === HistoryType.Cheese) {
    return { type: HistoryType.Video, id: oid, url: item.uri, title: item.show_title }
  }
  if (epid) {
    return {
      type: HistoryType.Bangumi,
      id: epid,
      url: `${site}/bangumi/play/ep${epid}?${resume}`,
      title: item.show_title,
    }
  }
  if (bvid || (business === HistoryType.Video && oid)) {
    return {
      type: HistoryType.Video,
      id: bvid || oid,
      aid: oid,
      url: `${site}/video/${bvid || `av${oid}`}?p=${page || 1}&${resume}`,
    }
  }
  if (business === HistoryType.Article && (oid || cid)) {
    const id = oid || cid
    return { type: HistoryType.Article, id, url: `${site}/read/cv${id}` }
  }
  if (business === HistoryType.Live && oid) {
    return { type: HistoryType.Live, id: oid, url: `https://live.bilibili.com/${oid}` }
  }
  return undefined
}

const formatHistoryTime = (seconds: number, today: string, yesterday: string) => {
  const date = new Date(seconds * 1000)
  if (!Number.isFinite(date.getTime())) {
    return undefined
  }
  const day = formatDate(date)
  let label = omitCurrentYear(day, today)
  if (day === today) {
    label = '今天'
  } else if (day === yesterday) {
    label = '昨天'
  }
  return `${label} ${formatTime(date).slice(0, 5)}`
}

const contentKinds: Partial<Record<HistoryType, LibraryEntry['kind']>> = {
  [HistoryType.Video]: 'video',
  [HistoryType.Article]: 'article',
  [HistoryType.Bangumi]: 'bangumi',
}

export const getHistoryPage = async (type: HistoryType, viewAt?: number) => {
  const filter = navbarFilterTypes.find(item => item.name === type)
  const params = new URLSearchParams({ type: filter?.apiType ?? '' })
  if (viewAt !== undefined) {
    params.set('view_at', String(viewAt))
  }
  const { list } = await bilibiliApi<{ list?: RawHistoryItem[] }>(
    getJsonWithCredentials(`https://api.bilibili.com/x/web-interface/history/cursor?${params}`),
    '获取历史记录失败',
    false,
  )
  const items = Array.isArray(list) ? list : []
  const now = new Date()
  const today = formatDate(now)
  const yesterday = formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))
  const entries = items.flatMap((item): LibraryEntry[] => {
    const content = getHistoryContent(item)
    if (!content || (type !== HistoryType.All && type !== content.type)) {
      return []
    }
    const kind = contentKinds[content.type] ?? 'other'
    const hasPlayback = kind === 'video' || kind === 'bangumi'
    const progress = hasPlayback ? getPlaybackProgress(item.progress, item.duration) : undefined
    const isSeries = kind === 'bangumi' || item.history.business === HistoryType.Cheese
    return [
      {
        id: `${content.type}:${content.id}`,
        aid: content.aid,
        kind,
        title: content.title || item.title,
        url: content.url,
        coverUrl: item.cover || item.covers?.[0],
        badge: navbarFilterTypes.find(({ name }) => name === content.type)?.displayName,
        durationText: hasPlayback && item.duration > 0 ? formatDuration(item.duration) : undefined,
        upName: isSeries ? item.title : item.author_name,
        upID: isSeries ? undefined : item.author_mid,
        upFaceUrl: item.author_face,
        detail: [
          formatHistoryTime(item.view_at, today, yesterday),
          progress === 1 ? '已看完' : undefined,
        ]
          .filter(Boolean)
          .join(' · '),
        progress,
      },
    ]
  })
  // Videos and bangumi share a server-side filter. Advance using the unfiltered page.
  const next = items.at(-1)?.view_at
  return { entries, next: next && (viewAt === undefined || next < viewAt) ? next : undefined }
}
