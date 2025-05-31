import { getJsonWithCredentials, getText } from '@/core/ajax'

export interface UpInfo {
  uid: number
  name: string
  faceUrl: string
}

export interface VideoPageInfo {
  cid: number
  title: string
  pageNumber: number
}

export class VideoInfo {
  aid: string
  bvid: string
  cid: number
  pubdate: number
  ctime: number
  createTime: Date
  pageCount: number
  coverUrl: string
  tagId: number
  tagName: string
  title: string
  description: string
  up: UpInfo
  pages: VideoPageInfo[]

  constructor(id: string, bvid = false) {
    if (bvid) {
      this.bvid = id
    } else {
      this.aid = id
    }
  }
  async fetchInfo() {
    let url: string
    if (this.aid) {
      url = `https://api.bilibili.com/x/web-interface/view?aid=${this.aid}`
    } else if (this.bvid) {
      url = `https://api.bilibili.com/x/web-interface/view?bvid=${this.bvid}`
    }
    if (this.cid) {
      url = `${url}&cid=${this.cid}`
    }
    const json = await getJsonWithCredentials(url)
    if (json.code !== 0) {
      throw new Error(json.message)
    }
    const { data } = json
    this.aid = data.aid
    this.bvid = data.bvid
    this.cid = data.cid
    this.pubdate = data.pubdate
    this.ctime = data.ctime
    this.pageCount = data.videos
    this.coverUrl = data.pic.replace('http:', 'https:')
    this.tagId = data.tid
    this.tagName = data.tname
    this.title = data.title
    this.description = data.desc
    this.up = {
      uid: data.owner.mid,
      name: data.owner.name,
      faceUrl: data.owner.face.replace('http:', 'https:'),
    }
    this.pages = data.pages.map((it: any) => ({
      cid: it.cid,
      title: it.part,
      pageNumber: it.page,
    }))
    return this
  }

  /** @deprecated */
  get subtitles(): {
    id: number
    languageCode: string
    language: string
    url: string
  }[] {
    console.warn('VideoInfo.subtitles is deprecated')
    return []
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
    const data = await getText(`https://www.bilibili.com/bangumi/play/ep${this.ep}/`)
    const json = JSON.parse(data.match(/window\.__INITIAL_STATE__=(.*);\(function\(\){/)[1])
    this.title = json.mediaInfo.title
    this.cover = json.mediaInfo.cover
    this.squareCover = json.mediaInfo.square_cover
    this.aid = json.epInfo.aid
    this.cid = json.epInfo.cid
    this.videos = json.epList.map(async (it: any) => ({
      title: it.index_title,
      aid: it.aid,
      cid: it.cid,
      info: await new VideoInfo(it.aid).fetchInfo(),
    }))
    return this
  }
}
