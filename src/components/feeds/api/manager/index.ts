import { getCookieValue, matchUrlPattern } from '@/core/utils'
import { feedsUrls } from '@/core/utils/urls'
import { FeedsCardCallback } from '../types'
import { feedsCardCallbacks } from './base'
import { FeedsCardsManagerV1 } from './v1'
import { FeedsCardsManagerV2 } from './v2'

export * from './base'
export const isV2Feeds = () => {
  const hasCookieValue = parseInt(getCookieValue('hit-dyn-v2')) > 0
  if (!hasCookieValue) {
    return false
  }
  return [
    't.bilibili.com',
    'space.bilibili.com',
    /^https:\/\/www\.bilibili\.com\/opus\/[\d]+$/,
  ].some(pattern => matchUrlPattern(pattern))
}
export const feedsCardsManager = (() => {
  const isV2 = isV2Feeds()
  if (isV2) {
    return new FeedsCardsManagerV2()
  }
  return new FeedsCardsManagerV1()
})()
/**
 * 为每个动态卡片执行特定操作
 * @param callback 回调函数
 */
export const forEachFeedsCard = async (callback: FeedsCardCallback) => {
  if (feedsUrls.every(url => !matchUrlPattern(url))) {
    return null
  }

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
