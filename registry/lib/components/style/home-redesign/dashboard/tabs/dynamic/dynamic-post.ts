import { normalizeFeedsCardModules } from '@/components/feeds/api'
import { getDpiSourceSet, retrieveImageUrl } from '@/core/utils'

interface RawImage {
  src?: string
  url?: string
  width?: number
  height?: number
}

interface RawAttachment {
  title?: string
  desc?: string
  cover?: string
  covers?: string[]
  jump_url?: string
}

const attachmentTypes = {
  archive: { icon: 'mdi-play-box-outline', label: '视频' },
  pgc: { icon: 'mdi-television-play', label: '番剧' },
  article: { icon: 'mdi-file-document-outline', label: '专栏' },
  music: { icon: 'mdi-music-note', label: '音频' },
  live: { icon: 'mdi-video-outline', label: '直播' },
  courses: { icon: 'mdi-school-outline', label: '课程' },
  ugc_season: { icon: 'mdi-playlist-play', label: '合集' },
  medialist: { icon: 'mdi-playlist-play', label: '收藏夹' },
  common: { icon: 'mdi-link-variant', label: '分享' },
  opus: { icon: 'mdi-text-box-outline', label: '图文' },
}

type AttachmentKind = keyof typeof attachmentTypes
const attachmentKinds = Object.keys(attachmentTypes) as AttachmentKind[]

const dynamicTypeLabels: Partial<Record<string, string>> = {
  DYNAMIC_TYPE_AV: attachmentTypes.archive.label,
  DYNAMIC_TYPE_PGC: attachmentTypes.pgc.label,
  DYNAMIC_TYPE_ARTICLE: attachmentTypes.article.label,
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
  rich_text_nodes?: { text?: string; orig_text?: string }[]
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

interface RawPostModules {
  module_author?: {
    mid?: number
    name?: string
    face?: string
    pub_ts?: number
  }
  module_dynamic?: {
    desc?: RawText
    paragraphs?: RawParagraph[]
    additional?: { type?: string }
    major?: Partial<Record<AttachmentKind, RawAttachment>> & {
      type?: string
      draw?: { items?: RawImage[] }
      opus?: RawAttachment & { summary?: RawText; pics?: RawImage[] }
    }
  }
  module_stat?: { like?: RawStat; comment?: RawStat; forward?: RawStat }
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
  author: { id?: number; name?: string; avatar?: string }
  publishedAt?: Date
  text?: string
  images: { url: string; width?: number; height?: number }[]
  attachment?: {
    type: (typeof attachmentTypes)[AttachmentKind]
    url: string
    title: string
    cover?: string
    description?: string
  }
  stats?: {
    like?: { count?: number; liked?: boolean; canToggle: boolean }
    comments?: number
    reposts?: number
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

const webUrl = (url?: string) => (/^(?:https?:)?\/\//i.test(url ?? '') ? url : undefined)

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

const getText = (value?: RawText) => {
  return (
    value?.text?.trim() ||
    value?.rich_text_nodes?.map(node => node.text || node.orig_text || '').join('')
  )
}

const getVisibleCount = (stat?: RawStat) =>
  stat?.hidden || typeof stat?.count !== 'number' ? undefined : stat.count

const getDynamicStats = (module?: RawPostModules['module_stat']): DynamicPost['stats'] => {
  if (!module) {
    return undefined
  }
  const { like, comment, forward } = module
  const likes = getVisibleCount(like)
  const likeDisabled = like?.hidden || like?.disabled || like?.forbidden || like?.silent
  const canToggle = typeof like?.status === 'boolean' && !likeDisabled
  const likeStats =
    likes !== undefined || canToggle || likeDisabled
      ? { count: likes, liked: like.status, canToggle }
      : undefined
  const comments = getVisibleCount(comment)
  const reposts = getVisibleCount(forward)
  if (likeStats || comments !== undefined || reposts !== undefined) {
    return { like: likeStats, comments, reposts }
  }
  return undefined
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
  const kind = attachmentKinds.find(
    key => major?.[key] || major?.type === `MAJOR_TYPE_${key.toUpperCase()}`,
  )
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
  const url = `https://t.bilibili.com/${item.id_str}`
  const mediaKind = attachmentKinds.find(kind => major?.[kind]?.title)
  const media = mediaKind ? major[mediaKind] : undefined
  const attachmentKind =
    mediaKind === 'opus' && item.type === 'DYNAMIC_TYPE_ARTICLE' ? 'article' : mediaKind
  const attachment = media && {
    type: attachmentTypes[attachmentKind],
    url: webUrl(media.jump_url) ?? url,
    title: media.title,
    cover: webUrl(media.cover ?? media.covers?.[0]),
    description: media.desc,
  }
  const images = (major?.opus?.pics ?? major?.draw?.items ?? []).flatMap(image => {
    const imageUrl = webUrl(image.url ?? image.src)
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
    author: { id: author?.mid, name: author?.name, avatar: webUrl(author?.face) },
    publishedAt: author?.pub_ts > 0 ? new Date(author.pub_ts * 1000) : undefined,
    text,
    images,
    attachment,
    stats: getDynamicStats(modules?.module_stat),
    showOriginalLink,
    originalLinkTypeLabel,
  }
}
