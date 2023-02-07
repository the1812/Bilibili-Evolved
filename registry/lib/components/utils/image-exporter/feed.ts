import { FeedsCard, addMenuItem, forEachFeedsCard, RepostFeedsCard } from '@/components/feeds/api'
import { ComponentEntry } from '@/components/types'
import { getBlob } from '@/core/ajax'
import { DownloadPackage } from '@/core/download'
import { Toast } from '@/core/toast'
import { matchUrlPattern, retrieveImageUrl } from '@/core/utils'
import { formatTitle } from '@/core/utils/title'
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
        dqa(card.element, '.main-content .img-content, .bili-album__preview__picture__img').forEach(
          (img: HTMLImageElement | HTMLDivElement) => {
            const urlData = retrieveImageUrl(img)
            if (urlData && !imageUrls.some(({ url }) => url === urlData.url)) {
              imageUrls.push(urlData)
            }
          },
        )
        if (imageUrls.length === 0) {
          Toast.info('此条动态没有检测到任何图片.', '导出图片')
          return
        }
        const toast = Toast.info('下载中...', '导出图片')
        let downloadedCount = 0
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
            user: card.username,
            id: card.id,
            originalUser: (card as RepostFeedsCard).repostUsername ?? card.username,
            n: (index + 1).toString(),
          }
          pack.add(
            `${formatTitle(feedFormat, false, titleData)}${imageUrls[index].extension}`,
            blob,
          )
        })
        toast.close()
        const packTitleData = {
          user: card.username,
          id: card.id,
          originalUser: (card as RepostFeedsCard).repostUsername ?? card.username,
          n: '',
        }
        await pack.emit(`${formatTitle(feedFormat, false, packTitleData)}.zip`)
      },
    })
  }
  forEachFeedsCard({
    added: addExportButton,
  })
}
