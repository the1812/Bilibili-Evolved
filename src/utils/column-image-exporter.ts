export default {
  widget: {
    condition: () => document.URL.startsWith('https://www.bilibili.com/read/cv'),
    content: /* html */`
      <button class="gui-settings-flat-button column-image-export">
        <i class="mdi mdi-24px mdi-export"></i>
        <span>导出图片</span>
      </button>`,
    success: () => {
      const button = dq('.column-image-export') as HTMLButtonElement
      const text = dq(button, 'span') as HTMLSpanElement
      button.addEventListener('click', async () => {
        try {
          button.disabled = true
          text.textContent = '下载中...'
          const images: { name: string; extension: string; url: string }[] = []
          const title = document.title.replace(/ - 哔哩哔哩$/, '')
          const bannerElement = dq('.banner-img-holder') as HTMLDivElement
          const bannerUrl = retrieveImageUrl(bannerElement)
          if (bannerUrl) {
            images.push({
              ...bannerUrl,
              name: `${title}-banner${bannerUrl.extension}`,
            })
          }
          const articleImages = dqa('.article-holder img:not([class*="cut-off-"])')
          articleImages.forEach(image => {
            const url = retrieveImageUrl(image)
            if (url) {
              images.push({
                ...url,
                name: `${title}-${images.length - 1}${url.extension}`,
              })
            }
          })
          if (images.length === 0) {
            Toast.info('此专栏没有检测到任何图片.', '专栏图片导出')
            return
          }
          const { DownloadPackage } = await import('./download-package')
          const imageBlobs = await Promise.all(images.map(({ url }) => Ajax.getBlob(url)))
          const pack = new DownloadPackage()
          imageBlobs.forEach((blob, index) => pack.add(images[index].name, blob))
          await pack.emit(`${title}.zip`)
        } catch (error) {
          logError(error)
        } finally {
          text.textContent = '导出图片'
          button.disabled = false
        }
      })
    }
  }
}
