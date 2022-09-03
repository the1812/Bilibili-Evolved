import { applyContentFilter } from '@/components/feeds/api'
import { VideoCard } from '@/components/feeds/video-card'
import { getJson, getJsonWithCredentials } from '@/core/ajax'
import { getUID } from '@/core/utils'
import { formatDuration, formatCount } from '@/core/utils/formatters'

export const getTrendingVideos = async (isPersonalized: boolean) => {
  const api = 'https://api.bilibili.com/x/web-interface/index/top/feed/rcmd'

  const personalized = Boolean(getUID()) && isPersonalized
  const requestMethod = personalized ? getJsonWithCredentials : getJson
  const { code, message, data } = await requestMethod(api)
  if (code !== 0) {
    throw new Error(`获取${personalized ? '推荐' : '热门'}视频失败: ${message}`)
  }
  const list: any[] = data.item
  const cards = list.map(it => {
    const card: VideoCard = {
      id: it.id,
      aid: it.id,
      bvid: it.bvid,
      coverUrl: it.pic.replace('http:', 'https:'),
      title: it.title,
      description: '',
      dynamic: '',
      duration: it.duration,
      durationText: formatDuration(it.duration),
      timestamp: it.pubdate * 1000,
      time: new Date(it.pubdate * 1000),
      upName: it.owner.name,
      upID: it.owner.mid,
      upFaceUrl: it.owner.face.replace('http:', 'https:'),
      like: formatCount(it.stat.like),
      playCount: formatCount(it.stat.view),
      danmakuCount: formatCount(it.stat.danmaku),
    }
    return card
  })
  return applyContentFilter(cards)
}
