import { FeedsCard } from './feeds-apis'

(async () => {
  const { forEachFeedsCard, addMenuItem } = await import('./feeds-apis')
  const addExportButton = (card: FeedsCard) => {
    addMenuItem(card, {
      className: 'image-export',
      text: '导出图片',
      action: async () => {
        const imageUrls: { url: string; extension: string }[] = []
        dqa(card.element, 'img, .img-content').forEach((img: HTMLImageElement | HTMLDivElement) => {
          const urlData = retrieveImageUrl(img)
          if (urlData) {
            imageUrls.push(urlData)
          }
        })
        if (imageUrls.length === 0) {
          Toast.info('此条动态没有检测到任何图片.', '动态图片导出')
          return
        }
        const { DownloadPackage } = await import('../utils/download-package')
        const imageBlobs = await Promise.all(imageUrls.map(({ url }) => Ajax.getBlob(url)))
        const pack = new DownloadPackage()
        imageBlobs.forEach((blob, index) => pack.add(`${card.username}-${card.id}-${index}${imageUrls[index].extension}`, blob))
        await pack.emit(`${card.username}-${card.id}.zip`)
      },
    })
  }
  forEachFeedsCard({
    added: addExportButton,
  })
})()
