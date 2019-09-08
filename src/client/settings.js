export const customNavbarDefaultOrders = {
  blank1: 0,
  logo: 1,
  category: 2,
  rankingLink: 3,
  drawingLink: 4,
  musicLink: 5,
  gamesIframe: 6,
  livesIframe: 7,
  shopLink: 8,
  mangaLink: 9,
  blank2: 10,
  search: 11,
  userInfo: 12,
  messages: 13,
  activities: 14,
  bangumi: 15,
  watchlaterList: 16,
  favoritesList: 17,
  historyList: 18,
  upload: 19,
  blank3: 20,
}
export const aria2RpcDefaultOption = {
  secretKey: '',
  dir: '',
  host: '127.0.0.1',
  port: '6800',
  method: 'get',
  skipByDefault: false,
  maxDownloadLimit: '',
  baseDir: '',
}
export const settings = {
  useDarkStyle: false,
  compactLayout: false,
  // showBanner: true,
  hideBanner: false,
  expandDanmakuList: true,
  expandDescription: true,
  watchLaterRedirect: true,
  touchNavBar: false,
  touchVideoPlayer: false,
  customControlBackgroundOpacity: 0.64,
  customControlBackground: false,
  darkScheduleStart: '18:00',
  darkScheduleEnd: '6:00',
  darkSchedule: false,
  blurVideoControl: false,
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
  useDefaultVideoQuality: false,
  defaultVideoQuality: '自动',
  useDefaultDanmakuSettings: false,
  enableDanmaku: true,
  rememberDanmakuSettings: false,
  danmakuSettings: {
    subtitlesPreserve: false,
    smartMask: false,
  },
  defaultPlayerLayout: '新版',
  defaultBangumiLayout: '旧版',
  useDefaultPlayerLayout: false,
  skipChargeList: false,
  comboLike: false,
  autoLightOff: false,
  useCache: true,
  autoContinue: false,
  allowJumpContinue: false,
  autoPlay: false,
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
  oldTweets: false,
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
    popup: false,
    skin: false,
  },
  customNavbar: true,
  customNavbarFill: false,
  customNavbarShadow: true,
  customNavbarCompact: false,
  customNavbarBlur: true,
  customNavbarBlurOpacity: 0.7,
  customNavbarOrder: { ...customNavbarDefaultOrders },
  customNavbarHidden: [],
  customNavbarBoundsPadding: 5,
  playerShadow: false,
  narrowDanmaku: true,
  favoritesRedirect: true,
  outerWatchlater: true,
  hideOldEntry: true,
  videoScreenshot: false,
  hideBangumiReviews: false,
  filenameFormat: '[title][ - ep]',
  sideBarOffset: 0,
  noLiveAutoplay: false,
  hideHomeLive: false,
  noMiniVideoAutoplay: false,
  useDefaultVideoSpeed: false,
  defaultVideoSpeed: '1.0',
  hideCategory: false,
  foldComment: true,
  downloadVideoDefaultDanmaku: '无',
  aria2RpcOption: {...aria2RpcDefaultOption},
  aria2RpcOptionProfiles: [],
  searchHistory: [],
  seedsToCoins: true,
  autoSeedsToCoins: true,
  lastSeedsToCoinsDate: 0,
  autoDraw: false,
  keymap: false,
  doubleClickFullscreen: false,
  doubleClickFullscreenPreventSingleClick: false,
  simplifyHome: false,
  simplifyHomeStyle: '清爽',
  ajaxHook: false,
  scriptLoadingMode: '自动',
  scriptDownloadMode: 'bundle',
  cache: {},
}
const fixedSettings = {
  guiSettings: true,
  viewCover: true,
  notifyNewVersion: true,
  clearCache: true,
  downloadVideo: true,
  downloadDanmaku: true,
  downloadAudio: true,
  playerLayout: true,
  medalHelper: true,
  about: true,
  forceWide: false,
  useNewStyle: false,
  overrideNavBar: false,
  touchVideoPlayerAnimation: false,
  allNavbarFill: false,
  showDeadVideoTitle: false,
  latestVersionLink: 'https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview.user.js',
  currentVersion: GM_info.script.version,
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
export function loadSettings () {
  for (const key in fixedSettings) {
    settings[key] = fixedSettings[key]
    GM_setValue(key, fixedSettings[key])
  }
  if (Object.keys(languageCodeToName).includes(navigator.language)) {
    settings.i18n = true
    settings.i18nLanguage = languageCodeToName[navigator.language]
  }
  for (const key in settings) {
    let value = GM_getValue(key)
    if (value === undefined) {
      value = settings[key]
      GM_setValue(key, settings[key])
    } else if (settings[key] !== undefined && value.constructor === Object) {
      value = Object.assign(settings[key], value)
    }
    Object.defineProperty(settings, key, {
      get () {
        return value
      },
      set (newValue) {
        value = newValue
        GM_setValue(key, newValue)

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
export function saveSettings (newSettings) {
}
export function onSettingsChange () {
  console.warn('此功能已弃用.')
}
