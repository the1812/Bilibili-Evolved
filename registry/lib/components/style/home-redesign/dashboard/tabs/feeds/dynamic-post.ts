import { normalizeFeedsCardModules } from '@/components/feeds/api'
import { getDpiSourceSet, retrieveImageUrl } from '@/core/utils'
import { formatCount, parseCount } from '@/core/utils/formatters'
import type { ContentCardData, ContentCardKind } from '../../shared/cards/content-card'
import {
  getBangumiEpisodeUrl,
  getBangumiMediaUrl,
  getDynamicUrl,
  getWebUrl,
} from '../../shared/urls'

interface RawImage {
  src?: string
  url?: string
  width?: number
  height?: number
}

export interface RawMediaWithStats {
  stat?: { play?: string | number; danmaku?: string | number }
  stat_hidden?: boolean | number
}

interface RawAttachment extends RawMediaWithStats {
  title?: string
  desc?: string
  cover?: string
  covers?: string[]
  jump_url?: string
  label?: string
}

const attachmentTypes = {
  archive: { icon: 'mdi-play-box-outline', label: '视频' },
  pgc: { icon: 'mdi-television-play', label: '番剧' },
  column: { icon: 'mdi-file-document-outline', label: '专栏' },
  music: { icon: 'mdi-music-note', label: '音频' },
  live: { icon: 'mdi-video-outline', label: '直播' },
  courses: { icon: 'mdi-school-outline', label: '课程' },
  ugc_season: { icon: 'mdi-playlist-play', label: '合集' },
  medialist: { icon: 'mdi-playlist-play', label: '收藏夹' },
  common: { icon: 'mdi-link-variant', label: '分享' },
  opus: { icon: 'mdi-text-box-outline', label: '图文' },
}

type AttachmentKind = keyof typeof attachmentTypes
const getRawAttachmentKind = (kind: AttachmentKind) => (kind === 'column' ? 'article' : kind)
type RawAttachmentKind = ReturnType<typeof getRawAttachmentKind>
const attachmentKinds = Object.keys(attachmentTypes) as AttachmentKind[]
const attachmentContentKinds: Partial<Record<AttachmentKind, ContentCardKind>> = {
  archive: 'video',
  column: 'column',
  pgc: 'bangumi',
}

const dynamicTypeLabels: Partial<Record<string, string>> = {
  DYNAMIC_TYPE_AV: attachmentTypes.archive.label,
  DYNAMIC_TYPE_PGC: attachmentTypes.pgc.label,
  DYNAMIC_TYPE_ARTICLE: attachmentTypes.column.label,
  DYNAMIC_TYPE_MUSIC: attachmentTypes.music.label,
  DYNAMIC_TYPE_LIVE: attachmentTypes.live.label,
  DYNAMIC_TYPE_LIVE_RCMD: attachmentTypes.live.label,
  DYNAMIC_TYPE_COURSES_SEASON: attachmentTypes.courses.label,
  DYNAMIC_TYPE_COURSES_BATCH: attachmentTypes.courses.label,
  DYNAMIC_TYPE_UGC_SEASON: attachmentTypes.ugc_season.label,
  DYNAMIC_TYPE_MEDIALIST: attachmentTypes.medialist.label,
  DYNAMIC_TYPE_COMMON_SQUARE: attachmentTypes.common.label,
  DYNAMIC_TYPE_COMMON_VERTICAL: attachmentTypes.common.label,
  DYNAMIC_TYPE_OPUS: attachmentTypes.opus.label,
  DYNAMIC_TYPE_DRAW: '图文',
  DYNAMIC_TYPE_WORD: '文字',
  DYNAMIC_TYPE_FORWARD: '转发',
}

interface RawText {
  text?: string
  rich_text_nodes?: { type?: string; text?: string; orig_text?: string; jump_url?: string }[]
}

export interface RawDynamicTopics {
  desc?: RawText
  topic?: { name?: string; jump_url?: string } | null
}

interface RawParagraph {
  text?: { nodes?: { word?: { words?: string }; rich?: { orig_text?: string } }[] }
}

interface RawStat {
  count?: number
  status?: boolean
  hidden?: boolean
  disabled?: boolean
  forbidden?: boolean
  silent?: boolean
}

export interface RawDynamicStats {
  like?: RawStat | null
  comment?: RawStat | null
  forward?: RawStat | null
  coin?: RawStat | null
  favorite?: RawStat | null
}

interface RawPostModules {
  module_author?: {
    mid?: number
    name?: string
    face?: string
    pub_ts?: number
    jump_url?: string
    type?: string
  }
  module_dynamic?: RawDynamicTopics & {
    paragraphs?: RawParagraph[]
    additional?: { type?: string }
    major?: Partial<Record<RawAttachmentKind, RawAttachment>> & {
      type?: string
      archive?: RawAttachment & { aid?: number | string; duration_text?: string }
      pgc?: RawAttachment & { epid?: number | string; media_id?: number | string }
      draw?: { items?: RawImage[] }
      opus?: RawAttachment & { summary?: RawText; pics?: RawImage[] }
    }
  }
  module_stat?: RawDynamicStats
}

export interface RawDynamicPost {
  id_str: string
  type?: string
  modules?: RawPostModules | Record<string, unknown>[]
  orig?: RawDynamicPost
}

export interface DynamicPost {
  id: string
  url: string
  author: { id?: number; name?: string; avatar?: string; url?: string }
  publishedAt?: Date
  text?: string
  images: { url: string; width?: number; height?: number }[]
  attachment?: ContentCardData & {
    type: (typeof attachmentTypes)[AttachmentKind]
    url: string
  }
  stats?: {
    like?: { count?: number; liked?: boolean; canToggle: boolean }
    comments?: number
    reposts?: number
    coins?: number
    favorites?: number
  }
  showOriginalLink: boolean
  originalLinkTypeLabel?: string
}

export interface DynamicLikeState {
  liked?: boolean
  pending: boolean
}

export interface DynamicEntry extends DynamicPost {
  original?: DynamicPost
}

export interface DynamicFeedCard {
  post: DynamicPost
  original?: DynamicPost
  reposters: Pick<DynamicPost, 'id' | 'url' | 'author'>[]
}

export const hasDynamicStats = (stats: DynamicPost['stats']) =>
  stats?.like?.canToggle ||
  stats?.like?.count !== undefined ||
  stats?.comments !== undefined ||
  stats?.reposts !== undefined ||
  stats?.coins !== undefined ||
  stats?.favorites !== undefined

export const getDynamicTopics = (content?: RawDynamicTopics): ContentCardData['topics'] => {
  const topics = new Map<string, string | undefined>()
  const addTopic = (text?: string, url?: string) => {
    const name = text?.trim().replace(/^#|#$/g, '').trim()
    if (name && !topics.get(name)) {
      topics.set(name, getWebUrl(url))
    }
  }
  addTopic(content?.topic?.name, content?.topic?.jump_url)
  for (const node of content?.desc?.rich_text_nodes ?? []) {
    if (node.type === 'RICH_TEXT_NODE_TYPE_TOPIC') {
      addTopic(node.text ?? node.orig_text, node.jump_url)
    }
  }
  return Array.from(topics, ([name, url], id) => ({ id, name, url }))
}

const getBangumiAuthorUrl = (
  author?: RawPostModules['module_author'],
  mediaId?: number | string,
) => {
  const linkedMediaId = author?.jump_url?.match(
    /^(?:https?:)?\/\/(?:www\.)?bilibili\.com\/bangumi\/media\/md(\d+)(?:[/?#]|$)/i,
  )?.[1]
  const authorMediaId = !author?.type || author.type === 'AUTHOR_TYPE_PGC' ? author?.mid : undefined
  const id = [linkedMediaId, mediaId, authorMediaId]
    .map(Number)
    .find(value => Number.isSafeInteger(value) && value > 0)
  return id ? getBangumiMediaUrl(id) : undefined
}

const bilibiliImageUrl = /^(?:https?:)?\/\/(?:[\w-]+\.)?(?:hdslb|biliimg)\.com\/bfs\/[^?#]+$/i
const getBilibiliImage = (url: string) =>
  bilibiliImageUrl.test(url) ? retrieveImageUrl(url) : null

export const getDynamicThumbnailSet = (url: string, width: number) => {
  const image = getBilibiliImage(url)
  if (image && /^\.(?:jpe?g|png|webp)$/i.test(image.extension)) {
    return getDpiSourceSet(image.url, { width }, 'webp')
  }
  return undefined
}

export const useOriginalDynamicImage = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement
  image.removeAttribute('srcset')
}

const getText = (value?: RawText) => {
  return (
    value?.text?.trim() ||
    value?.rich_text_nodes?.map(node => node.text || node.orig_text || '').join('')
  )
}

const getVisibleCount = (stat?: RawStat | null) =>
  !stat?.hidden && Number.isFinite(stat?.count) && stat.count >= 0 ? stat.count : undefined

const formatMediaCount = (count?: string | number) => {
  const value = typeof count === 'string' ? count.trim() : count
  if (value == null || (typeof value === 'string' && !/^\d+(?:\.\d+)?[万亿]?$/.test(value))) {
    return undefined
  }
  const number = parseCount(value)
  return Number.isFinite(number) && number >= 0 ? formatCount(number) : undefined
}

export const getDynamicMediaCounts = ({ stat, stat_hidden: hidden }: RawMediaWithStats) =>
  hidden
    ? {}
    : { playCount: formatMediaCount(stat?.play), danmakuCount: formatMediaCount(stat?.danmaku) }

export const getDynamicStats = (module?: RawDynamicStats): DynamicPost['stats'] => {
  if (!module) {
    return undefined
  }
  const { like, comment, forward, coin, favorite } = module
  const likes = getVisibleCount(like)
  const likeDisabled = like?.hidden || like?.disabled || like?.forbidden || like?.silent
  const canToggle = typeof like?.status === 'boolean' && !likeDisabled
  const likeStats =
    likes !== undefined || canToggle || likeDisabled
      ? { count: likes, liked: like.status, canToggle }
      : undefined
  const stats = {
    like: likeStats,
    comments: getVisibleCount(comment),
    reposts: getVisibleCount(forward),
    coins: getVisibleCount(coin),
    favorites: getVisibleCount(favorite),
  }
  return likeStats || hasDynamicStats(stats) ? stats : undefined
}

const getParagraph = (value: RawParagraph) =>
  value.text?.nodes?.map(node => node.word?.words || node.rich?.orig_text || '').join('')

const getMajorTypeLabel = (major?: NonNullable<RawPostModules['module_dynamic']>['major']) => {
  if (major?.type === 'MAJOR_TYPE_LIVE_RCMD') {
    return attachmentTypes.live.label
  }
  if (major?.draw || major?.type === 'MAJOR_TYPE_DRAW') {
    return dynamicTypeLabels.DYNAMIC_TYPE_DRAW
  }
  const kind = attachmentKinds.find(key => {
    const rawKey = getRawAttachmentKind(key)
    return major?.[rawKey] || major?.type === `MAJOR_TYPE_${rawKey.toUpperCase()}`
  })
  return kind ? attachmentTypes[kind].label : undefined
}

export const toDynamicPost = (item: RawDynamicPost): DynamicPost => {
  const modules: RawPostModules = Array.isArray(item.modules)
    ? normalizeFeedsCardModules(item.modules)
    : item.modules
  const author = modules?.module_author
  const content = modules?.module_dynamic
  const major = content?.major
  const opusText = getText(major?.opus?.summary)
  const paragraphs = content?.paragraphs
    ?.map(getParagraph)
    .filter(paragraph => paragraph?.trim())
    .join('\n\n')
  const textBlocks = [getText(content?.desc), opusText, paragraphs].filter(block => block?.trim())
  const text = lodash.uniqBy(textBlocks, block => block.trim()).join('\n\n')
  const url = getDynamicUrl(item.id_str)
  const mediaKind = attachmentKinds.find(kind => major?.[getRawAttachmentKind(kind)]?.title)
  const media = mediaKind ? major[getRawAttachmentKind(mediaKind)] : undefined
  const attachmentKind =
    mediaKind === 'opus' && item.type === 'DYNAMIC_TYPE_ARTICLE' ? 'column' : mediaKind
  const archive = mediaKind === 'archive' ? major.archive : undefined
  const aid = Number(archive?.aid)
  const episodeId = mediaKind === 'pgc' ? Number(major.pgc.epid) : undefined
  const authorUrl =
    mediaKind === 'pgc' || item.type === 'DYNAMIC_TYPE_PGC'
      ? getBangumiAuthorUrl(author, major?.pgc?.media_id)
      : undefined
  const coverUrl = getWebUrl(media?.cover) ?? getWebUrl(media?.covers?.[0])
  const reads =
    attachmentKind === 'column' && !media?.stat_hidden
      ? media?.label?.trim().match(/^(.+?)\s*阅读$/)?.[1]
      : undefined
  const attachment: DynamicPost['attachment'] = media && {
    kind: attachmentContentKinds[attachmentKind] ?? 'other',
    type: attachmentTypes[attachmentKind],
    url:
      getWebUrl(media.jump_url) ??
      (Number.isSafeInteger(episodeId) && episodeId > 0 ? getBangumiEpisodeUrl(episodeId) : url),
    title: media.title,
    coverUrl,
    coverSrcset: coverUrl ? getDynamicThumbnailSet(coverUrl, 480) : undefined,
    description: media.desc,
    topics: getDynamicTopics(content),
    aid: Number.isSafeInteger(aid) && aid > 0 ? aid : undefined,
    durationText: archive?.duration_text?.trim(),
    ...getDynamicMediaCounts(media),
    readCount: formatMediaCount(reads),
  }
  const images = (major?.opus?.pics ?? major?.draw?.items ?? []).flatMap(image => {
    const imageUrl = getWebUrl(image.url ?? image.src)
    if (!imageUrl) {
      return []
    }
    return [
      {
        url: getBilibiliImage(imageUrl)?.url ?? imageUrl,
        width: image.width,
        height: image.height,
      },
    ]
  })
  const additionalType = content?.additional?.type
  const hasAdditionalContent = Boolean(additionalType && additionalType !== 'ADDITIONAL_TYPE_NONE')
  const hasUnrenderedParagraphs = content?.paragraphs?.some(paragraph => !paragraph.text)
  const hasMajorPreview = Boolean(media || images.length || opusText?.trim())
  const hasPreview = Boolean(text || hasMajorPreview || item.orig?.id_str)
  const showOriginalLink =
    !hasPreview ||
    hasAdditionalContent ||
    hasUnrenderedParagraphs ||
    (Boolean(major) && !hasMajorPreview)
  const originalLinkTypeLabel = showOriginalLink
    ? attachment?.type.label ?? dynamicTypeLabels[item.type ?? ''] ?? getMajorTypeLabel(major)
    : undefined

  return {
    id: item.id_str,
    url,
    author: {
      id: author?.mid,
      name: author?.name,
      avatar: getWebUrl(author?.face),
      url: authorUrl,
    },
    publishedAt: author?.pub_ts > 0 ? new Date(author.pub_ts * 1000) : undefined,
    text,
    images,
    attachment,
    stats: getDynamicStats(modules?.module_stat),
    showOriginalLink,
    originalLinkTypeLabel,
  }
}
