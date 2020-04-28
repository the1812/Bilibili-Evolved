
export interface VideoCardInfo {
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
  topics?: {
    id: number
    name: string
  }[]
  type?: string
  points?: number
  watchlater?: boolean
}