import { FeedsCard, addMenuItem, forEachFeedsCard, RepostFeedsCard } from '@/components/feeds/api'
import { ComponentEntry } from '@/components/types'
import { getBlob } from '@/core/ajax'
import { DownloadPackage } from '@/core/download'
import { Toast } from '@/core/toast'
import { getVue2Data, matchUrlPattern, retrieveImageUrl } from '@/core/utils'
import { formatTitle, getTitleVariablesFromDate } from '@/core/utils/title'
import { feedsUrls } from '@/core/utils/urls'
import { Options } from '.'

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
        const imageUrls: { url: string; extension: string }[] = []
        dqa(
          card.element,
          '.main-content .img-content, .bili-album__preview__picture__img, .bili-album .preview__picture__img, .bili-dyn-gallery__image img',
        ).forEach((img: HTMLImageElement | HTMLDivElement) => {
          const urlData = retrieveImageUrl(img)
          if (urlData && !imageUrls.some(({ url }) => url === urlData.url)) {
            imageUrls.push(urlData)
          }
        })
        if (imageUrls.length === 0) {
          Toast.info('此条动态没有检测到任何图片.', '导出图片')
          return
        }
        const toast = Toast.info('下载中...', '导出图片')
        let downloadedCount = 0

        const vueData = getVue2Data(card.element)
        const authorModule = lodash.get(vueData, 'data.modules.module_author', {})
        const repostAuthorModule = lodash.get(vueData, 'data.orig.modules.module_author', {})
        const date = getTitleVariablesFromDate(new Date(authorModule.pub_ts * 1000))
        const repostDate = getTitleVariablesFromDate(
          new Date((repostAuthorModule.pub_ts ?? authorModule.pub_ts) * 1000),
        )
        const variables = {
          id: card.id,
          user: card.username,
          userID: authorModule.mid?.toString(),
          originalUser: (card as RepostFeedsCard).repostUsername ?? card.username,
          originalUserID: repostAuthorModule.mid?.toString() ?? authorModule.mid?.toString(),
          originalID: lodash.get(vueData, 'data.orig.id_str', card.id),

          publishYear: date.year,
          publishMonth: date.month,
          publishDay: date.day,
          publishHour: date.hour,
          publishMinute: date.minute,
          publishSecond: date.second,
          publishMillisecond: date.millisecond,

          originalPublishYear: repostDate.year,
          originalPublishMonth: repostDate.month,
          originalPublishDay: repostDate.day,
          originalPublishHour: repostDate.hour,
          originalPublishMinute: repostDate.minute,
          originalPublishSecond: repostDate.second,
          originalPublishMillisecond: repostDate.millisecond,
        }
        const imageBlobs = await Promise.all(
          imageUrls.map(async ({ url }) => {
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
            `${formatTitle(feedFormat, false, titleData)}${imageUrls[index].extension}`,
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
