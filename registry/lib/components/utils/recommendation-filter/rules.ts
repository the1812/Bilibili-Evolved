export interface KeywordGroup {
  id: string
  name?: string
  enabled: boolean
  keywords: string[]
}

export const generalGroupId = 'be-recommendation-filter-general'
export const generalGroupName = '通用过滤'

export interface FilterOptions {
  keywordGroups: KeywordGroup[]
  windowWidth: number
  windowHeight: number
  durationEnabled: boolean
  minimumMinutes: number
  minimumSeconds: number
  viewsEnabled: boolean
  minimumViews: number
  followedExempt: boolean
  ageEnabled: boolean
  maximumAgeDays: number
}

export interface Recommendation {
  bvid: string
  title?: string
  duration?: number
  views?: number
  followed?: boolean
  publishedAt?: number
}

export const normalizeText = (text: string) => text.normalize('NFKC').trim().toLowerCase()

export const isNonnegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

export const parseDuration = (text: string): number | undefined => {
  const parts = text.trim().split(':')
  if (parts.length < 2 || parts.length > 3 || !parts.every(p => /^\d+$/.test(p))) {
    return undefined
  }
  if (parts.slice(1).some(p => Number(p) >= 60)) {
    return undefined
  }
  return parts.reduce((total, part) => total * 60 + Number(part), 0)
}

export const matchRecommendation = (
  video: Recommendation,
  options: FilterOptions,
  home: boolean,
  now = Date.now(),
): string[] => {
  if (home && options.followedExempt && video.followed === true) {
    return []
  }
  const reasons: string[] = []
  const title = normalizeText(video.title || '')
  options.keywordGroups.forEach(group => {
    const words = group.keywords.map(normalizeText).filter(Boolean)
    if (!group.enabled || words.length === 0) {
      return
    }
    if (group.id === generalGroupId) {
      const matched = words.find(word => title.includes(word))
      if (matched) {
        reasons.push(`标题：${matched}`)
      }
    } else if (words.every(word => title.includes(word))) {
      reasons.push(`标题：${words.join(' ＋ ')}`)
    }
  })
  const minimumDuration = options.minimumMinutes * 60 + options.minimumSeconds
  if (
    options.durationEnabled &&
    isNonnegativeNumber(video.duration) &&
    video.duration < minimumDuration
  ) {
    reasons.push(`时长 ${video.duration} 秒 < ${minimumDuration} 秒`)
  }
  if (
    options.viewsEnabled &&
    isNonnegativeNumber(video.views) &&
    video.views < options.minimumViews
  ) {
    reasons.push(`播放量 ${video.views} < ${options.minimumViews}`)
  }
  if (
    home &&
    options.ageEnabled &&
    isNonnegativeNumber(video.publishedAt) &&
    video.publishedAt > 0 &&
    video.publishedAt * 1000 <= now &&
    now - video.publishedAt * 1000 > options.maximumAgeDays * 86400000
  ) {
    reasons.push(`发布超过 ${options.maximumAgeDays} 天`)
  }
  return reasons
}
