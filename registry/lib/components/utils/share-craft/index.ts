import type { OptionsOfMetadata } from '@/components/define'
import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import type { ComponentEntry } from '@/components/types'
import { VideoInfo } from '@/components/video/video-info'
import type { ComponentSettings } from '@/core/settings/types'
import { Toast } from '@/core/toast'
import { formatCount, formatDuration } from '@/core/utils/formatters'
import { Preset, defaultTemplate, findUnknownVariables, presetTemplates } from './templates'

enum DateFormat {
  Iso = 'YYYY-MM-DD',
  Chinese = 'YYYY年M月D日',
  Relative = '相对时间',
}

enum DurationFormat {
  Clock = '18:42',
  Text = '18分42秒',
}

enum CountFormat {
  Short = '缩写',
  Raw = '原值',
}

const options = defineOptionsMetadata({
  preset: {
    defaultValue: Preset.Standard,
    displayName: '分享模板预设',
    dropdownEnum: Preset,
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
  },
  durationFormat: {
    defaultValue: DurationFormat.Clock,
    displayName: '时长格式',
    dropdownEnum: DurationFormat,
  },
  countFormat: {
    defaultValue: CountFormat.Short,
    displayName: '播放 / 点赞等数字格式',
    dropdownEnum: CountFormat,
  },
  descLength: {
    defaultValue: 80,
    displayName: '简介最大长度（0 为不截断）',
    slider: { min: 0, max: 200, step: 10 },
  },
  showToast: {
    defaultValue: false,
    displayName: '改写后显示提示',
  },
  prefetchInfo: {
    defaultValue: true,
    displayName: '进入视频页后预取信息（首次复制更快）',
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

const bvidPattern = /(BV[0-9A-Za-z]{10})/
const aidPattern = /\bav(\d+)\b/i
const bilibiliLinkPattern = /(?:bilibili\.com\/video\/|b23\.tv\/|bili2233\.cn\/)/i
const cacheTtl = 10 * 60 * 1000
const cacheLimit = 50

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

const extractVideoId = (text: string): VideoId | null => {
  const bvMatch = text.match(bvidPattern)
  if (bvMatch) {
    return { bvid: bvMatch[1] }
  }
  const avMatch = text.match(aidPattern)
  if (avMatch) {
    return { aid: avMatch[1] }
  }
  // 分享面板有时只复制纯 b23.tv 短链, 此时按当前页面视频处理
  if (bilibiliLinkPattern.test(text)) {
    return getCurrentVideoId()
  }
  return null
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

const getPageNumber = (id: VideoId, info: VideoInfo) => {
  const current = getCurrentVideoId()
  const sameVideo = current?.bvid && info.bvid ? current.bvid === info.bvid : false
  if (!sameVideo) {
    return 1
  }
  const page = Number(new URLSearchParams(location.search).get('p'))
  return Number.isInteger(page) && page > 0 ? page : 1
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
  const baseUrl = `https://www.bilibili.com/video/${info.bvid}`
  const url = pageNumber > 1 ? `${baseUrl}?p=${pageNumber}` : baseUrl
  return {
    title: info.title ?? '',
    up: info.up?.name ?? '',
    uid: info.up?.uid?.toString() ?? '',
    up_url: info.up?.uid ? `https://space.bilibili.com/${info.up.uid}` : '',
    bv: info.bvid ?? '',
    av: info.aid ? `av${info.aid}` : '',
    aid: info.aid ?? '',
    url,
    short_url: info.bvid ? `https://b23.tv/${info.bvid}` : url,
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

const createShareText = async (text: string, settings: ShareSettings) => {
  const trimmed = text.trim()
  if (!trimmed || trimmed.length > 500) {
    return null
  }
  const id = extractVideoId(trimmed)
  if (!id) {
    return null
  }
  const template = resolveTemplate(settings)
  const unknown = findUnknownVariables(template)
  if (unknown.length > 0) {
    showTemplateWarning(
      `模板包含未知变量: ${unknown.map(name => `{${name}}`).join(', ')}，已复制原文`,
    )
    return null
  }
  const info = getCachedInfo(id) ?? (await fetchInfo(id))
  if (!info) {
    return null
  }
  const pageNumber = getPageNumber(id, info)
  const fields = buildFields(info, settings, pageNumber)
  const rendered = renderTemplate(template, fields).trim()
  if (!rendered || rendered === text) {
    return null
  }
  return rendered
}

/** 同步版本, 只使用已有缓存, 用于 `copy` 事件 (execCommand 路径) */
const createShareTextSync = (text: string, settings: ShareSettings) => {
  const trimmed = text.trim()
  if (!trimmed || trimmed.length > 500) {
    return null
  }
  const id = extractVideoId(trimmed)
  if (!id) {
    return null
  }
  const template = resolveTemplate(settings)
  const unknown = findUnknownVariables(template)
  if (unknown.length > 0) {
    showTemplateWarning(
      `模板包含未知变量: ${unknown.map(name => `{${name}}`).join(', ')}，已复制原文`,
    )
    return null
  }
  const info = getCachedInfo(id)
  if (!info) {
    return null
  }
  const fields = buildFields(info, settings, getPageNumber(id, info))
  const rendered = renderTemplate(template, fields).trim()
  return rendered && rendered !== text ? rendered : null
}

const getSelectedText = () => {
  const active = document.activeElement
  if (active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement) {
    return active.value.slice(active.selectionStart ?? 0, active.selectionEnd ?? 0)
  }
  return window.getSelection()?.toString() ?? ''
}

const patchClipboard = (
  clipboard: Clipboard,
  settings: ShareSettings,
  cleanups: (() => void)[],
) => {
  if (!clipboard?.writeText) {
    return
  }
  const originalWriteText = clipboard.writeText.bind(clipboard)
  const originalDescriptor = Object.getOwnPropertyDescriptor(clipboard, 'writeText')
  const patchedWriteText = async (text: string) => {
    let finalText = text
    try {
      const rendered = await createShareText(text, settings)
      if (rendered) {
        finalText = rendered
        if (settings.options.showToast) {
          Toast.success('已替换为分享模板', '分享文案定制', 2000)
        }
      }
    } catch (error) {
      console.warn('[分享文案定制] 改写剪贴板内容失败, 使用原文', error)
    }
    return originalWriteText(finalText)
  }
  try {
    Object.defineProperty(clipboard, 'writeText', {
      configurable: true,
      writable: true,
      value: patchedWriteText,
    })
    cleanups.push(() => {
      if (clipboard.writeText !== patchedWriteText) {
        return
      }
      if (originalDescriptor) {
        Object.defineProperty(clipboard, 'writeText', originalDescriptor)
      } else {
        delete (clipboard as Partial<Clipboard>).writeText
      }
    })
  } catch (error) {
    console.warn('[分享文案定制] 无法接管剪贴板写入', error)
  }
}

const install = (settings: ShareSettings) => {
  const cleanups: (() => void)[] = []

  const handleCopyEvent = (event: ClipboardEvent) => {
    if (!event.clipboardData) {
      return
    }
    const text = event.clipboardData.getData('text/plain') || getSelectedText()
    const rendered = createShareTextSync(text, settings)
    if (rendered) {
      event.preventDefault()
      event.clipboardData.setData('text/plain', rendered)
    }
  }
  document.addEventListener('copy', handleCopyEvent)
  cleanups.push(() => document.removeEventListener('copy', handleCopyEvent))

  // 页面代码和脚本可能运行在不同的 JS 环境, 两边的 clipboard 都要接管
  const clipboards = new Set<Clipboard>()
  if (navigator.clipboard) {
    clipboards.add(navigator.clipboard)
  }
  try {
    const pageClipboard = unsafeWindow.navigator?.clipboard
    if (pageClipboard) {
      clipboards.add(pageClipboard)
    }
  } catch (error) {
    console.warn('[分享文案定制] 无法访问页面的剪贴板对象', error)
  }
  clipboards.forEach(clipboard => patchClipboard(clipboard, settings, cleanups))

  if (settings.options.prefetchInfo) {
    const timer = setTimeout(() => {
      const id = getCurrentVideoId()
      if (id) {
        fetchInfo(id)
      }
    }, 2000)
    cleanups.push(() => clearTimeout(timer))
  }

  return () => cleanups.forEach(cleanup => cleanup())
}

let uninstall: (() => void) | null = null
let currentSettings: ShareSettings | null = null

const entry: ComponentEntry<Options> = ({ settings }) => {
  currentSettings = settings
  uninstall?.()
  uninstall = install(settings)
}

const extraOptions = () =>
  import('./extra-options/TemplateEditor.vue').then(module => module.default)

export const component = defineComponentMetadata({
  name: 'shareCraft',
  displayName: '分享文案定制',
  author: [
    { name: 'HermosMerlin', link: 'https://github.com/HermosMerlin' },
    { name: 'DeepSeek', link: 'https://www.deepseek.com' },
  ],
  tags: [componentsTags.utils],
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
