import { bangumiUrls, matchCurrentPage } from '@/core/utils/urls'
import { BangumiPlayerAgent } from './bangumi-player'
import { VideoPlayerBpxAgent } from './video-player'

export * from './types'

export const playerAgent = (() => {
  if (matchCurrentPage(bangumiUrls)) {
    return new BangumiPlayerAgent()
  }
  return new VideoPlayerBpxAgent()
})()
