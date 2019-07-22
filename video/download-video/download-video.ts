import { getFriendlyTitle, formatTitle } from '../title'
import { VideoInfo, DanmakuInfo } from '../video-info'

interface PageData {
  entity: Video
  aid: string
  cid: string
}
class Video {
  menuClasses: string[]
  currentMenuClass: string

  constructor() {
    this.menuClasses = ['quality', 'action', 'progress'];
    [this.currentMenuClass] = this.menuClasses
  }
  get menuPanel() {
    return document.querySelector('.download-video-panel') as HTMLDivElement
  }
  addMenuClass() {
    this.menuPanel.classList.remove(...this.menuClasses)
    this.menuPanel.classList.add(this.currentMenuClass)
    return this.currentMenuClass
  }
  resetMenuClass() {
    [this.currentMenuClass] = this.menuClasses
    this.addMenuClass()
  }
  nextMenuClass() {
    const index = this.menuClasses.indexOf(this.currentMenuClass) + 1
    const next = this.menuClasses[index >= this.menuClasses.length ? 0 : index]
    this.currentMenuClass = next
    this.addMenuClass()
    return next
  }
  closeMenu() {
    this.menuPanel.classList.remove('opened')
    setTimeout(() => this.resetMenuClass(), 200)
  }
  addError() {
    this.menuPanel.classList.add('error')
  }
  removeError() {
    this.menuPanel.classList.remove('error')
    this.resetMenuClass()
  }
  async getUrl(quality?: number) {
    if (quality) {
      return `https://api.bilibili.com/x/player/playurl?avid=${pageData.aid}&cid=${pageData.cid}&qn=${quality}&otype=json`
    } else {
      return `https://api.bilibili.com/x/player/playurl?avid=${pageData.aid}&cid=${pageData.cid}&otype=json`
    }
  }
}
class Bangumi extends Video {
  async getUrl(quality?: number) {
    if (quality) {
      return `https://api.bilibili.com/pgc/player/web/playurl?avid=${pageData.aid}&cid=${pageData.cid}&qn=${quality}&otype=json`
    } else {
      return `https://api.bilibili.com/pgc/player/web/playurl?avid=${pageData.aid}&cid=${pageData.cid}&qn=&otype=json`
    }
  }
}

const pageData: PageData = {
  entity: new Video(),
  aid: '',
  cid: ''
}
let formats: VideoFormat[] = []
let selectedFormat: VideoFormat | null = null

class VideoFormat {
  quality: number
  internalName: string
  displayName: string
  constructor(quality: number, internalName: string, displayName: string) {
    this.quality = quality
    this.internalName = internalName
    this.displayName = displayName
  }
  async downloadInfo() {
    const videoInfo = new VideoDownloader(this)
    await videoInfo.fetchVideoInfo()
    return videoInfo
  }
  static get availableFormats(): Promise<VideoFormat[]> {
    return new Promise((resolve, reject) => {
      pageData.entity.getUrl().then(url => {
        const xhr = new XMLHttpRequest()
        xhr.addEventListener('load', () => {
          const json = JSON.parse(xhr.responseText)
          if (json.code !== 0) {
            reject('获取清晰度信息失败.')
            return
          }
          const data = json.data || json.result || json
          const qualities = data.accept_quality
          const internalNames = data.accept_format.split(',')
          const displayNames = data.accept_description
          const formats = []
          while (qualities.length > 0) {
            const format = new VideoFormat(
              qualities.pop(),
              internalNames.pop(),
              displayNames.pop()
            )
            formats.push(format)
          }
          resolve(formats.reverse())
        })
        xhr.addEventListener('error', () => reject(`获取清晰度信息失败.`))
        xhr.withCredentials = true
        xhr.open('GET', url)
        xhr.send()
      })
    })
  }
}
class VideoDownloaderFragment {
  length: number
  size: number
  url: string
  backupUrls: string[]
  constructor(length: number, size: number, url: string, backupUrls: string[]) {
    this.length = length
    this.size = size
    this.url = url
    this.backupUrls = backupUrls
  }
}
class VideoDownloader {
  format: VideoFormat
  fragments: VideoDownloaderFragment[]
  fragmentSplitFactor = 6 * 5
  workingXhr: XMLHttpRequest[] | null = null
  progress: (progress: number) => void
  progressMap: Map<XMLHttpRequest, number> = new Map()
  danmakuOption: DanmakuOption

  constructor(format: VideoFormat, fragments?: VideoDownloaderFragment[]) {
    this.format = format
    this.fragments = fragments || []
  }
  get totalSize() {
    return this.fragments.map(it => it.size).reduce((acc, it) => acc + it)
  }
  fetchVideoInfo() {
    return new Promise((resolve, reject) => {
      pageData.entity.getUrl(this.format.quality).then(url => {
        const xhr = new XMLHttpRequest()
        xhr.addEventListener('load', () => {
          const json = JSON.parse(xhr.responseText.replace(/http:/g, 'https:'))
          const data = json.data || json.result || json
          if (data.quality !== this.format.quality) {
            reject('获取下载链接失败, 请确认当前账号有下载权限后重试.')
          }
          const urls = data.durl
          this.fragments = urls.map((it: any) => new VideoDownloaderFragment(
            it.length, it.size,
            it.url,
            it.backup_url
          ))
          resolve(this.fragments)
        })
        xhr.withCredentials = true
        xhr.open('GET', url)
        xhr.send()
      })
    })
  }
  updateProgress() {
    const progress = this.progressMap
      ? [...this.progressMap.values()].reduce((a, b) => a + b, 0) / this.totalSize : 0
    if (progress > 1 || progress < 0) {
      console.error(`[下载视频] 进度异常: ${progress}`, this.progressMap.values())
    }
    this.progress && this.progress(progress)
  }
  cancelDownload() {
    if (this.workingXhr !== null) {
      this.workingXhr.forEach(it => it.abort())
    } else {
      logError('Cancel Download Failed: forEach in this.workingXhr not found.')
    }
  }
  downloadFragment(fragment: VideoDownloaderFragment) {
    const promises: Promise<any>[] = []
    this.workingXhr = []
    this.progressMap = new Map()
    this.updateProgress()
    const partialLength = Math.round(fragment.size / this.fragmentSplitFactor)
    let startByte = 0
    const getPartNumber = (xhr: XMLHttpRequest) => [...this.progressMap.keys()].indexOf(xhr) + 1
    while (startByte < fragment.size) {
      const endByte = Math.min(fragment.size - 1, Math.round(startByte + partialLength))
      const range = `bytes=${startByte}-${endByte}`
      const rangeLength = endByte - startByte + 1
      promises.push(new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', fragment.url)
        xhr.responseType = 'arraybuffer'
        xhr.withCredentials = false
        xhr.addEventListener('progress', (e) => {
          console.log(`[下载视频] 视频片段${getPartNumber(xhr)}下载进度: ${e.loaded}/${rangeLength} bytes loaded, ${range}`)
          this.progressMap.set(xhr, e.loaded)
          this.updateProgress()
        })
        xhr.addEventListener('load', () => {
          if (('' + xhr.status)[0] === '2') {
            resolve(xhr.response)
          } else {
            reject(`请求失败.`)
          }
        })
        xhr.addEventListener('abort', () => reject('canceled'))
        xhr.addEventListener('error', () => {
          console.error(`[下载视频] 视频片段${getPartNumber(xhr)}下载失败: ${range}`)
          this.progressMap.set(xhr, 0)
          this.updateProgress()
          xhr.open('GET', fragment.url)
          xhr.setRequestHeader('Range', range)
          xhr.send()
        })
        xhr.setRequestHeader('Range', range)
        this.progressMap.set(xhr, 0)
        xhr.send()
        this.workingXhr!.push(xhr)
      }))
      startByte = Math.round(startByte + partialLength) + 1
    }
    return Promise.all(promises)
  }
  async copyUrl() {
    const urls = this.fragments.map(it => it.url).reduce((acc, it) => acc + '\r\n' + it)
    GM_setClipboard(urls, 'text')
  }
  static downloadBlob(blobOrUrl: Blob | string, filename: string) {
    const a = document.createElement('a')
    let url: string
    if (typeof blobOrUrl === 'string') {
      url = blobOrUrl
    } else {
      url = URL.createObjectURL(blobOrUrl)
    }
    a.setAttribute('href', url)
    a.setAttribute('download', filename)
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
  async exportData(copy = false) {
    const data = JSON.stringify([{
      fragments: this.fragments,
      title: getFriendlyTitle(),
      totalSize: this.fragments.map(it => it.size).reduce((acc, it) => acc + it),
      referer: document.URL.replace(window.location.search, '')
    }])
    if (copy) {
      GM_setClipboard(data, 'text')
    } else {
      const blob = new Blob([data], { type: 'text/json' })
      const danmaku = await this.downloadDanmaku()
      if (danmaku !== null) {
        const zip = new JSZip()
        zip.file(`${getFriendlyTitle()}.json`, blob)
        zip.file(getFriendlyTitle() + '.' + this.danmakuOption.toLowerCase(), danmaku)
        VideoDownloader.downloadBlob(await zip.generateAsync({ type: 'blob' }), `${getFriendlyTitle()}.zip`)
      } else {
        VideoDownloader.downloadBlob(blob, `${getFriendlyTitle()}.json`)
      }
    }
  }
  async exportAria2(rpc = false) {
    if (rpc) { // https://aria2.github.io/manual/en/html/aria2c.html#json-rpc-using-http-get
      const danmaku = await this.downloadDanmaku()
      if (danmaku !== null) {
        VideoDownloader.downloadBlob(new Blob([danmaku]), `${getFriendlyTitle()}.${this.danmakuOption === 'ASS' ? 'ass' : 'xml'}`)
      }
      const option = settings.aria2RpcOption
      const host = option.host.startsWith('http://') ? option.host : 'http://' + option.host
      const methodName = 'aria2.addUri'
      const params = this.fragments.map((fragment, index) => {
        let indexNumber = ''
        if (this.fragments.length > 1) {
          indexNumber = ' - ' + (index + 1)
        }
        const params = []
        if (option.secretKey !== '') {
          params.push(`token:${option.secretKey}`)
        }
        params.push([fragment.url])
        params.push({
          referer: document.URL.replace(window.location.search, ''),
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0',
          out: `${getFriendlyTitle()}${indexNumber}${this.extension(fragment)}`,
          split: this.fragmentSplitFactor,
          dir: option.dir,
        })
        const base64Params = window.btoa(unescape(encodeURIComponent(JSON.stringify(params))))
        const id = `${getFriendlyTitle()}${indexNumber}`
        return {
          base64Params,
          id,
        }
      })
      for (const param of params) {
        try {
          const response = await Ajax.getJson(`${host}:${option.port}/jsonrpc?method=${methodName}&id=${param.id}&params=${param.base64Params}`)
          if (response.error !== undefined) {
            if (response.error.code === 1) {
              logError(`请求遭到拒绝, 请检查您的密钥相关设置.`)
            } else {
              logError(`请求发生错误, code = ${response.error.code}, message = ${response.error.message}`)
            }
            return
          }
          Toast.success(`成功发送了请求, GID = ${response.result}`, 'aria2 RPC', 5000)
        } catch (error) { // Host or port is invalid
          logError(`无法连接到RPC主机, error = ${error}`)
          return
        }
      }
    } else { // https://aria2.github.io/manual/en/html/aria2c.html#input-file
      const input = `
# Generated by Bilibili Evolved Video Export
# https://github.com/the1812/Bilibili-Evolved/
${this.fragments.map((it, index) => {
        let indexNumber = ''
        if (this.fragments.length > 1) {
          indexNumber = ' - ' + (index + 1)
        }
        return `
${it.url}
  referer=${document.URL.replace(window.location.search, '')}
  user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0
  out=${getFriendlyTitle()}${indexNumber}${this.extension(it)}
  split=${this.fragmentSplitFactor}
  `.trim()
      }).join('\n')}
      `.trim()
      const blob = new Blob([input], { type: 'text/plain' })
      const danmaku = await this.downloadDanmaku()
      if (danmaku !== null) {
        const zip = new JSZip()
        zip.file(`${getFriendlyTitle()}.txt`, blob)
        zip.file(getFriendlyTitle() + '.' + this.danmakuOption.toLowerCase(), danmaku)
        VideoDownloader.downloadBlob(await zip.generateAsync({ type: 'blob' }), `${getFriendlyTitle()}.zip`)
      } else {
        VideoDownloader.downloadBlob(blob, `${getFriendlyTitle()}.txt`)
      }
    }
  }
  extension(fragment?: VideoDownloaderFragment) {
    return (fragment || this.fragments[0]).url
      .indexOf('.flv') !== -1
      ? '.flv'
      : '.mp4'
  }
  makeBlob(data: any, fragment?: VideoDownloaderFragment) {
    return new Blob(Array.isArray(data) ? data : [data], {
      type: this.extension(fragment) === '.flv' ? 'video/x-flv' : 'video/mp4'
    })
  }
  cleanUpOldBlobUrl() {
    const oldBlobUrl = dq('a#video-complete')!.getAttribute('href')
    if (oldBlobUrl && !dq(`.link[href="${oldBlobUrl}"]`)) {
      URL.revokeObjectURL(oldBlobUrl)
    }
    dqa('.toast-card-header')
      .filter((it: HTMLElement) => it.innerText.includes('下载视频'))
      .forEach((it: HTMLElement) => (it.querySelector('.toast-card-dismiss') as HTMLElement).click())
  }
  async downloadDanmaku() {
    if (this.danmakuOption !== '无') {
      const danmakuInfo = new DanmakuInfo(pageData.cid)
      await danmakuInfo.fetchInfo()
      if (this.danmakuOption === 'XML') {
        return danmakuInfo.rawXML
      } else {
        const { convertToAss } = await import('../download-danmaku')
        return convertToAss(danmakuInfo.rawXML)
      }
    } else {
      return null
    }
  }
  async downloadSingle(downloadedData: any[]) {
    const danmaku = await this.downloadDanmaku()
    const [data] = downloadedData
    if (danmaku === null) {
      const blob = this.makeBlob(data)
      const filename = getFriendlyTitle() + this.extension()
      return { blob, filename }
    } else {
      const zip = new JSZip()
      zip.file(getFriendlyTitle() + this.extension(), this.makeBlob(data))
      zip.file(getFriendlyTitle() + '.' + this.danmakuOption.toLowerCase(), danmaku)
      const blob = await zip.generateAsync({ type: 'blob' })
      const filename = getFriendlyTitle() + '.zip'
      return { blob, filename }
    }
  }
  async downloadMultiple(downloadedData: any[]) {
    const zip = new JSZip()
    const title = getFriendlyTitle()
    if (downloadedData.length > 1) {
      downloadedData.forEach((data, index) => {
        const fragment = this.fragments[index]
        zip.file(`${title} - ${index + 1}${this.extension(fragment)}`, this.makeBlob(data, fragment))
      })
    } else {
      const [data] = downloadedData
      zip.file(`${title}${this.extension()}`, this.makeBlob(data))
    }
    const danmaku = await this.downloadDanmaku()
    if (danmaku !== null) {
      zip.file(getFriendlyTitle() + '.' + this.danmakuOption.toLowerCase(), danmaku)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const filename = title + '.zip'
    return { blob, filename }
  }
  async download() {
    const downloadedData = []
    for (const fragment of this.fragments) {
      const data = await this.downloadFragment(fragment)
      downloadedData.push(data)
    }
    if (downloadedData.length < 1) {
      throw new Error('下载失败.')
    }

    let { blob, filename } = await (async () => {
      if (downloadedData.length === 1) {
        return await this.downloadSingle(downloadedData)
      } else {
        return await this.downloadMultiple(downloadedData)
      }
    })()
    this.cleanUpOldBlobUrl()
    const blobUrl = URL.createObjectURL(blob)
    this.progress && this.progress(0)
    return {
      url: blobUrl,
      filename: filename
    }
  }
}
async function loadPageData() {
  const aid = await SpinQuery.select(() => (unsafeWindow || window).aid)
  const cid = await SpinQuery.select(() => (unsafeWindow || window).cid)
  if (!(aid && cid)) {
    return false
  }
  pageData.aid = aid
  pageData.cid = cid
  if (document.URL.indexOf('bangumi') !== -1) {
    pageData.entity = new Bangumi()
  } else {
    pageData.entity = new Video()
  }
  try {
    formats = await VideoFormat.availableFormats
  } catch (error) {
    return false
  }
  return true
}
async function loadWidget() {
  selectedFormat = formats[0]
  resources.applyStyle('downloadVideoStyle')
  dq('#download-video')!.addEventListener('click', () => {
    dq('.download-video')!.classList.toggle('opened');
    (dq('.gui-settings-mask') as HTMLDivElement).click()
  })
  dq('#download-video')!.addEventListener('mouseover', () => {
    document.body.insertAdjacentHTML('beforeend', resources.import('downloadVideoHtml'))
    loadPanel()
  }, { once: true })
}
async function loadPanel() {
  Vue.component('v-dropdown', {
    template: /*html*/`
    <div class="v-dropdown" v-on:click="toggleDropdown()">
      <span class="selected">{{value}}</span>
      <ul class="dropdown-menu" v-bind:class="{opened: dropdownOpen}">
        <li v-for="item in model.items" v-bind:key="item" v-bind:data-value="item" v-on:click="select(item)">{{item}}</li>
      </ul>
      <i class="mdi mdi-chevron-down"></i>
    </div>
  `,
    props: [
      'model',
    ],
    data() {
      return {
        dropdownOpen: false,
      }
    },
    computed: {
      value() {
        return this.model.value
      }
    },
    methods: {
      toggleDropdown() {
        this.dropdownOpen = !this.dropdownOpen
      },
      select(item: string) {
        this.model.value = item
        this.$emit('change')
      },
    },
  })
  Vue.component('v-checkbox', {
    template: /*html*/`
      <div class="v-checkbox" v-on:click="toggleCheck()" v-bind:class="{checked: model.checked}">
        <i class="mdi mdi-checkbox-blank-circle-outline">
          <i class="mdi mdi-checkbox-marked-circle"></i>
        </i>
        <span class="content">{{model.title}}</span>
      </div>
    `,
    props: ['model'],
    methods: {
      toggleCheck() {
        this.model.checked = !this.model.checked
      },
    },
  })
  let workingDownloader: VideoDownloader
  const sizeCache = new Map<VideoFormat, number>()
  type ExportType = 'copyLink' | 'aria2' | 'aria2RPC' | 'copyVLD' | 'exportVLD'
  interface EpisodeItem {
    title: string
    checked: boolean
    index: number
    cid: string
    aid: string
  }
  const panel = new Vue({
    el: '.download-video',
    data: {
      downloadSingle: true,
      coverUrl: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"></svg>',
      aid: pageData.aid,
      cid: pageData.cid,
      qualityModel: {
        value: selectedFormat!.displayName,
        items: formats.map(f => f.displayName)
      },
      danmakuModel: {
        value: settings.downloadVideoDefaultDanmaku as DanmakuOption,
        items: ['无', 'XML', 'ASS'] as DanmakuOption[]
      },
      progressPercent: 0,
      size: '获取大小中' as number | string,
      blobUrl: '',
      episodeList: [] as EpisodeItem[],
      downloading: false,
      batch: false,
      rpcSettings: settings.aria2RpcOption,
      showRpcSettings: false,
      busy: false,
    },
    computed: {
      displaySize() {
        if (typeof this.size === 'string') {
          return this.size
        }
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        let number = this.size
        let unitIndex = 0
        while (number >= 1024) {
          number /= 1024
          unitIndex++
        }
        return `${Math.round(number * 10) / 10}${units[unitIndex]}`
      },
      sizeWarning() {
        if (typeof this.size === 'string') {
          return false
        }
        return this.size > 1073741824 // 1GB
      },
      selectedEpisodeCount() {
        return (this.episodeList as EpisodeItem[]).filter(item => item.checked).length
      },
    },
    methods: {
      close() {
        this.$el.classList.remove('opened')
      },
      danmakuOptionChange() {
        settings.downloadVideoDefaultDanmaku = this.danmakuModel.value
      },
      async formatChange() {
        const format = this.getFormat() as VideoFormat
        const cache = sizeCache.get(format)
        if (cache) {
          this.size = cache
          return
        }
        try {
          this.size = '获取大小中'
          const videoDownloader = await format.downloadInfo()
          this.size = videoDownloader.totalSize
          sizeCache.set(format, this.size)
        } catch (error) {
          this.size = '获取大小失败'
        }
      },
      getFormat() {
        const format = formats.find(f => f.displayName === this.qualityModel.value)
        if (!format) {
          console.error(`No format found. model value = ${this.qualityModel.value}`)
          return null
        }
        return format
      },
      async exportData(type: ExportType) {
        if (this.busy === true) {
          return
        }
        try {
          this.busy = true
          if (!this.downloadSingle) {
            await this.exportBatchData(type)
            return
          }
          const format = this.getFormat() as VideoFormat
          const videoDownloader = await format.downloadInfo()
          videoDownloader.danmakuOption = this.danmakuModel.value
          switch (type) {
            case 'copyLink':
              await videoDownloader.copyUrl()
              Toast.success('已复制链接到剪贴板.', '下载视频', 3000)
              break
            case 'aria2':
              await videoDownloader.exportAria2(false)
              break
            case 'aria2RPC':
              await videoDownloader.exportAria2(true)
              break
            case 'copyVLD':
              await videoDownloader.exportData(true)
              Toast.success('已复制VLD数据到剪贴板.', '下载视频', 3000)
              break
            case 'exportVLD':
              await videoDownloader.exportData(false)
              break
            default:
              break
          }
        } catch (error) {
          logError(error)
        } finally {
          this.busy = false
        }
      },
      async exportBatchData(type: ExportType) {
        const episodeList = this.episodeList as EpisodeItem[]
        if (episodeList.every(item => item.checked === false)) {
          Toast.info('请至少选择1集或以上的数量!', '批量导出', 3000)
          return
        }
        const format = this.getFormat()
        if (this.danmakuModel.value !== '无') {
          const danmakuToast = Toast.info('下载弹幕中...', '批量导出')
          const zip = new JSZip()
          try {
            if (this.danmakuModel.value === 'XML') {
              for (const item of episodeList) {
                const danmakuInfo = new DanmakuInfo(item.cid)
                await danmakuInfo.fetchInfo()
                zip.file(item.title + '.xml', danmakuInfo.rawXML)
              }
            } else {
              const { convertToAss } = await import('../download-danmaku')
              for (const item of episodeList) {
                const danmakuInfo = new DanmakuInfo(item.cid)
                await danmakuInfo.fetchInfo()
                zip.file(item.title + '.ass', await convertToAss(danmakuInfo.rawXML))
              }
            }
            VideoDownloader.downloadBlob(await zip.generateAsync({ type: 'blob' }), this.cid + '.danmakus.zip')
          } catch (error) {
            logError(error)
          } finally {
            danmakuToast.dismiss()
          }
        }
        const toast = Toast.info('获取链接中...', '批量导出')
        const episodeFilter = (item: EpisodeItem) => {
          const match = episodeList.find((it: EpisodeItem) => it.cid === item.cid) as EpisodeItem | undefined
          if (match === undefined) {
            return false
          }
          return match.checked
        }
        this.batchExtractor.itemFilter = episodeFilter
        let result: string
        try {
          switch (type) {
            case 'aria2':
              result = await this.batchExtractor.collectAria2(format, toast)
              VideoDownloader.downloadBlob(new Blob([result], { type: 'text/plain' }), getFriendlyTitle(false) + '.txt')
              return
            case 'aria2RPC':
              await this.batchExtractor.collectAria2(format, toast, true)
              Toast.success(`成功发送了批量请求.`, 'aria2 RPC', 3000)
              return
            case 'copyVLD':
              GM_setClipboard(await this.batchExtractor.collectData(format, toast), { mimetype: 'text/plain' })
              Toast.success('已复制批量vld数据到剪贴板.', '批量导出', 3000)
              return
            case 'exportVLD':
              result = await this.batchExtractor.collectData(format, toast)
              VideoDownloader.downloadBlob(new Blob([result], { type: 'text/json' }), getFriendlyTitle(false) + '.json')
              return
            default:
              return
          }
        } catch (error) {
          logError(error)
        } finally {
          toast.dismiss()
        }
      },
      async checkBatch() {
        const urls = [
          '/www.bilibili.com/bangumi',
          '/www.bilibili.com/video/av'
        ]
        if (!urls.some(url => document.URL.includes(url))) {
          this.batch = false
          this.episodeList = []
          return
        }
        const { BatchExtractor } = await import('batch-download')
        if (await BatchExtractor.test() !== true) {
          this.batch = false
          this.episodeList = []
          return
        }
        this.batchExtractor = new BatchExtractor()
        this.batch = true
        this.episodeList = (await this.batchExtractor.getItemList()).map((item: EpisodeItem, index: number) => {
          return {
            aid: item.aid,
            cid: item.cid,
            title: item.title,
            index,
            checked: true,
          }
        })
      },
      cancelDownload() {
        if (workingDownloader) {
          workingDownloader.cancelDownload()
        }
      },
      async startDownload() {
        const format = this.getFormat() as VideoFormat
        try {
          this.downloading = true
          const videoDownloader = await format.downloadInfo()
          videoDownloader.danmakuOption = this.danmakuModel.value
          videoDownloader.progress = percent => {
            this.progressPercent = Math.trunc(percent * 100)
          }
          workingDownloader = videoDownloader
          const result = await videoDownloader.download()
          const completeLink = document.getElementById('video-complete') as HTMLAnchorElement
          completeLink.setAttribute('href', result.url)
          completeLink.setAttribute('download', result.filename)
          completeLink.click()
          Toast.success(/*html*/`下载完成: ${result.filename} <a class="link" href="${result.url}" download="${result.filename.replace(/"/g, '&quot;')}">再次保存</a>`, '下载视频')
        }
        catch (error) {
          if (error !== 'canceled') {
            logError(error)
          }
          this.progressPercent = 0
        }
        finally {
          this.downloading = false
        }
      },
      selectAllEpisodes() {
        this.episodeList.forEach((item: EpisodeItem) => item.checked = true)
      },
      unselectAllEpisodes() {
        this.episodeList.forEach((item: EpisodeItem) => item.checked = false)
      },
      inverseAllEpisodes() {
        this.episodeList.forEach((item: EpisodeItem) => item.checked = !item.checked)
      },
      toggleRpcSettings() {
        this.showRpcSettings = !this.showRpcSettings
      },
      saveRpcSettings() {
        if (this.rpcSettings.host === '') {
          this.rpcSettings.host = '127.0.0.1'
        }
        if (this.rpcSettings.port === '') {
          this.rpcSettings.port = '6800'
        }
        settings.aria2RpcOption = this.rpcSettings
      }
    }
  })

  Observer.videoChange(async () => {
    panel.close()
    panel.batch = false
    panel.downloadSingle = true
    const button = dq('#download-video') as HTMLElement
    const canDownload = await loadPageData();
    button.style.display = canDownload ? 'flex' : 'none'
    if (!canDownload) {
      return
    }

    panel.aid = pageData.aid
    panel.cid = pageData.cid
    const videoInfo = new VideoInfo(pageData.aid)
    await videoInfo.fetchInfo()
    panel.coverUrl = videoInfo.coverUrl.replace('http:', 'https:')

    formats = await VideoFormat.availableFormats;
    [selectedFormat] = formats
    panel.qualityModel = {
      value: selectedFormat.displayName,
      items: formats.map(f => f.displayName)
    }
    panel.formatChange()
    await panel.checkBatch()
  })
}

export default {
  widget:
  {
    content: /*html*/`
      <button class="gui-settings-flat-button" style="position: relative; z-index: 100;" id="download-video">
        <i class="icon-download"></i>
        <span>下载视频</span>
      </button>`,
    condition: loadPageData,
    success: loadWidget
  }
}
