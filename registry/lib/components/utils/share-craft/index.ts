import type { OptionsOfMetadata } from '@/components/define'
import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import type { ComponentEntry } from '@/components/types'
import { VideoInfo } from '@/components/video/video-info'
import { urlChange } from '@/core/observer'
import type { ComponentSettings } from '@/core/settings/types'
import { Toast } from '@/core/toast'
import { formatCount, formatDuration } from '@/core/utils/formatters'
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

type Options = OptionsOfMetadata<typeof options>
type ShareSettings = ComponentSettings<Options>

interface VideoId {
  bvid?: string
  aid?: string
}

interface ShareFields {
  [key: string]: string
}

interface SharePayload {
  text: string
  /** 与 text 相同, 但把 {cover_image} 换成了占位符, 供富文本插入图片 */
  html: string
  coverUrl: string
}

/** 富文本里标记封面图位置的控制字符, 不会出现在正常文案中 */
const coverMarker = '\u0001'

const cacheTtl = 10 * 60 * 1000
const cacheLimit = 50

/**
 * 视频页的分享入口. 视频下方工具栏的分享按钮点击后直接复制链接,
 * 旧版工具栏和播放器控制栏使用另外两套类名.
 */
const shareEntrySelector = [
  '.video-share',
  '.video-toolbar-v1 .share-wrap',
  '.player-left-components [class*="toolbar_share_info"]',
].join(', ')

const infoCache = new Map<string, { info: VideoInfo; time: number }>()
const pendingRequests = new Map<string, Promise<VideoInfo | null>>()

const cacheKeyOf = (id: VideoId) => id.bvid ?? `av${id.aid}`

const getCurrentVideoId = (): VideoId | null => {
  const match = location.pathname.match(/\/video\/(BV[0-9A-Za-z]{10})/)
  if (match) {
    return { bvid: match[1] }
  }
  const aidMatch = location.pathname.match(/\/video\/av(\d+)/i)
  if (aidMatch) {
    return { aid: aidMatch[1] }
  }
  return null
}

const getCurrentPageNumber = (info: VideoInfo) => {
  const page = Number(new URLSearchParams(location.search).get('p'))
  if (!Number.isInteger(page) || page < 1) {
    return 1
  }
  if (info.pages?.length && !info.pages.some(it => it.pageNumber === page)) {
    return 1
  }
  return page
}

const getCachedInfo = (id: VideoId) => {
  const key = cacheKeyOf(id)
  const cached = infoCache.get(key)
  if (!cached) {
    return null
  }
  if (Date.now() - cached.time > cacheTtl) {
    infoCache.delete(key)
    return null
  }
  return cached.info
}

const storeInfo = (info: VideoInfo) => {
  if (infoCache.size >= cacheLimit) {
    const oldestKey = infoCache.keys().next().value
    if (oldestKey !== undefined) {
      infoCache.delete(oldestKey)
    }
  }
  const entry = { info, time: Date.now() }
  infoCache.set(info.bvid ?? `av${info.aid}`, entry)
  if (info.aid) {
    infoCache.set(`av${info.aid}`, entry)
  }
}

const fetchInfo = async (id: VideoId) => {
  const key = cacheKeyOf(id)
  const pending = pendingRequests.get(key)
  if (pending) {
    return pending
  }
  const request = (async () => {
    try {
      const info = id.bvid ? new VideoInfo(id.bvid, true) : new VideoInfo(id.aid)
      await info.fetchInfo()
      storeInfo(info)
      return info
    } catch (error) {
      console.warn('[分享文案定制] 获取视频信息失败', error)
      return null
    } finally {
      pendingRequests.delete(key)
    }
  })()
  pendingRequests.set(key, request)
  return request
}

const pad = (value: number) => value.toString().padStart(2, '0')

const formatDateText = (timestamp: number, mode: DateFormat) => {
  if (!timestamp) {
    return ''
  }
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
  if (!seconds) {
    return ''
  }
  if (mode === DurationFormat.Text) {
    const hour = Math.trunc(seconds / 3600)
    const minute = Math.trunc(seconds / 60) % 60
    const second = Math.round(seconds % 60)
    const parts = [`${minute}分`]
    if (second > 0) {
      parts.push(`${second}秒`)
    }
    return `${hour > 0 ? `${hour}小时` : ''}${parts.join('')}`
  }
  return formatDuration(seconds)
}

const formatCountText = (count: number, mode: CountFormat) => {
  if (typeof count !== 'number' || Number.isNaN(count)) {
    return ''
  }
  if (mode === CountFormat.Raw) {
    return count.toString()
  }
  return formatCount(count)
}

const truncate = (text: string, length: number) => {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (length <= 0 || normalized.length <= length) {
    return normalized
  }
  return `${normalized.slice(0, length)}…`
}

const buildFields = (info: VideoInfo, settings: ShareSettings, pageNumber: number): ShareFields => {
  const { options: userOptions } = settings
  const page = info.pages?.find(it => it.pageNumber === pageNumber) ?? info.pages?.[0]
  const duration = page?.duration ?? 0
  const baseUrl = `https://www.bilibili.com/video/${info.bvid || `av${info.aid}`}`
  const url = pageNumber > 1 ? `${baseUrl}?p=${pageNumber}` : baseUrl
  // b23.tv 在 302 跳转时会丢掉 query, 多 P 只能用带 ?p= 的长链
  const shortUrl = info.bvid && pageNumber === 1 ? `https://b23.tv/${info.bvid}` : url
  return {
    title: info.title ?? '',
    up: info.up?.name ?? '',
    uid: info.up?.uid?.toString() ?? '',
    up_url: info.up?.uid ? `https://space.bilibili.com/${info.up.uid}` : '',
    bv: info.bvid ?? '',
    av: info.aid ? `av${info.aid}` : '',
    aid: info.aid ?? '',
    url,
    short_url: shortUrl,
    date: formatDateText(info.pubdate, userOptions.dateFormat),
    duration: formatDurationText(duration, userOptions.durationFormat),
    views: formatCountText(info.stat?.view, userOptions.countFormat),
    danmaku: formatCountText(info.stat?.danmaku, userOptions.countFormat),
    likes: formatCountText(info.stat?.like, userOptions.countFormat),
    coins: formatCountText(info.stat?.coin, userOptions.countFormat),
    favorites: formatCountText(info.stat?.favorite, userOptions.countFormat),
    replies: formatCountText(info.stat?.reply, userOptions.countFormat),
    shares: formatCountText(info.stat?.share, userOptions.countFormat),
    tname: info.tagName ?? '',
    part: page?.title ?? '',
    p: pageNumber.toString(),
    page_count: info.pageCount?.toString() ?? '',
    desc: truncate(info.description ?? '', userOptions.descLength),
    cover: info.coverUrl ?? '',
    cover_image: '',
  }
}

const renderTemplate = (template: string, fields: ShareFields) =>
  template.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (raw, key: string) =>
    key in fields ? fields[key] : raw,
  )

/** 稳定版 2.12 还没有 Toast.warn, 这里做一下兼容 */
const showTemplateWarning = (message: string) => {
  const show = Toast.warn ?? Toast.error ?? Toast.show
  show.call(Toast, message, '分享文案定制', 3000)
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
  pageNumber: number,
): SharePayload => {
  const fields = buildFields(info, settings, pageNumber)
  // {cover_image} 独占一行时, 纯文本里不该留下空行
  const textTemplate = template.replace(/^[ \t]*\{cover_image\}[ \t]*\r?\n/gm, '')
  const rendered = renderTemplate(textTemplate, fields).trim()
  return {
    text: rendered || fields.url,
    html: renderTemplate(template, { ...fields, cover_image: coverMarker }).trim(),
    coverUrl: info.coverUrl ?? '',
  }
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const coverSpan = (text: string) =>
  `<span class="text-element text-element--other" style="font-size: 18px; font-weight: 400; font-family: &quot;PingFang SC&quot;, &quot;Microsoft YaHei&quot;, sans-serif;">${text}</span>`

/**
 * QQ 的富文本粘贴只认自己那套 <span class="text-element"> + <img data-role="pic"> 结构,
 * 图片必须是网络链接; 换成 div 或 data URI 都会导致 QQ 整次粘贴失败
 */
const buildShareHtml = (source: string, imageUrl: string, size: CoverSize) => {
  const image = `<img class="kbWr9sfB9IRWrYy32v0K" src="${imageUrl}" data-role="pic" data-path="${imageUrl}" data-pic-sub-type="0" loading="eager" style="width: ${size.width}px; height: ${size.height}px; object-fit: cover;">`
  const renderText = (text: string) => coverSpan(escapeHtml(text).replace(/\r?\n/g, '<br>'))
  // 只保留两段文本 + 一张图, 跟 QQ 能接受的简单结构一致;
  // 先把 marker 两侧的换行去掉, 图片就不会前后各顶出一个空行
  const normalized = [
    `\r\n${coverMarker}`,
    `\n${coverMarker}`,
    `${coverMarker}\r\n`,
    `${coverMarker}\n`,
  ].reduce((text, pattern) => text.split(pattern).join(coverMarker), source)
  const segments = normalized.split(coverMarker)
  let html = segments[0] ? renderText(segments[0]) : ''
  for (const segment of segments.slice(1)) {
    html += `<br>${image}`
    if (segment) {
      html += `<br>${renderText(segment)}`
    }
  }
  return html
}

const showCopiedToast = (settings: ShareSettings, withCover: boolean) => {
  if (!settings.options.showToast) {
    return
  }
  Toast.success(withCover ? '已复制分享文案和封面图' : '已复制分享文案', '分享文案定制', 2000)
}

const fallbackText = (id: VideoId) => {
  const path = id.bvid || `av${id.aid}`
  const page = new URLSearchParams(location.search).get('p')
  return `https://www.bilibili.com/video/${path}${page && page !== '1' ? `?p=${page}` : ''}`
}

const writeSharePayload = async (payload: SharePayload, settings: ShareSettings) => {
  const { clipboard } = navigator
  if (!clipboard) {
    console.warn('[分享文案定制] 当前环境没有剪贴板接口')
    return
  }
  const Item = typeof ClipboardItem === 'undefined' ? unsafeWindow.ClipboardItem : ClipboardItem
  const hasCover = payload.coverUrl !== '' && payload.html.includes(coverMarker)
  if (hasCover && clipboard.write && Item) {
    const maxWidth = settings.options.coverWidth
    const imageUrl = coverImageUrl(payload.coverUrl, maxWidth)
    const size = getCoverSize(imageUrl, maxWidth).then(
      value => value ?? { width: maxWidth, height: Math.round((maxWidth * 9) / 16) },
    )
    try {
      // ClipboardItem 必须在用户手势里同步构造, 图片尺寸用 promise 延迟解析
      await clipboard.write([
        new Item({
          'text/plain': new Blob([payload.text], { type: 'text/plain' }),
          'text/html': size.then(
            value =>
              new Blob([buildShareHtml(payload.html, imageUrl, value)], {
                type: 'text/html',
              }),
          ),
        }),
      ])
      showCopiedToast(settings, true)
      return
    } catch (error) {
      console.warn('[分享文案定制] 写入封面失败, 回退为纯文本', error)
    }
  }
  await clipboard.writeText(payload.text)
  showCopiedToast(settings, false)
}

const copyPlainText = async (text: string, settings: ShareSettings) => {
  await navigator.clipboard.writeText(text)
  showCopiedToast(settings, false)
}

const copyCurrentVideo = async (id: VideoId, template: string, settings: ShareSettings) => {
  const info = getCachedInfo(id) ?? (await fetchInfo(id))
  if (!info) {
    await copyPlainText(fallbackText(id), settings)
    return
  }
  const payload = createSharePayload(info, template, settings, getCurrentPageNumber(info))
  await writeSharePayload(payload, settings)
}

const handleShareClick = (event: MouseEvent, settings: ShareSettings) => {
  if (event.button !== 0) {
    return
  }
  const { target } = event
  if (!(target instanceof Element)) {
    return
  }
  // 悬停面板里的按钮保持原生行为, 只有直接点击分享按钮才复制模板文案
  if (target.closest('.video-share-popover, .video-share-dropdown')) {
    return
  }
  if (!target.closest(shareEntrySelector)) {
    return
  }
  // 分享入口的点击一律由这里接管, 不保留任何回退到原生复制的路径
  event.preventDefault()
  event.stopPropagation()
  const id = getCurrentVideoId()
  if (!id) {
    copyPlainText(location.href.replace(location.hash, ''), settings).catch(error => {
      console.warn('[分享文案定制] 复制页面链接失败', error)
    })
    return
  }
  const template = resolveTemplate(settings)
  const unknown = findUnknownVariables(template)
  if (unknown.length > 0) {
    showTemplateWarning(`模板包含未知变量: ${unknown.map(name => `{${name}}`).join(', ')}`)
    copyPlainText(fallbackText(id), settings).catch(error => {
      console.warn('[分享文案定制] 复制视频链接失败', error)
    })
    return
  }
  copyCurrentVideo(id, template, settings).catch(error => {
    console.warn('[分享文案定制] 复制分享文案失败', error)
  })
}

const prefetchVideo = (settings: ShareSettings) => {
  const id = getCurrentVideoId()
  if (!id) {
    return
  }
  fetchInfo(id).then(info => {
    if (!info || !resolveTemplate(settings).includes('{cover_image}')) {
      return
    }
    const maxWidth = settings.options.coverWidth
    getCoverSize(coverImageUrl(info.coverUrl, maxWidth), maxWidth)
  })
}

const install = (settings: ShareSettings) => {
  const controller = new AbortController()
  const onClick = (event: MouseEvent) => handleShareClick(event, settings)
  document.addEventListener('click', onClick, true)
  urlChange(() => prefetchVideo(settings), { signal: controller.signal })
  return () => {
    controller.abort()
    document.removeEventListener('click', onClick, true)
  }
}

let uninstall: (() => void) | null = null
let currentSettings: ShareSettings | null = null

const entry: ComponentEntry<Options> = ({ settings }) => {
  currentSettings = settings
  uninstall?.()
  uninstall = install(settings)
}

const extraOptions = () =>
  import('./extra-options/SettingsPanel.vue').then(module => module.default)

export const component = defineComponentMetadata({
  name: 'shareCraft',
  displayName: '分享文案定制',
  author: [
    { name: 'HermosMerlin', link: 'https://github.com/HermosMerlin' },
    { name: 'DeepSeek', link: 'https://www.deepseek.com' },
  ],
  tags: [componentsTags.utils],
  urlInclude: videoUrls,
  instantStyles: [
    {
      name: 'hideSharePanel',
      style: () => import('./hide-share-panel.scss'),
    },
  ],
  options,
  extraOptions,
  entry,
  reload: () => {
    if (currentSettings) {
      uninstall?.()
      uninstall = install(currentSettings)
    }
  },
  unload: () => {
    uninstall?.()
    uninstall = null
  },
})
