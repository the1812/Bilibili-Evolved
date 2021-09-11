import { VideoCardInfo } from './video-card-info'

export const getTrendingVideos = async () => {
  const { isVideoCardBlocked } = await import('../../activity/feeds-apis')
  const api = 'https://api.bilibili.com/x/web-interface/index/top/rcmd?fresh_type=0&version=1'
  const personalized = getUID() && settings.simpleHomePersonalized
  const requestMethod: keyof typeof Ajax = personalized ? 'getJsonWithCredentials' : 'getJson'
  const { code, message, data } = await Ajax[requestMethod](api)
  if (code !== 0) {
    throw new Error(`获取${personalized ? '推荐' : '热门'}视频失败: ${message}`)
  }
  const list: any[] = data.item
  return list.map(it => {
    const card: VideoCardInfo = {
      id: it.id,
      aid: it.id,
      bvid: it.bvid,
      coverUrl: it.pic.replace('http:', 'https:'),
      title: it.title,
      description: '',
      duration: it.duration,
      durationText: formatDuration(it.duration),
      timestamp: it.pubdate * 1000,
      time: new Date(it.pubdate * 1000),
      upName: it.owner.name,
      upID: it.owner.mid,
      upFaceUrl: it.owner.face.replace('http:', 'https:'),
      like: formatCount(it.stat.like),
      playCount: formatCount(it.stat.view),
    }
    return card
  }).filter(card => !isVideoCardBlocked(card))
}
export default {
  export: {
    getTrendingVideos,
  },
}