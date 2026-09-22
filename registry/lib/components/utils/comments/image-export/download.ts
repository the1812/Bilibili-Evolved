import { getBlob } from '@/core/ajax'
import { DownloadPackage } from '@/core/download'
import { Toast } from '@/core/toast'
import { CommentImageData } from './types'
import { commentImageList } from './store'

interface PictureEntry {
  url: string
  userName: string
  userId: string
  commentId: string
  imageIndex: number
}

const getExtensionFromUrl = (url: string): string => {
  const cleanUrl = url.replace(/^http:/, 'https:').split('?')[0]
  const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/)
  return match ? `.${match[1]}` : '.jpg'
}

// bvid / aid 由 core 的 player polyfill 填充, 番剧、合集等页面也能拿到当前播放的视频
const getVideoId = (): string | null => {
  if (unsafeWindow.bvid) {
    return unsafeWindow.bvid
  }
  if (unsafeWindow.aid) {
    return `av${unsafeWindow.aid}`
  }
  return null
}

const getDynamicIdFromUrl = ({ hostname, pathname }: URL): string | null => {
  const segments = pathname.split('/').filter(Boolean)
  if (hostname !== 't.bilibili.com' && segments[0] !== 'opus') {
    return null
  }
  const lastSegment = segments[segments.length - 1]
  return /^\d+$/.test(lastSegment) ? lastSegment : null
}

const getDynamicIdFromDom = (areaElement?: HTMLElement): string | null =>
  areaElement?.closest('[data-did]')?.getAttribute('data-did') ?? null

const getCommentAreaOid = (areaElement?: HTMLElement): string | null => {
  const [, oid] = areaElement?.getAttribute('data-params')?.split(',') ?? []
  return oid && /^\d+$/.test(oid) ? oid : null
}

const getSourceId = (areaElement?: HTMLElement): string => {
  const url = new URL(window.location.href)
  const videoId = getVideoId()
  if (videoId) {
    return videoId
  }
  const dynamicId = getDynamicIdFromUrl(url) ?? getDynamicIdFromDom(areaElement)
  if (dynamicId) {
    return dynamicId
  }
  const readMatch = url.pathname.match(/^\/read\/cv(\d+)/)
  if (readMatch) {
    return `cv${readMatch[1]}`
  }
  return getCommentAreaOid(areaElement) ?? 'unknown'
}

const buildFileName = (entry: PictureEntry) =>
  `${entry.userName} - ${entry.userId} - ${entry.commentId} - ${
    entry.imageIndex
  }${getExtensionFromUrl(entry.url)}`

const buildZipName = (sourceId: string, commentId?: string) =>
  commentId ? `${sourceId} - ${commentId}.zip` : `${sourceId}.zip`

const downloadEntries = async (entries: PictureEntry[], zipName: string) => {
  const toast = Toast.info('获取图片中...', '评论图片下载')
  let completed = 0
  const failedUrls: string[] = []
  const results = await Promise.all(
    entries.map(async entry => {
      try {
        const blob = await getBlob(entry.url)
        completed++
        toast.message = `下载中... (${completed + failedUrls.length}/${entries.length})`
        return { entry, blob }
      } catch {
        failedUrls.push(entry.url)
        toast.message = `下载中... (${completed + failedUrls.length}/${entries.length})`
        return null
      }
    }),
  )
  toast.close()
  const pack = new DownloadPackage()
  results.forEach(result => {
    if (result) {
      pack.add(buildFileName(result.entry), result.blob)
    }
  })
  if (failedUrls.length > 0) {
    Toast.error(
      `${failedUrls.length}/${entries.length} 张图片下载失败:\n${failedUrls.join('\n')}`,
      '评论图片下载',
      10000,
    )
  }
  if (results.some(Boolean)) {
    await pack.emit(zipName)
  }
}

const toEntries = (data: CommentImageData): PictureEntry[] =>
  data.pictures.map((url, i) => ({
    url,
    userName: data.userName,
    userId: data.userId,
    commentId: data.commentId,
    imageIndex: i + 1,
  }))

export const downloadSingleComment = (data: CommentImageData, areaElement?: HTMLElement) => {
  downloadEntries(toEntries(data), buildZipName(getSourceId(areaElement), data.commentId))
}

export const downloadAllComments = (areaElement?: HTMLElement) => {
  const entries: PictureEntry[] = []
  commentImageList.value.forEach(data => {
    entries.push(...toEntries(data))
  })
  if (entries.length === 0) {
    return
  }
  downloadEntries(entries, buildZipName(getSourceId(areaElement)))
}
