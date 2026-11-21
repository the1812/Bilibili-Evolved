import { bilibiliApi, getJsonWithCredentials, postTextWithCredentials } from '@/core/ajax'
import { getCsrf } from '@/core/utils'
import { formatDuration } from '@/core/utils/formatters'
import { HistoryType, navbarFilterTypes } from '../../../../custom-navbar/history/types'
import { formatDateTimeLabel } from '../../shared/format-date'
import {
  dashboardApiUrls,
  getBangumiEpisodeUrl,
  getColumnUrl,
  getLiveRoomUrl,
  getVideoHistoryUrl,
  getWebUrl,
} from '../../shared/urls'
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

interface HistoryPage {
  list?: RawHistoryItem[] | null
  cursor?: {
    max?: number | string
    view_at?: number
    business?: string
  }
}

const getHistoryContent = (item: RawHistoryItem) => {
  const { business, oid, bvid, epid, cid, page } = item.history
  const resumeTime = item.progress > 0 ? item.progress : 0
  if (business === HistoryType.Cheese) {
    return { type: HistoryType.Video, id: oid, url: getWebUrl(item.uri), title: item.show_title }
  }
  if (epid) {
    return {
      type: HistoryType.Bangumi,
      id: epid,
      url: getBangumiEpisodeUrl(epid, resumeTime),
      title: item.show_title,
    }
  }
  if (bvid || (business === HistoryType.Video && oid)) {
    return {
      type: HistoryType.Video,
      id: bvid || oid,
      aid: oid,
      url: getVideoHistoryUrl(bvid || `av${oid}`, page || 1, resumeTime),
    }
  }
  if (business === HistoryType.Article && (oid || cid)) {
    const id = oid || cid
    return { type: HistoryType.Article, id, url: getColumnUrl(id) }
  }
  if (business === HistoryType.Live && oid) {
    return { type: HistoryType.Live, id: oid, url: getLiveRoomUrl(oid) }
  }
  return undefined
}

const formatHistoryTime = (seconds: number) => {
  const date = new Date(seconds * 1000)
  if (!Number.isFinite(date.getTime())) {
    return undefined
  }
  return formatDateTimeLabel(date)
}

const contentKinds: Partial<Record<HistoryType, LibraryEntry['kind']>> = {
  [HistoryType.Video]: 'video',
  [HistoryType.Article]: 'column',
  [HistoryType.Bangumi]: 'bangumi',
}

const getNextCursor = (cursor: HistoryPage['cursor'], lastViewTime: number) => {
  const viewAt = cursor?.view_at ?? lastViewTime
  if (!Number.isSafeInteger(viewAt) || viewAt <= 0) {
    return undefined
  }
  // Serialize consistently so the paged list can detect a repeated server cursor.
  const next = new URLSearchParams({ view_at: String(viewAt) })
  if (typeof cursor?.max === 'string' || Number.isSafeInteger(cursor?.max)) {
    next.set('max', String(cursor.max))
  }
  if (cursor?.business) {
    next.set('business', cursor.business)
  }
  return next.toString()
}

export const getHistoryPage = async (type: HistoryType, cursor?: string) => {
  const filter = navbarFilterTypes.find(item => item.name === type)
  const params = new URLSearchParams(cursor)
  params.set('type', filter?.apiType ?? '')
  const { list, cursor: nextCursor } = await bilibiliApi<HistoryPage>(
    getJsonWithCredentials(`${dashboardApiUrls.history}?${params}`),
    '获取历史记录失败',
    false,
  )
  if (list != null && !Array.isArray(list)) {
    throw new Error('历史记录响应无效')
  }
  const items = list ?? []
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
        detail: [formatHistoryTime(item.view_at), progress === 1 ? '已看完' : undefined]
          .filter(Boolean)
          .join(' · '),
        progress,
      },
    ]
  })
  // Videos and bangumi share a server-side filter. Advance using the unfiltered page.
  const next = items.length ? getNextCursor(nextCursor, items.at(-1).view_at) : undefined
  return { entries, next }
}

export const getHistoryRecordingPaused = async () => {
  const result = await bilibiliApi<unknown>(
    getJsonWithCredentials(dashboardApiUrls.historyRecording),
    '读取历史记录状态失败',
    false,
  )
  return result === true
}

export const setHistoryRecordingPaused = async (paused: boolean) => {
  const csrf = getCsrf()
  if (!csrf) {
    throw new Error('登录已失效')
  }
  const params = new URLSearchParams({ csrf, switch: String(paused) })
  await bilibiliApi(
    postTextWithCredentials(dashboardApiUrls.setHistoryRecording, params.toString()).then(
      JSON.parse,
    ),
    '更新历史记录状态失败',
    false,
  )
}
