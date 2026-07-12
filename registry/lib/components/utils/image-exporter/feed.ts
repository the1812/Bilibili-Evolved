import { FeedsCard, addMenuItem, forEachFeedsCard } from '@/components/feeds/api'
import { ComponentEntry } from '@/components/types'
import { getBlob, getJsonWithCredentials } from '@/core/ajax'
import { DownloadPackage } from '@/core/download'
import { Toast } from '@/core/toast'
import { matchUrlPattern } from '@/core/utils'
import { formatTitle, getTitleVariablesFromDate } from '@/core/utils/title'
import { feedsUrls } from '@/core/utils/urls'
import { Options } from '.'
import { useScopedConsole } from '@/core/utils/log'

interface DynamicDetailResponse {
  code: number
  data: {
    item: {
      id_str: string
      modules: {
        module_author: {
          name: string
          mid: number
          pub_ts: number
        }
        module_dynamic: {
          major?: {
            type?: string
            draw?: {
              items: Array<{ src: string }>
            }
            opus?: {
              summary?: { text: string }
              pics?: Array<{ url: string; width: number; height: number }>
            }
            article?: {
              id: number
              title: string
              covers?: string[]
            }
          }
        }
        module_title?: {
          text: string
        }
      }
      orig?: {
        id_str: string
        modules: {
          module_author: {
            name: string
            mid: number
            pub_ts: number
          }
          module_dynamic: {
            major?: {
              type?: string
              draw?: {
                items: Array<{ src: string }>
              }
              opus?: {
                summary?: { text: string }
                pics?: Array<{ url: string; width: number; height: number }>
              }
              article?: {
                id: number
                title: string
                covers?: string[]
              }
            }
          }
        }
      }
    }
  }
}

const getExtensionFromUrl = (url: string): string => {
  const cleanUrl = url.replace(/^http:/, 'https:').split('?')[0]
  const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/)
  return match ? `.${match[1]}` : '.jpg'
}

const fetchDynamicDetail = async (dynamicId: string): Promise<DynamicDetailResponse | null> => {
  const json = await getJsonWithCredentials(
    `https://api.bilibili.com/x/polymer/web-dynamic/v1/detail?id=${dynamicId}`,
  )
  if (json.code !== 0) {
    return null
  }
  return json as DynamicDetailResponse
}

const extractImagesFromMajor = (
  major: DynamicDetailResponse['data']['item']['modules']['module_dynamic']['major'],
): string[] => {
  if (!major) {
    return []
  }
  if (major.draw?.items) {
    return major.draw.items.map(p => p.src.replace(/^http:/, 'https:'))
  }
  if (major.opus?.pics) {
    return major.opus.pics.map(p => p.url.replace(/^http:/, 'https:'))
  }
  return []
}

const stripThumbnailSuffix = (url: string): string =>
  url
    .replace(/^http:/, 'https:')
    .replace(/@\d+w.*$/, '')
    .replace(/@\d+h.*$/, '')
    .replace(/@\..*$/, '')

const extractImagesFromDom = (): string[] => {
  const contentArea = document.querySelector('.opus-module-content')
  if (!contentArea) {
    return []
  }
  const images = contentArea.querySelectorAll('img')
  const urls = new Set<string>()
  images.forEach((img: HTMLImageElement) => {
    const src = img.src || (img.dataset as any)?.src || ''
    if (src.includes('/new_dyn/') && !src.includes('/face/')) {
      urls.add(stripThumbnailSuffix(src))
    }
  })
  return [...urls]
}

const extractImagesFromItem = (
  item: DynamicDetailResponse['data']['item'],
): { urls: string[]; authorModule: any; titleModule: any; origItem?: any } => {
  const { modules } = item
  const authorModule = modules.module_author ?? {}
  const titleModule = modules.module_title ?? {}

  const urls = extractImagesFromMajor(modules.module_dynamic?.major)
  if (urls.length > 0) {
    return { urls, authorModule, titleModule }
  }

  if (item.orig) {
    const origUrls = extractImagesFromMajor(item.orig.modules?.module_dynamic?.major)
    if (origUrls.length > 0) {
      return {
        urls: origUrls,
        authorModule: item.orig.modules.module_author ?? authorModule,
        titleModule,
        origItem: item.orig,
      }
    }
  }

  if (modules.module_dynamic?.major?.type === 'MAJOR_TYPE_ARTICLE') {
    const domUrls = extractImagesFromDom()
    if (domUrls.length > 0) {
      return { urls: domUrls, authorModule, titleModule }
    }
  }

  return { urls: [], authorModule, titleModule }
}

export const setupFeedImageExporter: ComponentEntry<Options> = async ({
  settings: { options },
}) => {
  if (!feedsUrls.some(url => matchUrlPattern(url))) {
    return
  }

  const addExportButton = (card: FeedsCard) => {
    addMenuItem(card, {
      className: 'image-export',
      text: '导出图片',
      action: async () => {
        const console = useScopedConsole('导出图片')
        const toast = Toast.info('获取动态数据中...', '导出图片')

        const detail = await fetchDynamicDetail(card.id)
        if (!detail) {
          toast.close()
          Toast.info('获取动态数据失败.', '导出图片')
          return
        }

        const {
          urls: imageUrls,
          authorModule,
          titleModule,
          origItem,
        } = extractImagesFromItem(detail.data.item)

        if (imageUrls.length === 0) {
          toast.close()
          Toast.info('此条动态没有检测到任何图片.', '导出图片')
          return
        }

        console.log({ imageUrls })
        toast.message = '下载中...'
        let downloadedCount = 0

        const date = getTitleVariablesFromDate(new Date(authorModule.pub_ts * 1000))
        const origAuthorModule = origItem?.modules?.module_author ?? authorModule
        const origDate = getTitleVariablesFromDate(new Date(origAuthorModule.pub_ts * 1000))

        const variables = {
          id: card.id,
          title: titleModule.text ?? '',
          user: authorModule.name ?? card.username,
          userID: authorModule.mid?.toString() ?? '',
          originalUser: origItem
            ? origItem.modules?.module_author?.name ?? card.username
            : card.username,
          originalUserID: origItem
            ? origItem.modules?.module_author?.mid?.toString() ?? ''
            : authorModule.mid?.toString() ?? '',
          originalID: origItem?.id_str ?? card.id,

          publishYear: date.year,
          publishMonth: date.month,
          publishDay: date.day,
          publishHour: date.hour,
          publishMinute: date.minute,
          publishSecond: date.second,
          publishMillisecond: date.millisecond,

          originalPublishYear: origDate.year,
          originalPublishMonth: origDate.month,
          originalPublishDay: origDate.day,
          originalPublishHour: origDate.hour,
          originalPublishMinute: origDate.minute,
          originalPublishSecond: origDate.second,
          originalPublishMillisecond: origDate.millisecond,
        }

        const imageBlobs = await Promise.all(
          imageUrls.map(async url => {
            const blob = await getBlob(url)
            downloadedCount++
            toast.message = `下载中... (${downloadedCount}/${imageUrls.length})`
            return blob
          }),
        )

        const pack = new DownloadPackage()
        const { feedFormat } = options
        imageBlobs.forEach((blob, index) => {
          const titleData = {
            n: (index + 1).toString(),
            ...variables,
          }
          pack.add(
            `${formatTitle(feedFormat, false, titleData)}${getExtensionFromUrl(imageUrls[index])}`,
            blob,
          )
        })
        toast.close()
        const packTitleData = {
          n: '',
          ...variables,
        }
        await pack.emit(`${formatTitle(feedFormat, false, packTitleData)}.zip`)
      },
    })
  }
  forEachFeedsCard({
    added: addExportButton,
  })
}
