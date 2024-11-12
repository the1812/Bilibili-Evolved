import { Package } from '..'

export const pack: Package = {
  name: 'starter',
  displayName: '常用功能包',
  description: '提供一些常用功能.',
  components: [
    'elegantScrollbar',
    'customNavbar',
    'removePromotions',
    'columnUnlock',
    'urlParamsClean',
    'keymap',
    'viewCover',
    'bvidConvert',
    'removeLiveWatermark',
    'liveDanmakuSendbar',
    'liveGiftBox',
    'fullFeedsContent',
    'unfoldFeeds',
    'foldComments',
    'disableFeedsDetails',
    'fullVideoDescription',
  ],
  plugins: ['settingsPanel.tagFilters.recentComponents'],
}
