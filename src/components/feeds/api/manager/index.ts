import { getCookieValue } from '@/core/utils'
import { FeedsCardCallback } from '../types'
import { feedsCardCallbacks } from './base'
import { FeedsCardsManagerV1 } from './v1'
import { FeedsCardsManagerV2 } from './v2'

export * from './base'
export const feedsCardsManager = (() => {
  const isV2Feeds = parseInt(getCookieValue('hit-dyn-v2')) > 0
  if (isV2Feeds) {
    return new FeedsCardsManagerV2()
  }
  return new FeedsCardsManagerV1()
})()
/**
 * 为每个动态卡片执行特定操作
 * @param callback 回调函数
 */
export const forEachFeedsCard = async (callback: FeedsCardCallback) => {
  const success = await feedsCardsManager.startWatching()
  if (!success) {
    console.error('feedsCardsManager.startWatching() failed')
    return null
  }

  const { added } = callback
  if (added) {
    feedsCardsManager.cards.forEach(c => added(c))
  }
  feedsCardCallbacks.push({ added: none, removed: none, ...callback })
  return feedsCardsManager
}
