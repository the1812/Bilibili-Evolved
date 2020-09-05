import { VideoCardInfo } from './video-card-info'
export const getTrendingVideos = (): VideoCardInfo[] => {
  // const json = await Ajax.getJsonWithCredentials(
  //   `https://api.bilibili.com/x/web-interface/ranking/index?day=${days}`
  // )
  // if (getUID() && watchlaterList === undefined) {
  //   const { getWatchlaterList } = await import(
  //     '../../video/watchlater-api'
  //   )
  //   watchlaterList = await getWatchlaterList()
  // }
  // if (json.code !== 0) {
  //   throw new Error(json.message)
  // }
  // return json.data.map(
  //   (card: any) => ({
  //     id: card.aid + '-' + days,
  //     aid: parseInt(card.aid),
  //     title: card.title,
  //     upID: card.mid,
  //     upName: card.author,
  //     coverUrl: card.pic.replace('http://', 'https://'),
  //     description: card.description,
  //     durationText: card.duration,
  //     playCount: formatCount(card.play),
  //     coins: formatCount(card.coins),
  //     favorites: formatCount(card.favorites),
  //     watchlater: true,
  //     // watchlater: watchlaterList ? watchlaterList.includes(parseInt(card.aid)) : null
  //   })
  // )
  if (!unsafeWindow.__INITIAL_STATE__) {
    throw new Error('unsafeWindow.__INITIAL_STATE__ not available')
  }
  return unsafeWindow.__INITIAL_STATE__.recommendList.map(
    (it: any) => {
      return {
        id: it.aid,
        aid: it.aid,
        bvid: it.bvid,
        timestamp: it.ctime * 1000,
        time: new Date(it.ctime * 1000),
        description: it.desc,
        duration: it.duration,
        durationText: formatDuration(it.duration),
        coverUrl: it.pic.replace('http:', 'https:'),
        title: it.title,
        coins: formatCount(it.stat.coin),
        danmakuCount: formatCount(it.stat.danmaku),
        // favorites: formatCount(it.stat.favorite),
        like: formatCount(it.stat.like),
        playCount: formatCount(it.stat.view),
        upName: it.owner.name,
        upFaceUrl: it.owner.face.replace('http:', 'https:'),
      } as VideoCardInfo
    },
  )
}
export default {
  export: {
    getTrendingVideos,
  },
}