import { useScopedConsole } from '@/core/utils/log'

export interface CoverSize {
  width: number
  height: number
}

const console = useScopedConsole('分享文案定制')
const sizeRequests = new Map<string, Promise<CoverSize>>()

/**
 * 图片链接交给聊天软件自己去取, 用 B 站图片 CDN 的缩放参数拿小图
 * 例: xxx.jpg@720w.jpg -> 720x405 的 JPEG (原图 1920x1080 约 650KB, 缩放后约 23KB)
 */
export const coverImageUrl = (coverUrl: string, maxWidth: number) => {
  if (!coverUrl || coverUrl.includes('@') || !/hdslb\.com\//.test(coverUrl)) {
    return coverUrl
  }
  return `${coverUrl}@${maxWidth}w.jpg`
}

const readSize = async (url: string, maxWidth: number): Promise<CoverSize> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const bitmap = await createImageBitmap(await response.blob())
  const scale = Math.min(1, maxWidth / bitmap.width)
  const size = {
    width: Math.round(bitmap.width * scale),
    height: Math.round(bitmap.height * scale),
  }
  bitmap.close()
  return size
}

/** 获取封面的显示尺寸, 读取失败时按 16:9 处理且不缓存 */
export const getCoverSize = (imageUrl: string, maxWidth: number) => {
  const cached = sizeRequests.get(imageUrl)
  if (cached) {
    return cached
  }
  const request = readSize(imageUrl, maxWidth).catch(error => {
    console.warn('获取封面尺寸失败', error)
    sizeRequests.delete(imageUrl)
    return { width: maxWidth, height: Math.round((maxWidth * 9) / 16) }
  })
  sizeRequests.set(imageUrl, request)
  return request
}
