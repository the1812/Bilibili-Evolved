import { getJsonWithCredentials, bilibiliApi } from '@/core/ajax'
import { fixed } from '@/core/utils'
import { formatDuration } from '@/core/utils/formatters'

/** 历史项目类型, 值为 API 中的 `history.business` */
export enum HistoryType {
  All = 'all',
  Video = 'archive',
  Live = 'live',
  Article = 'article',
  Bangumi = 'pgc',
}
export interface HistoryItem {
  id: string | number
  url: string
  title: string
  /** 视频/直播的封面 */
  cover: string
  /** 专栏封面 */
  covers: string[]
  type: HistoryType
  upName: string
  upID: number
  upFaceUrl: string
  /** 观看时间戳 */
  viewAt: number
  /** 观看时间对象 */
  time: Date
  /** 观看时间展示文字 */
  timeText: string
  /** 进度, `-1`为已看完, 否则为已观看的秒数 */
  progress: number
  /** 进度展示文字 */
  progressText: string
  /** 时长 */
  duration: number
  /** 时长展示文字 */
  durationText: string
  /** 视频的分P */
  page?: number
  /** 直播状态: 0 未开播 1 直播中 2 轮播中 (似乎新 API 不会返回 2) */
  liveStatus?: number
  /** 视频的tag/直播的分区名 */
  tagName?: string
}
/** 按类型过滤 */
export interface TypeFilter {
  name: HistoryType
  displayName: string
  icon: string
  checked: boolean
  apiType: string
}
/** 所有的历史记录类型 */
export const types = [
  {
    name: HistoryType.All,
    displayName: '全部',
    icon: '',
    checked: true,
    apiType: '',
  },
  {
    name: HistoryType.Video,
    displayName: '视频',
    icon: 'mdi-play-circle-outline',
    checked: false,
    apiType: 'archive',
  },
  {
    name: HistoryType.Bangumi,
    displayName: '番剧',
    icon: 'mdi-television-classic',
    checked: false,
    apiType: 'archive',
  },
  {
    name: HistoryType.Live,
    displayName: '直播',
    icon: 'mdi-video-wireless-outline',
    checked: false,
    apiType: 'live',
  },
  {
    name: HistoryType.Article,
    displayName: '专栏',
    icon: 'mdi-newspaper-variant-outline',
    checked: false,
    apiType: 'article',
  },
] as TypeFilter[]

const getTimeData = () => {
  const now = new Date()
  const today = Number(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
  const oneDay = 24 * 3600000
  const yesterday = today - oneDay
  const lastWeek = today - 7 * oneDay
  return {
    now,
    today,
    oneDay,
    yesterday,
    lastWeek,
  }
}
const formatTime = (date: Date) => {
  const { yesterday } = getTimeData()
  const timestamp = Number(date)
  if (timestamp >= yesterday) {
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
  }
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`
}
const parseHistoryItem = (item: any): HistoryItem => {
  if (item.history.business === 'article') {
    item.history.cid = item.history.oid
  }
  const {
    epid, // 番剧 ep号
    bvid, // 视频 bv号
    cid, // 专栏 cv号
    oid, // 直播 房间号 / 专栏 cv 号
  } = item.history
  const progressParam = item.progress > 0 ? `t=${item.progress}` : 't=0'
  const progress = item.progress === -1 ? 1 : item.progress / item.duration
  const https = (url: string) => url.replace('http:', 'https:')
  const time = new Date(item.view_at * 1000)
  const cover = (() => {
    if (item.cover) {
      return https(item.cover)
    }
    if (item.covers) {
      return https(item.covers[0])
    }
    return ''
  })()
  const commonInfo = {
    title: item.title,
    viewAt: item.view_at * 1000,
    time,
    timeText: formatTime(time),
    cover,
    covers: item.covers?.map(https) ?? [],
    progress,
    progressText: Number.isNaN(progress) ? null : `${fixed(progress * 100, 1)}%`,
    duration: item.duration,
    durationText: item.duration ? formatDuration(item.duration) : null,
    upName: item.author_name,
    upFaceUrl: https(item.author_face),
    upID: item.author_mid,
  }
  if (epid) {
    return {
      ...commonInfo,
      id: epid,
      url: `https://www.bilibili.com/bangumi/play/ep${epid}?${progressParam}`,
      title: item.show_title || item.title,
      upName: item.title,
      type: HistoryType.Bangumi,
    }
  }
  if (bvid) {
    return {
      ...commonInfo,
      id: bvid,
      url: `https://www.bilibili.com/video/${bvid}?p=${item.history.page}&${progressParam}`,
      type: HistoryType.Video,
    }
  }
  if (cid) {
    return {
      ...commonInfo,
      id: cid,
      url: `https://www.bilibili.com/read/cv${cid}`,
      type: HistoryType.Article,
    }
  }
  if (oid) {
    return {
      ...commonInfo,
      id: oid,
      url: `https://live.bilibili.com/${oid}`,
      liveStatus: item.live_status,
      type: HistoryType.Live,
    }
  }
  console.error('unknown history item type', item)
  throw new Error('未知的历史项目类型')
}
/**
 * 获取指定观看时间之前的一页历史记录, 不指定则返回最新的历史记录
 * @param viewTime 观看时间
 */
export const getHistoryItems = async (viewTime?: number, type?: TypeFilter) => {
  const api = 'https://api.bilibili.com/x/web-interface/history/cursor'
  const params = new URLSearchParams()
  if (viewTime) {
    params.set('view_at', Math.round(viewTime / 1000).toString())
  }
  params.set('type', type?.apiType ?? '')
  const { list } = await bilibiliApi(
    getJsonWithCredentials(`${api}?${params.toString()}`),
    '获取历史记录失败',
  )
  if (!Array.isArray(list)) {
    return []
  }
  return (list as any[]).map(parseHistoryItem)
}
/**
 * 为历史记录项目分组, 包含`今天`, `昨天`, `本周`, `更早`
 * @param historyItems 历史记录项目
 */
export const group = (historyItems: HistoryItem[]) => {
  if (historyItems.length === 0) {
    return []
  }
  const { today, yesterday, lastWeek } = getTimeData()
  const groups = lodash.groupBy(historyItems, h => {
    if (h.viewAt >= today) {
      return '今天'
    }
    if (h.viewAt >= yesterday) {
      return '昨天'
    }
    if (h.viewAt >= lastWeek) {
      return '本周'
    }
    return '更早'
  })
  return Object.entries(groups).map(([key, value]) => ({
    name: key,
    items: value,
  }))
}
