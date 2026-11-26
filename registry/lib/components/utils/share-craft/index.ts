import type { OptionsOfMetadata } from '@/components/define'
import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import type { ComponentEntry } from '@/components/types'
import { VideoInfo } from '@/components/video/video-info'
import { videoChange } from '@/core/observer'
import type { ComponentSettings } from '@/core/settings/types'
import { Toast } from '@/core/toast'
import { formatCount, formatDuration } from '@/core/utils/formatters'
import { useScopedConsole } from '@/core/utils/log'
import { videoUrls } from '@/core/utils/urls'
import { coverImageUrl, getCoverSize } from './cover'
import type { CoverSize } from './cover'
import {
  CountFormat,
  DateFormat,
  DurationFormat,
  Preset,
  defaultTemplate,
  findUnknownVariables,
  presetTemplates,
  renderTemplate,
} from './templates'

const options = defineOptionsMetadata({
  preset: {
    defaultValue: Preset.Standard,
    displayName: '分享模板预设',
    dropdownEnum: Preset,
    hidden: true,
  },
  customTemplate: {
    defaultValue: defaultTemplate,
    displayName: '自定义模板（预设选择「自定义」时生效）',
    hidden: true,
  },
  dateFormat: {
    defaultValue: DateFormat.Iso,
    displayName: '日期格式',
    dropdownEnum: DateFormat,
    hidden: true,
  },
  durationFormat: {
    defaultValue: DurationFormat.Clock,
    displayName: '时长格式',
    dropdownEnum: DurationFormat,
    hidden: true,
  },
  countFormat: {
    defaultValue: CountFormat.Short,
    displayName: '播放 / 点赞等数字格式',
    dropdownEnum: CountFormat,
    hidden: true,
  },
  descLength: {
    defaultValue: 80,
    displayName: '简介最大长度（0 为不截断）',
    slider: { min: 0, max: 200, step: 10 },
    hidden: true,
  },
  showToast: {
    defaultValue: true,
    displayName: '复制后显示提示',
    hidden: true,
  },
  coverWidth: {
    defaultValue: 720,
    displayName: '封面图最大宽度（px）',
    slider: { min: 320, max: 1280, step: 80 },
    hidden: true,
  },
})

export type ShareCraftOptions = OptionsOfMetadata<typeof options>
type ShareSettings = ComponentSettings<ShareCraftOptions>

interface CurrentVideo {
  aid: string
  cid: string
}

interface SharePayload {
  text: string
  /** 与 text 相同, 但 {cover_image} 被替换为 coverMarker, 供富文本插入图片 */
  html: string
  coverUrl: string
}

const console = useScopedConsole('分享文案定制')

/** 富文本里标记封面图位置, 使用 Unicode 的对象替换字符 (U+FFFC) */
const coverMarker = '\uFFFC'

/** 新版工具栏、旧版工具栏、播放器控制栏的分享按钮 */
const shareEntrySelector = [
  '.video-share',
  '.video-toolbar-v1 .share-wrap',
  '.player-left-components [class*="toolbar_share_info"]',
].join(', ')

let currentVideo: CurrentVideo | null = null
let videoInfo: { aid: string; request: Promise<VideoInfo | null> } | null = null

/** 只保留当前视频的信息, 请求失败时清除, 下次点击会重新请求 */
const loadVideoInfo = (aid: string) => {
  if (videoInfo?.aid === aid) {
    return videoInfo.request
  }
  const request = new VideoInfo(aid).fetchInfo().catch(error => {
    console.warn('获取视频信息失败', error)
    if (videoInfo?.aid === aid) {
      videoInfo = null
    }
    return null
  })
  videoInfo = { aid, request }
  return request
}

const pad = (value: number) => value.toString().padStart(2, '0')

const formatDateText = (timestamp: number, mode: DateFormat) => {
  const date = new Date(timestamp * 1000)
  if (mode === DateFormat.Chinese) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }
  if (mode === DateFormat.Relative) {
    const diffDays = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000))
    if (diffDays <= 0) {
      return '今天'
    }
    if (diffDays === 1) {
      return '昨天'
    }
    if (diffDays < 30) {
      return `${diffDays}天前`
    }
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const formatDurationText = (seconds: number, mode: DurationFormat) => {
  if (mode === DurationFormat.Clock) {
    return formatDuration(seconds)
  }
  const hour = Math.floor(seconds / 3600)
  const minute = Math.floor(seconds / 60) % 60
  const second = seconds % 60
  return [hour > 0 && `${hour}小时`, `${minute}分`, second > 0 && `${second}秒`]
    .filter(Boolean)
    .join('')
}

const formatCountText = (count: number, mode: CountFormat) =>
  mode === CountFormat.Raw ? count.toString() : formatCount(count)

const truncate = (text: string, length: number) => {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (length <= 0 || normalized.length <= length) {
    return normalized
  }
  return `${normalized.slice(0, length)}…`
}

const buildFields = (
  info: VideoInfo,
  settings: ShareSettings,
  cid: string,
): Record<string, string> => {
  const { dateFormat, durationFormat, countFormat, descLength } = settings.options
  const page = info.pages.find(it => it.cid.toString() === cid) ?? info.pages[0]
  const baseUrl = `https://www.bilibili.com/video/${info.bvid}`
  const url = page.pageNumber > 1 ? `${baseUrl}?p=${page.pageNumber}` : baseUrl
  // b23.tv 在 302 跳转时会丢掉 query, 多 P 只能用带 ?p= 的长链
  const shortUrl = page.pageNumber > 1 ? url : `https://b23.tv/${info.bvid}`
  return {
    title: info.title,
    up: info.up.name,
    uid: info.up.uid.toString(),
    up_url: `https://space.bilibili.com/${info.up.uid}`,
    bv: info.bvid,
    av: `av${info.aid}`,
    aid: info.aid.toString(),
    url,
    short_url: shortUrl,
    date: formatDateText(info.pubdate, dateFormat),
    duration: formatDurationText(page.duration, durationFormat),
    views: formatCountText(info.stat.view, countFormat),
    danmaku: formatCountText(info.stat.danmaku, countFormat),
    likes: formatCountText(info.stat.like, countFormat),
    coins: formatCountText(info.stat.coin, countFormat),
    favorites: formatCountText(info.stat.favorite, countFormat),
    replies: formatCountText(info.stat.reply, countFormat),
    shares: formatCountText(info.stat.share, countFormat),
    tname: info.tagName,
    part: page.title,
    p: page.pageNumber.toString(),
    page_count: info.pageCount.toString(),
    desc: truncate(info.description, descLength),
    cover: info.coverUrl,
    cover_image: '',
  }
}

const resolveTemplate = (settings: ShareSettings) => {
  const { preset, customTemplate } = settings.options
  if (preset === Preset.Custom) {
    return customTemplate || defaultTemplate
  }
  return presetTemplates[preset] ?? defaultTemplate
}

const createSharePayload = (
  info: VideoInfo,
  template: string,
  settings: ShareSettings,
  cid: string,
): SharePayload => {
  const fields = buildFields(info, settings, cid)
  // {cover_image} 独占一行时, 纯文本里不该留下空行
  const textTemplate = template.replace(/^[ \t]*\{cover_image\}[ \t]*\r?\n/gm, '')
  return {
    text: renderTemplate(textTemplate, fields).trim() || fields.url,
    html: renderTemplate(template, { ...fields, cover_image: coverMarker }).trim(),
    coverUrl: info.coverUrl,
  }
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * QQ 的富文本粘贴只认自己那套 <span class="text-element"> + <img data-role="pic"> 结构,
 * 图片必须是网络链接; 换成 div 或 data URI 都会导致 QQ 整次粘贴失败
 */
const buildShareHtml = (source: string, imageUrl: string, size: CoverSize) => {
  const image = `<img src="${imageUrl}" data-role="pic" data-path="${imageUrl}" data-pic-sub-type="0" loading="eager" style="width: ${size.width}px; height: ${size.height}px; object-fit: cover;">`
  const textSpan = (text: string) =>
    `<span class="text-element text-element--other" style="font-size: 18px; font-weight: 400; font-family: &quot;PingFang SC&quot;, &quot;Microsoft YaHei&quot;, sans-serif;">${escapeHtml(
      text,
    ).replace(/\r?\n/g, '<br>')}</span>`
  // 图片前后自带 <br>, 去掉 marker 两侧的换行以免多出空行
  const [first, ...rest] = source.replace(/\r?\n?\uFFFC\r?\n?/g, coverMarker).split(coverMarker)
  let html = first ? textSpan(first) : ''
  for (const segment of rest) {
    html += `<br>${image}`
    if (segment) {
      html += `<br>${textSpan(segment)}`
    }
  }
  return html
}

const showCopiedToast = (settings: ShareSettings, withCover: boolean) => {
  if (settings.options.showToast) {
    Toast.success(withCover ? '已复制分享文案和封面图' : '已复制分享文案', '分享文案定制', 2000)
  }
}

const copyPlainText = async (text: string, settings: ShareSettings) => {
  await navigator.clipboard.writeText(text)
  showCopiedToast(settings, false)
}

const writeSharePayload = async (payload: SharePayload, settings: ShareSettings) => {
  if (!payload.coverUrl || !payload.html.includes(coverMarker)) {
    await copyPlainText(payload.text, settings)
    return
  }
  const Item = typeof ClipboardItem === 'undefined' ? unsafeWindow.ClipboardItem : ClipboardItem
  const maxWidth = settings.options.coverWidth
  const imageUrl = coverImageUrl(payload.coverUrl, maxWidth)
  try {
    // 尺寸以 promise 交给 ClipboardItem, 不在写入前等待图片下载, 避免丢失用户激活
    await navigator.clipboard.write([
      new Item({
        'text/plain': new Blob([payload.text], { type: 'text/plain' }),
        'text/html': getCoverSize(imageUrl, maxWidth).then(
          size => new Blob([buildShareHtml(payload.html, imageUrl, size)], { type: 'text/html' }),
        ),
      }),
    ])
    showCopiedToast(settings, true)
  } catch (error) {
    console.warn('写入封面失败, 回退为纯文本', error)
    await copyPlainText(payload.text, settings)
  }
}

const copyCurrentVideo = async (video: CurrentVideo, settings: ShareSettings) => {
  let template = resolveTemplate(settings)
  const unknown = findUnknownVariables(template)
  if (unknown.length > 0) {
    Toast.warn(
      `模板包含未知变量: ${unknown.map(name => `{${name}}`).join(', ')}`,
      '分享文案定制',
      3000,
    )
    template = '{url}'
  }
  const info = await loadVideoInfo(video.aid)
  if (!info) {
    await copyPlainText(`https://www.bilibili.com/video/av${video.aid}`, settings)
    return
  }
  await writeSharePayload(createSharePayload(info, template, settings, video.cid), settings)
}

const handleShareClick = (event: MouseEvent, settings: ShareSettings) => {
  const target = event.target as Element
  // 悬停面板里的按钮保持原生行为; 视频信息就绪前也不接管
  if (
    !currentVideo ||
    target.closest('.video-share-popover, .video-share-dropdown') ||
    !target.closest(shareEntrySelector)
  ) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  copyCurrentVideo(currentVideo, settings).catch(error => {
    console.warn('复制分享文案失败', error)
  })
}

const prefetchVideo = async (aid: string, settings: ShareSettings) => {
  const info = await loadVideoInfo(aid)
  if (info && resolveTemplate(settings).includes('{cover_image}')) {
    const maxWidth = settings.options.coverWidth
    getCoverSize(coverImageUrl(info.coverUrl, maxWidth), maxWidth)
  }
}

let controller: AbortController | null = null
let componentSettings: ShareSettings | null = null

const install = (settings: ShareSettings) => {
  controller = new AbortController()
  const { signal } = controller
  document.addEventListener('click', event => handleShareClick(event, settings), {
    capture: true,
    signal,
  })
  videoChange(
    ({ aid, cid }) => {
      currentVideo = { aid: String(aid), cid: String(cid) }
      prefetchVideo(currentVideo.aid, settings)
    },
    { signal },
  )
}

const uninstall = () => {
  controller?.abort()
  controller = null
  currentVideo = null
}

const entry: ComponentEntry<ShareCraftOptions> = ({ settings }) => {
  componentSettings = settings
  install(settings)
}

export const component = defineComponentMetadata({
  name: 'shareCraft',
  displayName: '分享文案定制',
  author: [
    { name: 'HermosMerlin', link: 'https://github.com/HermosMerlin' },
    { name: 'DeepSeek', link: 'https://www.deepseek.com' },
  ],
  tags: [componentsTags.utils],
  urlInclude: videoUrls,
  options,
  extraOptions: () => import('./extra-options/SettingsPanel.vue').then(m => m.default),
  entry,
  reload: () => {
    uninstall()
    install(componentSettings)
  },
  unload: uninstall,
})
