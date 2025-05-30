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
  danmakuCount: number
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
export const PGCSeasonTypeMap = {
  anime: 1,
  movie: 2,
  guochuang: 3,
  documentary: 4,
  tv: 5,
}
export const getDefaultRankListCards = (json: any): RankListCard[] => {
  const items = (lodash.get(json, 'data.list', []) || []) as any[]
  const cards = items.map(
    (item): RankListCard => ({
      id: item.aid,
      title: item.title,
      playCount: item.stat.view,
      danmakuCount: item.stat.danmaku,
      points: item.score,
      upHref: `https://space.bilibili.com/${item.owner.mid}`,
      upName: item.owner.name,
      dynamic: item.dynamic || item.desc,
      coverUrl: item.pic,
      videoHref: `https://www.bilibili.com/video/${item.bvid}`,
    }),
  )
  return cards
}
export const getBangumiRankListCards = (json: any): RankListCard[] => {
  const items = (lodash.get(json, 'data.list', []) || []) as any[]
  const cards = items.map((item): RankListCard => {
    const upName = item.new_ep?.index_show ?? item.title
    return {
      id: item.season_id,
      title: item.title,
      playCount: item.stat.view,
      danmakuCount: item.stat.danmaku,
      points: item.stat.follow,
      upHref: item.url,
      upName,
      dynamic: upName,
      coverUrl: item.new_ep?.cover ?? item.ss_horizontal_cover,
      videoHref: item.url,
    }
  })
  return cards
}
