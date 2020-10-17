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
          let url: string
          if (img instanceof HTMLImageElement) {
            url = img.src
          } else {
            const backgroundImage = img.style.backgroundImage
            if (!backgroundImage) {
              return
            }
            const match = backgroundImage.match(/url\("(.+)"\)/)
            if (!match) {
              return
            }
            url = match[1]
          }
          const thumbMatch = url.match(/^(.+)(\..+?)(@.+)$/)
          if (!thumbMatch) {
            return
          }
          imageUrls.push({
            url: thumbMatch[1] + thumbMatch[2],
            extension: thumbMatch[2],
          })
        })
        const { DownloadVideoPackage } = await import('../video/download-video/download-video-package')
        const imageBlobs = await Promise.all(imageUrls.map(({ url }) => Ajax.getBlob(url)))
        const pack = new DownloadVideoPackage()
        imageBlobs.forEach((blob, index) => pack.add(`${card.username}-${card.id}-${index}${imageUrls[index].extension}`, blob))
        await pack.emit(`${card.username}-${card.id}.zip`)
      },
    })
  }
  forEachFeedsCard({
    added: addExportButton,
  })
})()
