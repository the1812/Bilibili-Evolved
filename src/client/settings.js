export const customNavbarDefaultOrders = {
  blank1: 0,
  logo: 1,
  category: 2,
  rankingLink: 3,
  drawingLink: 4,
  musicLink: 5,
  gamesIframe: 6,
  livesIframe: 7,
  matchLink: 8,
  shopLink: 9,
  mangaLink: 10,
  blank2: 11,
  search: 12,
  blank3: 13,
  userInfo: 14,
  messages: 15,
  activities: 16,
  bangumi: 17,
  watchlaterList: 18,
  favoritesList: 19,
  historyList: 20,
  upload: 21,
  darkMode: 22,
}
export const simpleHomeCategoryDefaultOrders = {
  anime: 0,
  bangumi: 1,
  china: 2,
  music: 3,
  dance: 4,
  game: 5,
  tech: 6,
  digital: 7,
  life: 8,
  food: 9,
  animal: 10,
  kichiku: 11,
  fashion: 12,
  information: 13,
  entertainment: 14,
  movie: 15,
  tv: 16,
  film: 17,
  documentary: 18,
}
export const aria2RpcDefaultOption = {
  secretKey: '',
  dir: '',
  host: '127.0.0.1',
  port: '6800',
  method: 'get',
  other: '',
}
export const settings = {
  useDarkStyle: false,
  // showBanner: true,
  hideBanner: false,
  expandDanmakuList: true,
  expandDanmakuListIgnoreMediaList: true,
  expandDescription: true,
  watchLaterRedirect: true,
  touchNavBar: false,
  touchVideoPlayer: false,
  customControlBackgroundOpacity: 0.64,
  customControlBackground: false,
  darkScheduleStart: '18:00',
  darkScheduleEnd: '6:00',
  darkSchedule: false,
  toast: true,
  fullTweetsTitle: true,
  fullPageTitle: false,
  removeVideoTopMask: false,
  removeLiveWatermark: true,
  harunaScale: true,
  removeAds: true,
  showBlockedAdsTip: false,
  hideTopSearch: false,
  touchVideoPlayerDoubleTapControl: false,
  customStyleColor: '#00A0D8',
  preserveRank: true,
  blurBackgroundOpacity: 0.382,
  useDefaultPlayerMode: false,
  applyPlayerModeOnPlay: true,
  defaultPlayerMode: '常规',
  defaultVideoQuality: '自动',
  defaultPlayerLayout: '新版',
  defaultBangumiLayout: '新版',
  skipChargeList: false,
  comboLike: false,
  autoLightOff: false,
  useCache: true,
  allowJumpContinue: false,
  airborne: true,
  deadVideoTitleProvider: '稍后再看',
  useBiliplusRedirect: false,
  biliplusRedirect: false,
  framePlayback: true,
  useCommentStyle: true,
  imageResolution: false,
  imageResolutionScale: 'auto',
  toastInternalError: false,
  i18n: false,
  i18nLanguage: '日本語',
  playerFocus: false,
  playerFocusOffset: -10,
  simplifyLiveroom: false,
  simplifyLiveroomSettings: {
    vip: true,
    fansMedal: true,
    title: true,
    userLevel: true,
    guard: true,
    systemMessage: true,
    welcomeMessage: true,
    giftMessage: true,
    guardPurchase: true,
    giftPanel: true,
    kanban: true,
    userEffect: true,
    eventsBanner: false,
    rankList: false,
    popup: false,
    pk: false,
    topRank: true,
    skin: false,
  },
  customNavbar: true,
  customNavbarFill: false,
  customNavbarTransparent: true,
  customNavbarShadow: true,
  customNavbarBlur: false,
  customNavbarBlurOpacity: 0.7,
  customNavbarOrder: { ...customNavbarDefaultOrders },
  customNavbarHidden: ['blank1', 'drawingLink', 'musicLink', 'gamesIframe', 'match', 'darkMode'],
  customNavbarBoundsPadding: 10,
  customNavbarGlobalFixed: false,
  customNavbarShowDeadVideos: false,
  playerShadow: false,
  narrowDanmaku: true,
  outerWatchlater: true,
  videoScreenshot: false,
  hideBangumiReviews: false,
  filenameFormat: '[title][ - ep]',
  batchFilenameFormat: '[n - ][ep]',
  sideBarOffset: 0,
  noLiveAutoplay: false,
  hideHomeLive: false,
  noMiniVideoAutoplay: false,
  useDefaultVideoSpeed: false,
  defaultVideoSpeed: '1.0',
  foldComment: true,
  downloadVideoDefaultDanmaku: '无',
  downloadVideoDefaultSubtitle: '无',
  aria2RpcOption: { ...aria2RpcDefaultOption },
  aria2RpcOptionSelectedProfile: '',
  aria2RpcOptionProfiles: [],
  searchHistory: [],
  autoDraw: false,
  keymap: false,
  keymapPreset: 'Default',
  doubleClickFullscreen: false,
  doubleClickFullscreenPreventSingleClick: false,
  simplifyHome: false,
  simplifyHomeStyle: '清爽',
  minimalHomeSettings: {
    showSearch: true,
    backgroundImage: '',
  },
  ajaxHook: false,
  scriptLoadingMode: '延后(自动)',
  scriptDownloadMode: 'bundle',
  guiSettingsDockSide: '左侧',
  fullActivityContent: true,
  feedsFilter: false,
  feedsFilterPatterns: [],
  feedsFilterTypes: [],
  feedsSpecialFilterTypes: [],
  feedsFilterSideCards: [],
  activityImageSaver: false,
  scriptBlockPatterns: [],
  customNavbarSeasonLogo: false,
  selectableColumnText: true,
  downloadVideoFormat: 'flv',
  downloadVideoDashCodec: 'AVC/H.264',
  watchlaterExpireWarningDays: 14,
  miniPlayerTouchMove: false,
  hideBangumiSponsors: false,
  hideRecommendLive: false,
  hideRelatedVideos: false,
  defaultMedalID: 0,
  autoMatchMedal: false,
  customStyles: [],
  simpleHomeCategoryOrders: { ...simpleHomeCategoryDefaultOrders },
  simpleHomeBangumiLayout: '时间表',
  simpleHomeWheelScroll: true,
  keymapJumpSeconds: 85,
  urlParamsClean: true,
  collapseLiveSideBar: true,
  noDarkOnMember: true,
  feedsTranslate: false,
  feedsTranslateProvider: 'Bing',
  feedsTranslateLanguage: '',
  commentsTranslate: false,
  downloadVideoQuality: 120,
  defaultLiveQuality: '原画',
  foregroundColorMode: '自动',
  preserveEventBanner: false,
  bvidConvert: true,
  fixedSidebars: false,
  updateCdn: 'jsDelivr',
  lastNewVersionCheck: 0,
  newVersionCheckInterval: 1000 * 3600 * 6, // 6 hours
  useDarkStyleAsUserStyle: false,
  darkColorScheme: false,
  autoHideSideBar: false,
  livePip: true,
  extendFeedsLive: true,
  userImages: [],
  playerOnTop: false,
  restoreFloors: false,
  quickFavorite: false,
  quickFavoriteID: 0,
  bilibiliSimpleNewHomeCompatible: false,
  disableFeedsDetails: true,
  elegantScrollbar: true,
  danmakuSendBar: false,
  watchLaterRedirectNavbar: true,
  watchLaterRedirectPage: true,
  showCoverBeforePlay: false,
  volumeOverdrive: false,
  seoJump: true,
  copyFeedsLink: false,
  copyCommentLink: false,
  unfoldFeeds: true,
  feedsImageExporter: false,
  columnImageExporter: false,
  downloadPackageEmitMode: '打包下载',
  preferAvUrl: false,
  homeHidden: false,
  homeHiddenItems: [],
  favoritesListCurrentSelect: '',
  rememberVideoSpeedList: {},
  rememberVideoSpeed: false,
  extendVideoSpeed: true,
  extendVideoSpeedList: [2.5, 3],
  customKeyBindings: {},
  alwaysShowDuration: false,
  menuRepeatVideo: false,
  removeVideoPopup: true,
  removeGuidePopup: true,
  removeVotePopup: false,
  liveSpeedBoost: false,
  checkInCenter: false,
  fullscreenGiftBox: false,
  autoPlayControl: false,
  scrollOutPlayer: false,
  scrollOutPlayerTriggerPlace: '视频中间',
  scrollOutPlayerAutoPause: true,
  scrollOutPlayerAutoLightOn: true,
  cache: {},
}
const fixedSettings = {
  seedsToCoins: false,
  autoSeedsToCoins: false,
  lastSeedsToCoinsDate: 0,
  useDefaultLiveQuality: false,
  recordLiveDanmaku: false,
  autoContinue: false,
  useDefaultVideoQuality: false,
  guiSettings: true,
  viewCover: true,
  notifyNewVersion: true,
  clearCache: true,
  downloadVideo: true,
  enableDashDownload: true,
  downloadDanmaku: true,
  downloadSubtitle: true,
  downloadAudio: true,
  downloadLiveRecords: true,
  medalHelper: true,
  customNavbarCompact: false,
  latestVersionLink: 'https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/bilibili-evolved.preview.user.js',
  currentVersion: GM.info.script.version,
}
export const settingsChangeHandlers = {}
export function addSettingsListener (key, handler, initCall) {
  if (!settingsChangeHandlers[key]) {
    settingsChangeHandlers[key] = [handler]
  } else {
    settingsChangeHandlers[key].push(handler)
  }
  if (initCall) {
    const value = settings[key]
    handler(value, value)
  }
}
export function removeSettingsListener (key, handler) {
  const handlers = settingsChangeHandlers[key]
  if (!handlers) {
    return
  }
  handlers.splice(handlers.indexOf(handler), 1)
}
export async function loadSettings () {
  for (const key in fixedSettings) {
    settings[key] = fixedSettings[key]
    await GM.setValue(key, fixedSettings[key])
  }
  if (Object.keys(languageCodeToName).includes(navigator.language)) {
    settings.i18n = true
    settings.i18nLanguage = languageCodeToName[navigator.language]
  }
  for (const key in settings) {
    let value = await GM.getValue(key)
    if (key === 'batchFilenameFormat' && value === '[n - ][title]') {
      value = '[n - ][ep]'
      GM.setValue(key, value)
    }
    if (value === undefined) {
      value = settings[key]
      GM.setValue(key, settings[key])
    } else if (settings[key] !== undefined && value.constructor === Object) {
      value = Object.assign(settings[key], value)
    }
    Object.defineProperty(settings, key, {
      get () {
        return value
      },
      set (newValue) {
        value = newValue
        GM.setValue(key, newValue)

        const handlers = settingsChangeHandlers[key]
        if (handlers) {
          if (key === 'useDarkStyle') {
            setTimeout(() => handlers.forEach(h => h(newValue, value)), 200)
          } else {
            handlers.forEach(h => h(newValue, value))
          }
        }
        const input = document.querySelector(`input[key=${key}]`)
        if (input !== null) {
          if (input.type === 'checkbox') {
            input.checked = newValue
          } else if (input.type === 'text' && !input.parentElement.classList.contains('gui-settings-dropdown')) {
            input.value = newValue
          }
        }
      }
    })
  }
}
