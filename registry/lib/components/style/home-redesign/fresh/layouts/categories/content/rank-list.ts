export interface RankListCard {
  id: string
  title: string
  videoHref: string
  coverUrl: string
  upFaceUrl?: string
  upHref: string
  upName: string
  points: number
  playCount: number
  dynamic?: string
}
export const rankListCssVars = {
  panelWidth: 400,
  panelHeight: 604,
  padding: 12,
  rankItemHeight: 110,
  rankItemMargin: 24,
  rankItemTitleHeight: 20,
  firstCoverHeight: 225,
  firstCoverWidth: 350,
  secondCoverHeight: 110,
  secondCoverWidth: 168,
  thirdCoverHeight: 90,
  thirdCoverWidth: 139,
}
export const compactRankListCssVars = {
  panelWidth: 376,
  panelHeight: 580,
  padding: 0,
}
