export class VideoInfo {
  aid: string
  cid: number
  pageCount: number
  coverUrl: string
  tagId: number
  tagName: string
  title: string
  description: string
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
  danmaku: DanmakuInfo
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
      throw new Error(json.message)
    }
    const data = json.data
    this.cid = data.cid
    this.pageCount = data.videos
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
    this.danmaku = new DanmakuInfo(this.cid.toString())
    return this.danmaku.fetchInfo()
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
export class DanmakuInfo {
  rawXML: string
  // xml: HTMLElement
  // danmakus: Danmaku[]
  constructor(public cid: string | number) {
  }
  async fetchInfo() {
    const xml = await Ajax.getText(`https://api.bilibili.com/x/v1/dm/list.so?oid=${this.cid}`)
    this.rawXML = xml
    // const dom = new DOMParser().parseFromString(xml, 'application/xml').documentElement
    // this.xml = dom
    // this.danmakus = [...dom.querySelectorAll('d[p]')].map(it => {
    //   return new Danmaku(it.innerHTML, it.getAttribute('p')!)
    // })
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
    VideoInfo: VideoInfo,
    BangumiInfo: BangumiInfo,
    Danmaku: Danmaku,
    DanmakuInfo: DanmakuInfo
  }
}
