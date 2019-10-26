import { VideoCardInfo } from './video-card-info'
export const getTrendingVideos = async (days: number, watchlaterList?: number[]): Promise<VideoCardInfo[]> => {
  const json = await Ajax.getJsonWithCredentials(
    `https://api.bilibili.com/x/web-interface/ranking/index?day=${days}`
  )
  if (watchlaterList === undefined) {
    const { getWatchlaterList } = await import(
      '../../video/watchlater-api'
    )
    watchlaterList = await getWatchlaterList()
  }
  if (json.code !== 0) {
    throw new Error(json.message)
  }
  return json.data.map(
    (card: any) => ({
      id: card.aid + '-' + days,
      aid: parseInt(card.aid),
      title: card.title,
      upID: card.mid,
      upName: card.author,
      coverUrl: card.pic.replace('http://', 'https://'),
      description: card.description,
      durationText: card.duration,
      playCount: formatCount(card.play),
      coins: formatCount(card.coins),
      favorites: formatCount(card.favorites),
      watchlater: watchlaterList!.includes(parseInt(card.aid))
    })
  )
}
export default {
  export: {
    getTrendingVideos,
  },
}