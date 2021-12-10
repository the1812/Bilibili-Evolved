/** 直播项目 */
export interface LiveFeedItem {
  /** 房间号 */
  id: number
  /** 标题 */
  title: string
  /** up主名字 */
  upName: string
  /** up主头像 */
  upFaceUrl: string
  /** 直播间链接 */
  url: string
  /** 直播间封面 */
  coverUrl?: string
}
