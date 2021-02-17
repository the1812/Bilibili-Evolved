export class JsonDanmaku {
  // static SegmentSize = 6 * 60
  public jsonDanmakus: {
    id: number
    idStr: string
    progress: number
    mode: number
    fontsize: number
    color: number
    midHash: string
    content: string
    ctime: number
    weight: number
    action: string
    pool: number
    attr: number
  }[] = []
  constructor(
    public aid: number | string,
    public cid: number | string,
  ) { }
  // get segmentCount() {
  //   return Math.ceil(this.duration / JsonDanmaku.SegmentSize)
  // }
  get xmlDanmakus() {
    return this.jsonDanmakus.map(json => {
      return {
        content: json.content,
        time: json.progress ? (json.progress / 1000).toString() : '0',
        type: json.mode?.toString() ?? '1',
        fontSize: json.fontsize?.toString() ?? '25',
        color: json.color?.toString() ?? '16777215',
        timeStamp: json.ctime?.toString() ?? '0',
        pool: json.pool?.toString() ??'0',
        userHash: json.midHash ?? '0',
        rowId: json.idStr ?? '0',
      }
    })
  }
  async fetchInfo() {
    const { decodeDanmakuSegment, decodeDanmakuView } = await import('./danmaku-converter/danmaku-segment')
    // 这里为了兼容 pakku, 只能用 fetch https://github.com/xmcp/pakku.js/issues/153
    const fetchBlob = async (url: string) => {
      const response = await fetch(url)
      return response.blob()
    }
    const viewBlob = await fetchBlob(`https://api.bilibili.com/x/v2/dm/web/view?type=1&oid=${this.cid}&pid=${this.aid}`)
    if (!viewBlob) {
      throw new Error(`获取弹幕信息失败`)
    }
    const view = await decodeDanmakuView(viewBlob)
    const { total } = view.dmSge
    if (total === undefined) {
      throw new Error(`获取弹幕分页数失败: ${JSON.stringify(_.omit(view, 'flag'))}`)
    }
    console.log('segment count =', total)
    const segments = await Promise.all(new Array(total).fill(0).map(async (_, index) => {
      const blob = await fetchBlob(`https://api.bilibili.com/x/v2/dm/web/seg.so?type=1&oid=${this.cid}&pid=${this.aid}&segment_index=${index + 1}`)
      if (!blob) {
        logError(new Error(`弹幕片段${index + 1}下载失败`))
        return []
      }
      console.log(`received blob for segment ${index + 1}`, blob)
      const result = await decodeDanmakuSegment(blob)
      return result.elems ?? []
    }))
    this.jsonDanmakus = segments.flat().sort(ascendingSort(it => it.progress))
    return this
  }
}
export class VideoInfo {
  aid: string
  bvid: string
  cid: number
  pageCount: number
  duration: number
  coverUrl: string
  tagId: number
  tagName: string
  title: string
  description: string
  createTime: number
  publishTime: number
  up: {
    uid: number
    name: string
    faceUrl: string
  }
  pages: {
    cid: number
    title: string
    pageNumber: number
  }[]
  danmaku: JsonDanmaku
  // danmaku: DanmakuInfo
  subtitles: {
    id: number
    languageCode: string
    language: string
    url: string
  }[]

  constructor(aid: string) {
    this.aid = aid
  }
  async fetchInfo() {
    let url
    if (this.cid) {
      url = `https://api.bilibili.com/x/web-interface/view?aid=${this.aid}&cid=${this.cid}`
    } else {
      url = `https://api.bilibili.com/x/web-interface/view?aid=${this.aid}`
    }
    const json = JSON.parse(await Ajax.getText(url))
    if (json.code !== 0) {
      throw new Error(`${json.message}: aid = ${this.aid}, cid = ${this.cid}, url = ${document.URL}`)
    }
    const data = json.data
    this.cid = data.cid
    this.bvid = data.bvid
    this.pageCount = data.videos
    this.duration = data.duration
    this.createTime = data.ctime * 1000
    this.publishTime = data.pubtime * 1000
    this.coverUrl = data.pic.replace('http:', 'https:')
    this.tagId = data.tid
    this.tagName = data.tname
    this.title = data.title
    this.description = data.desc
    this.up = {
      uid: data.owner.mid,
      name: data.owner.name,
      faceUrl: data.owner.face.replace('http:', 'https:')
    }
    this.pages = data.pages.map((it: any) => {
      return {
        cid: it.cid,
        title: it.part,
        pageNumber: it.page
      }
    })
    this.subtitles = data.subtitle.list.map((it: any) => {
      return {
        id: it.id,
        languageCode: it.lan,
        language: it.lan_doc,
        url: it.subtitle_url.replace('http:', 'https:'),
      }
    })
    return this
  }
  async fetchDanmaku() {
    this.danmaku = new JsonDanmaku(this.aid, this.cid)
    await this.danmaku.fetchInfo()
    return this
  }
}
export class Danmaku {
  text: string
  p: string
  constructor(text: string, p: string) {
    this.text = text
    this.p = p
  }
}
/** @deprecated use JsonDanmaku instead */
export class DanmakuInfo {
  rawXML: string
  // xml: HTMLElement
  // danmakus: Danmaku[]
  constructor(public cid: string | number) {
  }
  async fetchInfo() {
    console.warn('Deprecated warning: DanmakuInfo is deprecated, use JsonDanmaku instead.')
    const xml = await Ajax.getText(`https://api.bilibili.com/x/v1/dm/list.so?oid=${this.cid}`)
    this.rawXML = xml
    // const dom = new DOMParser().parseFromString(xml, 'application/xml').documentElement
    // this.xml = dom
    // this.danmakus = [...dom.querySelectorAll('d[p]')].map(it => {
    //   return new Danmaku(it.innerHTML, it.getAttribute('p')!)
    // })
    return this
  }
}
export class BangumiInfo {
  ep: number
  videos: {
    title: string
    aid: number
    cid: number
    info: VideoInfo
  }[]
  title: string
  cover: string
  squareCover: string
  aid: number
  cid: number
  constructor(ep: number) {
    this.ep = ep
    this.videos = []
  }
  async fetchInfo() {
    const data = await Ajax.getText(`https://www.bilibili.com/bangumi/play/ep${this.ep}/`)
    const json = JSON.parse(data.match(/window\.__INITIAL_STATE__=(.*);\(function\(\){/)![1])
    this.title = json.mediaInfo.title
    this.cover = json.mediaInfo.cover
    this.squareCover = json.mediaInfo.square_cover
    this.aid = json.epInfo.aid
    this.cid = json.epInfo.cid
    this.videos = json.epList.map(async (it: any) => {
      return {
        title: it.index_title,
        aid: it.aid,
        cid: it.cid,
        info: await new VideoInfo(it.aid).fetchInfo()
      }
    })
    return this
  }
}
export default {
  export: {
    VideoInfo,
    BangumiInfo,
    Danmaku,
    DanmakuInfo,
    JsonDanmaku,
  }
}
