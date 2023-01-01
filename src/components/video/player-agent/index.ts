import { bangumiUrls, matchCurrentPage } from '@/core/utils/urls'
import { BangumiPlayerAgent } from './bangumi'
import { VideoPlayerMixedAgent } from './video-player-mixed'

export const playerAgent = (() => {
  if (matchCurrentPage(bangumiUrls)) {
    return new BangumiPlayerAgent()
  }
  return new VideoPlayerMixedAgent()
})()
