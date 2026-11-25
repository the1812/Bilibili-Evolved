export interface CoverSize {
  width: number
  height: number
}

const coverTtl = 30 * 60 * 1000
const coverCacheLimit = 20

const sizeCache = new Map<string, { size: CoverSize; time: number }>()
const pendingSizes = new Map<string, Promise<CoverSize | null>>()

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
  try {
    const scale = Math.min(1, maxWidth / bitmap.width)
    return {
      width: Math.max(1, Math.round(bitmap.width * scale)),
      height: Math.max(1, Math.round(bitmap.height * scale)),
    }
  } finally {
    bitmap.close()
  }
}

/** 获取封面显示尺寸, 失败时返回 null (调用方按 16:9 兜底) */
export const getCoverSize = (imageUrl: string, maxWidth: number) => {
  if (!imageUrl) {
    return Promise.resolve<CoverSize | null>(null)
  }
  const cached = sizeCache.get(imageUrl)
  if (cached && Date.now() - cached.time <= coverTtl) {
    return Promise.resolve<CoverSize | null>(cached.size)
  }
  const pending = pendingSizes.get(imageUrl)
  if (pending) {
    return pending
  }
  const request = (async () => {
    try {
      const size = await readSize(imageUrl, maxWidth)
      if (sizeCache.size >= coverCacheLimit) {
        const oldestKey = sizeCache.keys().next().value
        if (oldestKey !== undefined) {
          sizeCache.delete(oldestKey)
        }
      }
      sizeCache.set(imageUrl, { size, time: Date.now() })
      return size
    } catch (error) {
      console.warn('[分享文案定制] 获取封面尺寸失败', error)
      return null
    } finally {
      pendingSizes.delete(imageUrl)
    }
  })()
  pendingSizes.set(imageUrl, request)
  return request
}
