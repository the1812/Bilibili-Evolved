import { VideoInfo } from '../video-info'
import { getFriendlyTitle } from '../title'

class ImageViewer {
  viewer: HTMLElement
  imageData: string

  constructor (public url: string) {
    if (dq('.image-viewer') === null) {
      this.createContainer()
    }
    this.viewer = dq('.image-viewer-container') as HTMLElement
    this.downloadImage()
    addSettingsListener('filenameFormat', () => {
      this.downloadButton.setAttribute('download', this.filename)
    })
  }
  createContainer () {
    document.body.insertAdjacentHTML('beforeend', resources.import('imageViewerHtml'))
    const container = dq('.image-viewer-container') as HTMLElement
    const viewer = dq('.image-viewer')
    dq(container, '.close')?.addEventListener('click', () => this.hide())
    dq('.image-viewer-container')?.addEventListener('click', e => {
      if (e.target === container || e.target === viewer) {
        this.hide()
      }
    })
    resources.applyStyle('imageViewerStyle')
  }
  async downloadImage () {
    const viewCoverButton = dq('#view-cover') as HTMLElement
    viewCoverButton.style.display = this.url ? 'flex' : 'none'
    if (this.url === '') {
      return
    }
    const data = URL.createObjectURL(await Ajax.getBlob(this.url.replace('http:', 'https:')))
    if (this.imageData) {
      URL.revokeObjectURL(this.imageData)
    }
    this.imageData = data
    this.downloadButton.href = data
    this.downloadButton.download = this.filename

    this.copyLinkButton.addEventListener('click', () => {
      if (this.copyLinkButton.classList.contains('success')) {
        return
      }
      GM.setClipboard(this.url)
      this.copyLinkButton.classList.add('success')
      setTimeout(() => this.copyLinkButton.classList.remove('success'), 1500)
    })
    this.newTabButton.href = this.url
    this.imageElement.src = data
  }
  show () {
    this.viewer.classList.add('opened')
  }
  hide () {
    this.viewer.classList.remove('opened')
  }
  get downloadButton () { return dq(this.viewer, '.download') as HTMLAnchorElement }
  get copyLinkButton () { return dq(this.viewer, '.copy-link') as HTMLElement }
  get newTabButton () { return dq(this.viewer, '.new-tab') as HTMLAnchorElement }
  get imageElement () { return dq(this.viewer, '.image') as HTMLImageElement }
  get filename () {
    return getFriendlyTitle(document.URL.includes('/www.bilibili.com/bangumi/')) + this.url.substring(this.url.lastIndexOf('.'))
  }
}

export default (() => {
  if (!document.URL.includes('live.bilibili.com')) {
    return {
      widget: {
        content: /*html*/`
          <button
            class='gui-settings-flat-button'
            id='view-cover'>
            <i class='icon-view'></i>
            <span>查看封面</span>
          </button>`,
        condition: async () => {
          const aid = await SpinQuery.select(() => unsafeWindow.aid)
          return Boolean(aid)
        },
        success: async () => {
          async function getUrl () {
            const aid = unsafeWindow.aid as string
            const videoInfo = new VideoInfo(aid)
            try {
              await videoInfo.fetchInfo()
            }
            catch (error) {
              return ''
            }
            return videoInfo.coverUrl
          }
          let imageViewer = new ImageViewer(await getUrl())
          const viewCoverButton = dq('#view-cover') as HTMLElement
          viewCoverButton.addEventListener('click', () => {
            imageViewer.show()
          })
          const updateImage = async () => {
            imageViewer = new ImageViewer(await getUrl())
          }
          Observer.videoChange(updateImage)
        },
      },
    }
  }
  else {
    return {
      widget: {
        content: /*html*/`
          <button
            class='gui-settings-flat-button'
            id='view-cover'>
            <i class='icon-view'></i>
            <span>查看封面</span>
          </button>`,
        condition: async () => {
          const coverLink = await SpinQuery.select(() => document.querySelector('.header-info-ctnr .room-cover'))
          return Boolean(coverLink)
        },
        success: async () => {
          const coverLink = document.querySelector('.header-info-ctnr .room-cover') as HTMLAnchorElement
          const match = coverLink.href.match(/space\.bilibili\.com\/([\d]+)/)
          if (match && match[1]) {
            const uid = match[1]
            const url = `https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${uid}`
            const json = await Ajax.getJson(url)
            const coverUrl = json.data.cover
            const imageViewer = new ImageViewer(coverUrl)
            const viewCoverButton = dq('#view-cover') as HTMLElement
            viewCoverButton.addEventListener('click', () => {
              imageViewer.show()
            })
          }
        },
      },
    }
  }
})()