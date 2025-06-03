export interface Topic {
  id: number
  name: string
  url?: string
}
export interface Cooperation {
  id: number
  name: string
  faceUrl: string
}

/** 视频卡片信息 */
export interface VideoCard {
  id: string
  aid?: number
  bvid?: string
  epID?: number
  title: string
  upID?: number
  upName: string
  upFaceUrl?: string
  coverUrl: string
  description: string
  duration?: number
  durationText: string
  playCount: string
  danmakuCount?: string
  dynamic?: string
  like?: string
  coins?: string
  favorites?: string
  timestamp?: number
  time?: Date
  topics?: Topic[]
  type?: string
  points?: number
  watchlater?: boolean
  cooperation?: Cooperation[]
}
