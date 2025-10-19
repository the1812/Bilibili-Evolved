import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'

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
  redirectUrl?: string

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
    this.redirectUrl = data.redirect_url
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

/**
 * @author WakelessSloth56, LainIO24
 */
export interface EpisodeInfo {
  aid: string
  bvid: string
  cid: number
  epid: number
  title: string
  cover: string
  duration: number
  skip: {
    [x in 'ed' | 'op']: { start: number; end: number }
  }
  section: string
  info?: VideoInfo
}

/**
 * @author WakelessSloth56
 */
export interface SectionInfo {
  title: string
  episodes: EpisodeInfo[]
}

/**
 * @author WakelessSloth56, LainIO24
 */
export class BangumiInfo {
  private readonly epid: number
  private readonly ssid: number

  mediaId: number
  seasonId: number
  seasonTitle: string
  seriesId: number
  seriesTitle: string
  /** @deprecated use {@link BangumiInfo.seasonTitle} instead */
  title: string
  cover: string
  squareCover: string
  areas: { id: number; name: string }[]
  /** 简介 */
  evaluate: string
  isFinish: boolean
  isStarted: boolean
  styles: string[]
  /** 通过 {@link BangumiInfo.byEpisodeId()} 指定的 `epid` 对应的集，若通过 {@link BangumiInfo.bySeasonId()} 则不存在 */
  episode?: EpisodeInfo
  /** 包含正片及花絮、PV、番外等非正片内容 */
  episodes: EpisodeInfo[]
  /** 花絮、PV、番外等非正片内容 */
  sections?: SectionInfo[]
  /** @deprecated use {@link BangumiInfo.episodes} instead */
  videos: {
    title: string
    aid: number
    cid: number
    info: VideoInfo
  }[] = []

  private constructor(epid: number, ssid: number) {
    this.epid = epid
    this.ssid = ssid
  }

  public static byEpisodeId(epid: number) {
    return new BangumiInfo(epid, null)
  }

  public static bySeasonId(ssid: number) {
    return new BangumiInfo(null, ssid)
  }

  async fetchInfo() {
    let url = 'https://api.bilibili.com/pgc/view/web/season?'
    if (this.epid) {
      url += `ep_id=${this.epid}`
    } else if (this.ssid) {
      url += `season_id=${this.ssid}`
    }
    const data = await bilibiliApi(getJsonWithCredentials(url))
    this.mediaId = data.media_id
    this.seasonId = data.season_id
    this.seasonTitle = data.season_title
    this.title = data.season_title
    this.seriesId = data.series.series_id
    this.seriesTitle = data.series.series_title
    this.cover = data.cover
    this.squareCover = data.square_cover
    this.evaluate = data.evaluate
    this.isFinish = data.publish.is_finish === 1
    this.isStarted = data.publish.is_started === 1
    this.styles = data.styles
    this.areas = data.areas
    this.sections = data.section
    const episodes = [
      ...data.episodes.map((ep: EpisodeInfo) => {
        ep.section = data.positive.title
        return ep
      }),
      ...(data.section ?? [])
        .flatMap((x: SectionInfo) => {
          return x.episodes.map((ep: EpisodeInfo) => {
            ep.section = x.title
            return ep
          })
        })
        // 有些内容（例如次元发电机专访）是链接，cid、aid等为0
        .filter(x => x.cid > 0),
    ]
    this.episodes = episodes.map(x => {
      const r: EpisodeInfo = {
        aid: x.aid,
        bvid: x.bvid,
        cid: x.cid,
        epid: x.ep_id,
        title: x.show_title,
        cover: x.cover,
        duration: x.duration / 1000,
        skip: x.skip,
        section: x.section,
      }
      if (r.epid === this.epid) {
        this.episode = r
      }
      return r
    })
    return this
  }

  async fetchInfoWithEpisodes() {
    await this.fetchInfo()
    this.episodes.forEach(async r => {
      const info = new VideoInfo(r.aid)
      info.cid = r.cid
      r.info = await info.fetchInfo()
      if (r.epid === this.epid) {
        this.episode = r
      }
    })
  }
}
