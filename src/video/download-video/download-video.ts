import { getFriendlyTitle, formatTitle } from '../title'
import { VideoInfo, DanmakuInfo } from '../video-info'
import { VideoDownloaderFragment } from './video-downloader-fragment'
import { DownloadVideoPackage } from './download-video-package'
import { VideoDash } from './video-dash'
import { BatchExtractor } from './batch-download'

interface PageData {
  entity: Video
  aid: string
  cid: string
}
class Video {
  async getDashUrl(quality?: number) {
    if (quality) {
      return `https://api.bilibili.com/x/player/playurl?avid=${pageData.aid}&cid=${pageData.cid}&qn=${quality}&otype=json&fnver=0&fnval=16`
    } else {
      return `https://api.bilibili.com/x/player/playurl?avid=${pageData.aid}&cid=${pageData.cid}&otype=json&fnver=0&fnval=16`
    }
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
  async getDashUrl(quality?: number) {
    if (quality) {
      return `https://api.bilibili.com/pgc/player/web/playurl?avid=56995872&cid=99547543&qn=${quality}&otype=json&fourk=1&fnval=16`
    } else {
      return `https://api.bilibili.com/pgc/player/web/playurl?avid=56995872&cid=99547543&otype=json&fourk=1&fnval=16`
    }
  }
  async getUrl(quality?: number) {
    if (quality) {
      return `https://api.bilibili.com/pgc/player/web/playurl?avid=${pageData.aid}&cid=${pageData.cid}&qn=${quality}&otype=json`
    } else {
      return `https://api.bilibili.com/pgc/player/web/playurl?avid=${pageData.aid}&cid=${pageData.cid}&qn=&otype=json`
    }
  }
}
// 课程, 不知道为什么b站给它起名cheese
class Cheese extends Video {
  constructor(public ep: number | string) { super() }
  async getDashUrl(quality?: number) {
    if (quality) {
      return `https://api.bilibili.com/pugv/player/web/playurl?avid=${pageData.aid}&cid=${pageData.cid}&qn=${quality}&otype=json&ep_id=${this.ep}&fnver=0&fnval=16`
    } else {
      return `https://api.bilibili.com/pugv/player/web/playurl?avid=${pageData.aid}&cid=${pageData.cid}&otype=json&ep_id=${this.ep}&fnver=0&fnval=16`
    }
  }
  async getUrl(quality?: number) {
    if (quality) {
      return `https://api.bilibili.com/pugv/player/web/playurl?avid=${pageData.aid}&cid=${pageData.cid}&qn=${quality}&otype=json&ep_id=${this.ep}`
    } else {
      return `https://api.bilibili.com/pugv/player/web/playurl?avid=${pageData.aid}&cid=${pageData.cid}&otype=json&ep_id=${this.ep}`
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
  async downloadInfo(dash = false) {
    const videoInfo = new VideoDownloader(this)
    await videoInfo.fetchVideoInfo(dash)
    return videoInfo
  }
  static parseFormats(data: any): VideoFormat[] {
    const qualities = data.accept_quality
    const internalNames = data.accept_format.split(',')
    const displayNames = data.accept_description
    const formats = qualities.map((q: number, index: number) => {
      return new VideoFormat(
        q,
        internalNames[index],
        displayNames[index]
      )
    })
    // while (qualities.length > 0) {
    //   const format = new VideoFormat(
    //     qualities.pop(),
    //     internalNames.pop(),
    //     displayNames.pop()
    //   )
    //   formats.push(format)
    // }
    return formats
  }
  static async getAvailableDashFormats(): Promise<VideoFormat[]> {
    const url = await pageData.entity.getDashUrl()
    const json = await Ajax.getJsonWithCredentials(url)
    if (json.code !== 0) {
      throw new Error('获取清晰度信息失败.')
    }
    return VideoFormat.parseFormats(json.data || json.result || json)
  }
  static async getAvailableFormats(): Promise<VideoFormat[]> {
    const url = await pageData.entity.getUrl()
    const json = await Ajax.getJsonWithCredentials(url)
    if (json.code !== 0) {
      throw new Error('获取清晰度信息失败.')
    }
    const data = json.data || json.result || json
    return VideoFormat.parseFormats(data)
  }
}
class VideoDownloader {
  format: VideoFormat
  fragments: VideoDownloaderFragment[]
  fragmentSplitFactor = 6 * 2
  workingXhr: XMLHttpRequest[] | null = null
  progress: (progress: number) => void
  progressMap: Map<XMLHttpRequest, number> = new Map()
  videoSpeed: VideoSpeed

  constructor(format: VideoFormat, fragments?: VideoDownloaderFragment[]) {
    this.format = format
    this.fragments = fragments || []
    this.videoSpeed = new VideoSpeed(this)
  }
  get danmakuOption() {
    return settings.downloadVideoDefaultDanmaku
  }
  // get ffmpegOption() {
  //   return settings.downloadVideoFfmpegSupport
  // }
  get isDash() {
    return this.fragments.some(it => it.url.includes('.m4s'))
  }
  get totalSize() {
    return this.fragments.map(it => it.size).reduce((acc, it) => acc + it)
  }
  async fetchVideoInfo(dash = false): Promise<VideoDownloaderFragment[]> {
    if (!dash) {
      const url = await pageData.entity.getUrl(this.format.quality)
      const text = await Ajax.getTextWithCredentials(url)
      const json = JSON.parse(text.replace(/http:/g, 'https:'))
      const data = json.data || json.result || json
      if (data.quality !== this.format.quality) {
        throw new Error('获取下载链接失败, 请确认当前账号有下载权限后重试.')
      }
      const urls = data.durl
      this.fragments = urls.map((it: any) => {
        return {
          length: it.length,
          size: it.size,
          url: it.url,
          backupUrls: it.backup_url
        } as VideoDownloaderFragment
      })
    }
    else {
      const { dashToFragment, getDashInfo } = await import('./video-dash')
      const dashes = await getDashInfo(
        await pageData.entity.getDashUrl(this.format.quality),
        this.format.quality
      )
      // 画面按照首选编码选择, 若没有相应编码则选择大小较小的编码
      console.log(dashes.videoDashes)
      const video = (() => {
        const matchPreferredCodec = (d: VideoDash) => d.videoCodec === settings.downloadVideoDashCodec
        if (dashes.videoDashes.some(matchPreferredCodec)) {
          return dashes.videoDashes
            .filter(matchPreferredCodec)
            .sort(ascendingSort(d => d.bandWidth))[0]
        } else {
          return dashes.videoDashes.sort(ascendingSort(d => d.bandWidth))[0]
        }
      })()
      // 声音倒序排, 选择最高音质
      const audio = dashes.audioDashes.sort(descendingSort(d => d.bandWidth))[0]
      this.fragments = [dashToFragment(video), dashToFragment(audio)]
    }
    return this.fragments
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
    this.videoSpeed.stopMeasure()
    if (this.workingXhr !== null) {
      this.workingXhr.forEach(it => it.abort())
    } else {
      logError('Cancel Download Failed: forEach in this.workingXhr not found.')
    }
  }
  downloadFragment(fragment: VideoDownloaderFragment) {
    const promises: Promise<ArrayBuffer>[] = []
    /* 按一定大小分段或许对大视频更好
    DASH:
      - 小于等于24MB时, 均分为12段 (this.fragmentSplitFactor = 12)
      - 大于24MB时, 每4MB为一段
    FLV:
      - 小于等于96MB时, 均分为12段
      - 大于96MB时, 每16MB为一段
    */
    const minimalLength = this.isDash ? 4 * 1024 * 1024 : 16 * 1024 * 1024
    let partialLength: number
    if (fragment.size <= minimalLength * 6) {
      partialLength = fragment.size / this.fragmentSplitFactor
    } else {
      partialLength = minimalLength
    }
    let startByte = 0
    const getPartNumber = (xhr: XMLHttpRequest) => [...this.progressMap.keys()].indexOf(xhr) + 1
    while (startByte < fragment.size) {
      const endByte = Math.min(fragment.size - 1, Math.round(startByte + partialLength))
      const range = `bytes=${startByte}-${endByte}`
      const rangeLength = endByte - startByte + 1
      promises.push(new Promise((resolve, reject) => {
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
            console.log(`[下载视频] 视频片段${getPartNumber(xhr)}下载完成`)
            resolve(xhr.response)
          } else {
            reject(`视频片段${getPartNumber(xhr)}请求失败, response = ${xhr.status}`)
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
    GM.setClipboard(urls, 'text')
  }
  async showUrl() {
    const message = this.fragments.map(it => /*html*/`
      <a class="download-link" href="${it.url}">${it.url}</a>
    `).reduce((acc, it) => acc + '\r\n' + it)
    Toast.success(message + /*html*/`<a class="link" id="copy-link" style="cursor: pointer;margin: 8px 0 0 0;">复制全部</a>`, '显示链接')
    const copyLinkButton = await SpinQuery.select('#copy-link') as HTMLElement
    copyLinkButton.addEventListener('click', async () => {
      await this.copyUrl()
    })
  }
  // static downloadBlob(blobOrUrl: Blob | string, filename: string) {
  //   const a = document.createElement('a')
  //   let url: string
  //   if (typeof blobOrUrl === 'string') {
  //     url = blobOrUrl
  //   } else {
  //     url = URL.createObjectURL(blobOrUrl)
  //   }
  //   a.setAttribute('href', url)
  //   a.setAttribute('download', filename)
  //   document.body.appendChild(a)
  //   a.click()
  //   a.remove()
  //   URL.revokeObjectURL(url)
  // }
  async exportData(copy = false) {
    const data = JSON.stringify([{
      fragments: this.fragments,
      title: getFriendlyTitle(),
      totalSize: this.fragments.map(it => it.size).reduce((acc, it) => acc + it),
      referer: document.URL.replace(window.location.search, '')
    }])
    if (copy) {
      GM.setClipboard(data, 'text')
    } else {
      const blob = new Blob([data], { type: 'text/json' })
      const danmaku = await this.downloadDanmaku()
      const pack = new DownloadVideoPackage()
      pack.add(`${getFriendlyTitle()}.json`, blob)
      pack.add(getFriendlyTitle() + '.' + this.danmakuOption.toLowerCase(), danmaku)
      await pack.emit(`${getFriendlyTitle()}.zip`)
    }
  }
  async exportAria2(rpc = false) {
    if (rpc) { // https://aria2.github.io/manual/en/html/aria2c.html#json-rpc-using-http-get
      const danmaku = await this.downloadDanmaku()
      const pack = new DownloadVideoPackage()
      pack.add(
        `${getFriendlyTitle()}.${this.danmakuOption === 'ASS' ? 'ass' : 'xml'}`,
        danmaku
      )
      await pack.emit()
      const option = settings.aria2RpcOption
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
          'user-agent': UserAgent,
          out: `${getFriendlyTitle()}${indexNumber}${this.extension(fragment)}`,
          split: this.fragmentSplitFactor,
          dir: (option.baseDir + option.dir) || undefined,
          'max-download-limit': option.maxDownloadLimit || undefined,
        })
        const id = encodeURIComponent(`${getFriendlyTitle()}${indexNumber}`)
        return {
          params,
          id,
        }
      })
      const { sendRpc } = await import('./aria2-rpc')
      await sendRpc(params)
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
  user-agent=${UserAgent}
  out=${getFriendlyTitle()}${indexNumber}${this.extension(it)}
  split=${this.fragmentSplitFactor}
  `.trim()
      }).join('\n')}
      `.trim()
      const blob = new Blob([input], { type: 'text/plain' })
      const danmaku = await this.downloadDanmaku()
      const pack = new DownloadVideoPackage()
      pack.add(`${getFriendlyTitle()}.txt`, blob)
      pack.add(getFriendlyTitle() + '.' + this.danmakuOption.toLowerCase(), danmaku)
      await pack.emit(`${getFriendlyTitle()}.zip`)
    }
  }
  extension(fragment?: VideoDownloaderFragment) {
    const f = (fragment || this.fragments[0])
    const match = [
      '.flv',
      '.mp4',
      '.m4s',
    ].find(it => f.url.includes(it))
    if (match) {
      return match
    } else {
      console.warn('No extension detected.')
      return '.flv'
    }
  }
  // makeBlob(data: any, fragment?: VideoDownloaderFragment) {
  //   return new Blob(Array.isArray(data) ? data : [data], {
  //     type: this.extension(fragment) === '.flv' ? 'video/x-flv' : 'video/mp4'
  //   })
  // }
  // cleanUpOldBlobUrl() {
  //   const oldBlobUrl = dq('a#video-complete')!.getAttribute('href')
  //   if (oldBlobUrl && !dq(`.link[href="${oldBlobUrl}"]`)) {
  //     URL.revokeObjectURL(oldBlobUrl)
  //   }
  //   dqa('.toast-card-header')
  //     .filter((it: HTMLElement) => it.innerText.includes('下载视频'))
  //     .forEach((it: HTMLElement) => (it.querySelector('.toast-card-dismiss') as HTMLElement).click())
  // }
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
  // async downloadSingle(downloadedData: any[]) {
  //   const danmaku = await this.downloadDanmaku()
  //   const [data] = downloadedData
  //   const pack = new DownloadVideoPackage({ ffmpeg: this.ffmpegOption, titleList: [getFriendlyTitle()] })
  //   pack.add(getFriendlyTitle() + this.extension(), this.makeBlob(data))
  //   pack.add(getFriendlyTitle() + '.' + this.danmakuOption.toLowerCase(), danmaku)
  //   return {
  //     blob: await pack.blob(),
  //     filename: getFriendlyTitle() + '.zip'
  //   }
  //   // if (danmaku === null) {
  //   //   const blob = this.makeBlob(data)
  //   //   const filename = getFriendlyTitle() + this.extension()
  //   //   return { blob, filename }
  //   // } else {
  //   //   const zip = new JSZip()
  //   //   zip.file(getFriendlyTitle() + this.extension(), this.makeBlob(data))
  //   //   zip.file(getFriendlyTitle() + '.' + this.danmakuOption.toLowerCase(), danmaku)
  //   //   const blob = await zip.generateAsync({ type: 'blob' })
  //   //   const filename = getFriendlyTitle() + '.zip'
  //   //   return { blob, filename }
  //   // }
  // }
  // async downloadMultiple(downloadedData: any[]) {
  //   const zip = new JSZip()
  //   const title = getFriendlyTitle()
  //   if (downloadedData.length > 1) {
  //     downloadedData.forEach((data, index) => {
  //       const fragment = this.fragments[index]
  //       zip.file(`${title} - ${index + 1}${this.extension(fragment)}`, this.makeBlob(data, fragment))
  //     })
  //   } else {
  //     const [data] = downloadedData
  //     zip.file(`${title}${this.extension()}`, this.makeBlob(data))
  //   }
  //   const danmaku = await this.downloadDanmaku()
  //   if (danmaku !== null) {
  //     zip.file(getFriendlyTitle() + '.' + this.danmakuOption.toLowerCase(), danmaku)
  //   }
  //   const blob = await zip.generateAsync({ type: 'blob' })
  //   const filename = title + '.zip'
  //   return { blob, filename }
  // }
  async download() {
    this.workingXhr = []
    this.progressMap = new Map()
    this.updateProgress()
    const downloadedData: ArrayBuffer[][] = []
    this.videoSpeed.startMeasure()
    for (const fragment of this.fragments) {
      const data = await this.downloadFragment(fragment)
      downloadedData.push(data)
    }
    if (downloadedData.length < 1) {
      throw new Error('下载失败.')
    }

    // let { blob, filename } = await (async () => {
    //   if (downloadedData.length === 1) {
    //     return await this.downloadSingle(downloadedData)
    //   } else {
    //     return await this.downloadMultiple(downloadedData)
    //   }
    // })()
    // this.cleanUpOldBlobUrl()
    // const blobUrl = URL.createObjectURL(blob)
    const title = getFriendlyTitle()
    const pack = new DownloadVideoPackage()
    downloadedData.forEach((data, index) => {
      let filename: string
      const fragment = this.fragments[index]
      if (downloadedData.length > 1) {
        filename = `${title} - ${index + 1}${this.extension(fragment)}`
      } else {
        filename = `${title}${this.extension(fragment)}`
      }
      pack.add(filename, new Blob(Array.isArray(data) ? data : [data], {
        type: this.extension(fragment) === '.flv' ? 'video/x-flv' : 'video/mp4'
      }))
    })
    const danmaku = await this.downloadDanmaku()
    pack.add(
      `${getFriendlyTitle()}.${this.danmakuOption === 'ASS' ? 'ass' : 'xml'}`,
      danmaku
    )
    await pack.emit(title + '.zip')
    this.progress && this.progress(0)
    this.videoSpeed.stopMeasure()
    // return {
    //   url: blobUrl,
    //   filename: filename
    // }
  }
}
class VideoSpeed {
  workingDownloader: VideoDownloader
  lastProgress = 0
  measureInterval = 1000
  intervalTimer: number
  speedUpdate: (speed: string) => void
  constructor(downloader: VideoDownloader) {
    this.workingDownloader = downloader
  }
  startMeasure() {
    this.intervalTimer = setInterval(() => {
      const progress = this.workingDownloader.progressMap
        ? [...this.workingDownloader.progressMap.values()].reduce((a, b) => a + b, 0) : 0
      const loadedBytes = progress - this.lastProgress
      if (this.speedUpdate !== undefined) {
        this.speedUpdate(formatFileSize(loadedBytes) + '/s')
      }
      this.lastProgress = progress
    }, this.measureInterval)
  }
  stopMeasure() {
    clearInterval(this.intervalTimer)
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
  if (document.URL.includes('bangumi')) {
    pageData.entity = new Bangumi()
  } else if (document.URL.includes('cheese')) {
    const match = document.URL.match(/cheese\/play\/ep([\d]+)/)!
    pageData.entity = new Cheese(match[1])
  } else {
    pageData.entity = new Video()
  }
  try {
    formats = await VideoFormat.getAvailableFormats()
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
  let workingDownloader: VideoDownloader
  // const sizeCache = new Map<VideoFormat, number>()
  type ExportType = 'copyLink' | 'showLink' | 'aria2' | 'aria2RPC' | 'copyVLD' | 'exportVLD' | 'ffmpegEpisodes' | 'ffmpegFragments'
  interface EpisodeItem {
    title: string
    checked: boolean
    index: number
    cid: string
    aid: string
  }
  const panel = new Vue({
    el: '.download-video',
    components: {
      VDropdown: () => import('./v-dropdown.vue'),
      VCheckbox: () => import('./v-checkbox.vue'),
      RpcProfiles: () => import('./aria2-rpc-profiles.vue'),
    },
    data: {
      downloadSingle: true,
      coverUrl: EmptyImageUrl,
      aid: pageData.aid,
      cid: pageData.cid,
      dashModel: {
        value: settings.downloadVideoFormat,
        items: ['flv', 'dash'],
      },
      qualityModel: {
        value: selectedFormat!.displayName,
        items: formats.map(f => f.displayName)
      },
      danmakuModel: {
        value: settings.downloadVideoDefaultDanmaku as DanmakuOption,
        items: ['无', 'XML', 'ASS'] as DanmakuOption[]
      },
      codecModel: {
        value: settings.downloadVideoDashCodec,
        items: ['AVC/H.264', 'HEVC/H.265']
      },
      // ffmpegModel: {
      //   value: settings.downloadVideoFfmpegSupport,
      //   items: ['无', '文件列表']
      //   // items: ['无', '文件列表', '文件列表+脚本']
      // },
      progressPercent: 0,
      size: '获取大小中' as number | string,
      blobUrl: '',
      episodeList: [] as EpisodeItem[],
      downloading: false,
      speed: '',
      batch: false,
      rpcSettings: settings.aria2RpcOption,
      showRpcSettings: false,
      busy: false,
      saveRpcSettingsText: '保存配置',
      enableDash: settings.enableDashDownload,
      lastDirectDownloadLink: '',
    },
    computed: {
      displaySize() {
        if (typeof this.size === 'string') {
          return this.size
        }
        return formatFileSize(this.size)
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
      dash() {
        return this.dashModel.value === 'dash'
      },
    },
    methods: {
      close() {
        this.$el.classList.remove('opened')
      },
      danmakuOptionChange() {
        settings.downloadVideoDefaultDanmaku = this.danmakuModel.value
      },
      // ffmpegChange() {
      //   settings.downloadVideoFfmpegSupport = this.ffmpegModel.value
      // },
      async codecChange() {
        settings.downloadVideoDashCodec = this.codecModel.value
        await this.formatChange()
      },
      async dashChange() {
        console.log('dash change')
        settings.downloadVideoFormat = this.dashModel.value
        const format = this.dashModel.value
        let updatedFormats = []
        if (format === 'flv') {
          updatedFormats = await VideoFormat.getAvailableFormats()
        } else {
          updatedFormats = await VideoFormat.getAvailableDashFormats()
        }
        formats = updatedFormats;
        [selectedFormat] = format
        this.qualityModel.items = updatedFormats.map(f => f.displayName);
        [this.qualityModel.value] = this.qualityModel.items
        await this.formatChange()
      },
      async formatChange() {
        console.log('format change')
        const format = this.getFormat() as VideoFormat
        // const cache = sizeCache.get(format)
        // if (cache) {
        //   this.size = cache
        //   return
        // }
        try {
          this.size = '获取大小中'
          const videoDownloader = await format.downloadInfo(this.dash)
          this.size = videoDownloader.totalSize
          // sizeCache.set(format, this.size)
        } catch (error) {
          this.size = '获取大小失败'
          throw error
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
          const videoDownloader = await format.downloadInfo(this.dash)
          switch (type) {
            case 'copyLink':
              await videoDownloader.copyUrl()
              Toast.success('已复制链接到剪贴板.', '下载视频', 3000)
              break
            case 'showLink':
              await videoDownloader.showUrl()
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
            case 'ffmpegFragments':
              console.log('fragments')
              break
            case 'ffmpegEpisodes':
              console.log('episodes')
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
        const episodeFilter = (item: EpisodeItem) => {
          const match = episodeList.find((it: EpisodeItem) => it.cid === item.cid) as EpisodeItem | undefined
          if (match === undefined) {
            return false
          }
          return match.checked
        }
        const format = this.getFormat()
        if (this.danmakuModel.value !== '无') {
          const danmakuToast = Toast.info('下载弹幕中...', '批量导出')
          const pack = new DownloadVideoPackage()
          try {
            if (this.danmakuModel.value === 'XML') {
              for (const item of episodeList.filter(episodeFilter)) {
                const danmakuInfo = new DanmakuInfo(item.cid)
                await danmakuInfo.fetchInfo()
                pack.add(item.title + '.xml', danmakuInfo.rawXML)
              }
            } else {
              const { convertToAss } = await import('../download-danmaku')
              for (const item of episodeList.filter(episodeFilter)) {
                const danmakuInfo = new DanmakuInfo(item.cid)
                await danmakuInfo.fetchInfo()
                pack.add(item.title + '.ass', await convertToAss(danmakuInfo.rawXML))
              }
            }
            await pack.emit(this.cid + '.danmakus.zip')
          } catch (error) {
            logError(`弹幕下载失败`)
          } finally {
            danmakuToast.dismiss()
          }
        }
        const toast = Toast.info('获取链接中...', '批量导出')
        const batchExtractor = this.batchExtractor as BatchExtractor
        batchExtractor.itemFilter = episodeFilter
        let result: string
        try {
          switch (type) {
            case 'aria2':
              result = await batchExtractor.collectAria2(format, toast, false)
              await DownloadVideoPackage.single(
                getFriendlyTitle(false) + '.txt',
                new Blob([result], { type: 'text/plain' }),
                { ffmpeg: this.ffmpegOption }
              )
              return
            case 'aria2RPC':
              await this.batchExtractor.collectAria2(format, toast, true)
              Toast.success(`成功发送了批量请求.`, 'aria2 RPC', 3000)
              return
            case 'copyVLD':
              GM.setClipboard(await this.batchExtractor.collectData(format, toast), { mimetype: 'text/plain' })
              Toast.success('已复制批量vld数据到剪贴板.', '批量导出', 3000)
              return
            case 'exportVLD':
              result = await this.batchExtractor.collectData(format, toast)
              await DownloadVideoPackage.single(
                getFriendlyTitle(false) + '.json',
                new Blob([result], { type: 'text/json' }),
                { ffmpeg: this.ffmpegOption }
              )
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
        const batchExtractor = this.batchExtractor = new BatchExtractor()
        this.batch = true
        this.episodeList = (await batchExtractor.getItemList()).map((item, index) => {
          return {
            aid: item.aid,
            cid: item.cid,
            title: item.title,
            index,
            checked: true,
          } as EpisodeItem
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
          const videoDownloader = await format.downloadInfo(this.dash)
          videoDownloader.videoSpeed.speedUpdate = speed => this.speed = speed
          videoDownloader.progress = percent => {
            this.progressPercent = Math.trunc(percent * 100)
          }
          workingDownloader = videoDownloader
          await videoDownloader.download()
          this.lastDirectDownloadLink = DownloadVideoPackage.lastPackageUrl
        }
        catch (error) {
          if (error !== 'canceled') {
            logError(error)
          }
          this.progressPercent = 0
        }
        finally {
          this.downloading = false
          this.speed = ''
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
        const profile = settings.aria2RpcOptionProfiles.find(p => p.name === settings.aria2RpcOptionSelectedProfile)
        if (profile) {
          Object.assign(profile, this.rpcSettings)
          settings.aria2RpcOptionProfiles = settings.aria2RpcOptionProfiles
        }
        this.saveRpcSettingsText = '已保存'
        setTimeout(() => this.saveRpcSettingsText = '保存配置', 2000)
      },
      updateProfile(profile: RpcOptionProfile) {
        settings.aria2RpcOption = this.rpcSettings = _.omit(profile, 'name') as RpcOption
      }
    },
    async mounted() {
      // if (settings.downloadVideoFormat === 'dash') {
      //   console.log('init set dash')
      //   this.dashModel.value = 'dash'
      //   await this.dashChange()
      // }
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
    try {
      const videoInfo = new VideoInfo(pageData.aid)
      await videoInfo.fetchInfo()
      panel.coverUrl = videoInfo.coverUrl.replace('http:', 'https:')
    } catch (error) {
      panel.coverUrl = EmptyImageUrl
    }

    // formats = await VideoFormat.getAvailableFormats();
    // [selectedFormat] = formats
    // panel.qualityModel = {
    //   value: selectedFormat.displayName,
    //   items: formats.map(f => f.displayName)
    // }
    panel.dashChange()
    await panel.checkBatch()
  })
}

export default {
  widget: {
    content: /*html*/`
      <button class="gui-settings-flat-button" style="position: relative; z-index: 100;" id="download-video">
        <i class="icon-download"></i>
        <span>下载视频</span>
      </button>`,
    condition: loadPageData,
    success: loadWidget,
  },
}
