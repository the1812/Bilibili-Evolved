import { Package } from '..'

export const pack: Package = {
  name: 'cleaner',
  displayName: '简洁至上',
  description: '简化各种多余界面元素, 专注于内容本身.',
  components: [
    'removePromotions',
    'removeLiveWatermark',
    'removePlayerPopup',
    'disableSpecialDanmaku',
    'simplifyComments',
    'simplifyLiveroom',
    'collapseLiveSideBar',
    'hideRelatedVideos',
    'hideRecommendedLive',
    'hideVideoTopMask',
  ],
}
