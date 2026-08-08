import { getJsonWithCredentials } from '@/core/ajax'
import { useScopedConsole } from '@/core/utils/log'
import { retrieveImageUrl } from '@/core/utils'

const console = useScopedConsole('图片导出')

interface ArticleImageOp {
  insert?: {
    nativeImage?: { url?: string }
    'native-image'?: { url?: string }
  }
}

/**
 * 从专栏 API 提取图片链接, 失败时返回空数组
 * @param articleId 专栏 cv 号
 */
export const extractImagesFromArticle = async (articleId: number): Promise<string[]> => {
  try {
    const json = await getJsonWithCredentials(
      `https://api.bilibili.com/x/article/view?id=${articleId}`,
    )
    if (json.code !== 0) {
      return []
    }

    const { data } = json
    const urls = new Set<string>()
    const addUrl = (src: string) => {
      if (src && src.includes('/article/') && !src.includes('/face/')) {
        const imageInfo = retrieveImageUrl(src)
        if (imageInfo) {
          urls.add(imageInfo.url)
        }
      }
    }

    if (data.type === 3) {
      const content = JSON.parse(data.content)
      content.ops?.forEach((op: ArticleImageOp) => {
        const image = op.insert?.nativeImage ?? op.insert?.['native-image']
        if (image?.url) {
          addUrl(image.url)
        }
      })
    } else {
      const doc = new DOMParser().parseFromString(data.content, 'text/html')
      doc.querySelectorAll('img').forEach(img => addUrl(img.src))
    }

    data.image_urls?.forEach(addUrl)
    data.origin_image_urls?.forEach(addUrl)

    return [...urls]
  } catch (e) {
    console.error(e)
    return []
  }
}
