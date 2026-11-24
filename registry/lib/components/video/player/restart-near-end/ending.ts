import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { bangumiUrls, matchCurrentPage } from '@/core/utils/urls'

export interface OfficialEnding {
  start: number
  end: number
}

const getEpisodeIdFromUrl = () => {
  const epMatch = document.URL.match(/\/bangumi\/play\/ep(\d+)/i)
  if (epMatch) {
    return Number.parseInt(epMatch[1])
  }
  return null
}

const normalizeSeconds = (value: number) => (value > 100000 ? value / 1000 : value)

/**
 * 从番剧 season 接口读取官方片尾点 (best-effort).
 * 普通投稿视频通常没有该数据, 失败时返回 null 并由进度模式兜底.
 */
export const tryGetOfficialEnding = async (): Promise<OfficialEnding | null> => {
  if (!matchCurrentPage(bangumiUrls)) {
    return null
  }
  const epid = getEpisodeIdFromUrl()
  if (!epid) {
    return null
  }
  try {
    const data = await bilibiliApi(
      getJsonWithCredentials(`https://api.bilibili.com/pgc/view/web/season?ep_id=${epid}`),
      '获取番剧片尾信息失败',
      false,
    )
    const episodes: any[] = [
      ...(data.episodes ?? []),
      ...((data.section ?? []) as any[]).flatMap((section: any) => section.episodes ?? []),
    ]
    const current = episodes.find(ep => Number(ep.ep_id ?? ep.id) === epid)
    const ed = current?.skip?.ed
    if (!ed || typeof ed.start !== 'number') {
      return null
    }
    const start = normalizeSeconds(ed.start)
    const end = typeof ed.end === 'number' ? normalizeSeconds(ed.end) : start
    // start=0 常见于无片尾占位数据, 不能当作有效片尾
    if (!Number.isFinite(start) || start <= 0) {
      return null
    }
    return { start, end }
  } catch {
    return null
  }
}

/** 历史点是否已进入官方片尾区 */
export const isInOfficialEnding = (time: number, ending: OfficialEnding | null) => {
  if (!ending) {
    return false
  }
  return time >= ending.start
}
