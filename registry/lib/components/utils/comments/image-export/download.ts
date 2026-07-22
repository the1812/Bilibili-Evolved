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

const getPageId = (): string => {
  const url = window.location.href
  const videoMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+|av\d+)/)
  if (videoMatch) {
    return videoMatch[1]
  }
  const opusMatch = url.match(/bilibili\.com\/opus\/(\d+)/)
  if (opusMatch) {
    return `opus_${opusMatch[1]}`
  }
  const readMatch = url.match(/bilibili\.com\/read\/cv(\d+)/)
  if (readMatch) {
    return `cv${readMatch[1]}`
  }
  return 'unknown'
}

const buildFileName = (entry: PictureEntry) =>
  `${entry.userName} - ${entry.userId} - ${entry.commentId} - ${
    entry.imageIndex
  }${getExtensionFromUrl(entry.url)}`

const downloadEntries = async (entries: PictureEntry[]) => {
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
    await pack.emit(`评论图片 - ${getPageId()}.zip`)
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

export const downloadSingleComment = (data: CommentImageData) => {
  downloadEntries(toEntries(data))
}

export const downloadAllComments = () => {
  const entries: PictureEntry[] = []
  commentImageList.value.forEach(data => {
    entries.push(...toEntries(data))
  })
  if (entries.length === 0) {
    return
  }
  downloadEntries(entries)
}
